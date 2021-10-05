import cors from 'cors'

import request from 'request'
import fs from 'fs'
import path from 'path'
import express from 'express'
import morgan from 'morgan'
import AWS from 'aws-sdk'
import bluebird from 'bluebird'
import depthLimit from 'graphql-depth-limit'

import get_env from './get_env'

import ServerRouter from './server'
import schema from './template/schema'
import TemplateRouter from './template'
import { createEnvFiles } from './server/entities'
import ayrshareSchema from './server/ayrshare/src/schema/index'

require('dotenv').config()
const { createProxyMiddleware } = require('http-proxy-middleware')
const { ApolloServer } = require('apollo-server-express')
const ohyaySchema = require('./server/streaming/ohyay/src/schema/schema')

const app = express()

const setupForStripeWebhooks = {
   // Because Stripe needs the raw body, we compute it but only when hitting the Stripe callback URL.
   verify: (req, res, buf) => {
      const url = req.originalUrl
      if (url.startsWith('/server/api/payment/handle-payment-webhook')) {
         req.rawBody = buf.toString()
      }
   }
}

// Middlewares
app.use(cors())
app.use(express.json(setupForStripeWebhooks))
app.use(express.urlencoded({ extended: true }))
app.use(
   morgan(
      '[:status :method :url] :remote-user [:date[clf]] - [:user-agent] - :response-time ms'
   )
)

AWS.config.update({
   accessKeyId: get_env('AWS_ACCESS_KEY_ID'),
   secretAccessKey: get_env('AWS_SECRET_ACCESS_KEY')
})

AWS.config.setPromisesDependency(bluebird)

const PORT = process.env.PORT || 4000

// serves dailyos-backend endpoints for ex. hasura event triggers, upload, parseur etc.
app.use('/server', ServerRouter)
/*
serves build folder of admin

For resource files, the first app.use(/apps) code is used.
For later react router requests, app.use(/apps/:path(*)) is used

Why and how it works? Tell us and win 1000 rs!
*/

app.use('/apps', (req, res, next) => {
   if (process.env.NODE_ENV === 'development') {
      return createProxyMiddleware({
         target: 'http://localhost:8000',
         changeOrigin: true
      })(req, res, next)
   }

   express.static('admin/build')(req, res, next)
})

app.use('/apps/:path(*)', (req, res, next) => {
   if (process.env.NODE_ENV === 'development') {
      return createProxyMiddleware({
         target: 'http://localhost:8000',
         changeOrigin: true
      })(req, res, next)
   }
   console.log(req.params)

   express.static('admin/build')(req, res, next)
})
/*
handles template endpoints for ex. serving labels, sachets, emails in pdf or html format

/template/?template={"name":"bill1","type":"bill","format":"pdf"}&data={"id":"1181"}
*/
app.use('/template', TemplateRouter)

const isProd = process.env.NODE_ENV === 'production'

const proxy = createProxyMiddleware({
   target: 'http://localhost:3000',
   changeOrigin: true,
   onProxyReq: (proxyReq, req) => {
      if (req.body) {
         const bodyData = JSON.stringify(req.body)
         proxyReq.setHeader('Content-Type', 'application/json')
         proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
         proxyReq.write(bodyData)
      }
   }
})

/*
request on test.dailykit.org forwards to http://localhost:3000
*/
app.use('/api/:path(*)', proxy)

const RESTRICTED_FILES = ['env-config.js', 'favicon', '.next', '_next']

/*
catches routes of subscription shop

test.dailykit.org/menu
*/
const serveSubscription = async (req, res, next) => {
   //     Subscription shop: Browser <-> Express <-> NextJS
   try {
      const { path: routePath } = req.params
      const { preview } = req.query
      const { host } = req.headers
      const brand = host.replace(':', '')

      /*
      -> user requests test.dailykit.org/menu
      -> extracts brand i.e test.dailykit.org
      -> test.dailykit.org/test.dailykit.org/menu
      -> network request to above url and returns response back to browser

      during development
         -> serves via running next dev
      during production
         -> serves via running next build && next start
      */
      if (process.env.NODE_ENV === 'development') {
         const url = RESTRICTED_FILES.some(file => routePath.includes(file))
            ? `http://localhost:3000/${routePath}`
            : `http://localhost:3000/${brand}/${routePath}`
         request(url, (error, _, body) => {
            if (error) {
               throw error
            } else {
               res.send(body)
            }
         })
      } else {
         const isAllowed = !RESTRICTED_FILES.some(file =>
            routePath.includes(file)
         )
         if (isAllowed) {
            const filePath =
               routePath === ''
                  ? path.join(
                       __dirname,
                       `./store/.next/server/pages/${brand}.html`
                    )
                  : path.join(
                       __dirname,
                       `./store/.next/server/pages/${brand}/${routePath}.html`
                    )

            /*
               SSR: Server Side Rendering
               ISR: Incremental Server Regeneration
               SSG: Server Side Generation

               with preview requests are served via .next
            */
            if (fs.existsSync(filePath) && preview !== 'true') {
               res.sendFile(filePath)
            } else {
               const url = RESTRICTED_FILES.some(file =>
                  routePath.includes(file)
               )
                  ? `http://localhost:3000/${routePath}`
                  : `http://localhost:3000/${brand}/${routePath}`
               request(url, (error, _, body) => {
                  if (error) {
                     console.log(error)
                  } else {
                     res.send(body)
                  }
               })
            }
         } else if (routePath.includes('env-config.js')) {
            res.sendFile(path.join(__dirname, 'store/public/env-config.js'))
         } else {
            res.sendFile(
               path.join(__dirname, routePath.replace('_next', 'store/.next'))
            )
         }
      }
   } catch (error) {
      res.status(404).json({ success: false, error: 'Page not found!' })
   }
}

/*
manages files in templates folder
*/
const apolloserver = new ApolloServer({
   schema,
   playground: {
      endpoint: `/template/graphql`
   },
   introspection: true,
   validationRules: [depthLimit(11)],
   formatError: err => {
      console.log(err)
      if (err.message.includes('ENOENT'))
         return isProd ? new Error('No such folder or file exists!') : err
      return isProd ? new Error(err) : err
   },
   debug: true,
   context: async () => ({
      root: await get_env('FS_PATH'),
      media: await get_env('MEDIA_PATH')
   })
})

apolloserver.applyMiddleware({ app, path: `/template/graphql` })

// ohyay remote schema integration
const ohyayApolloserver = new ApolloServer({
   schema: ohyaySchema,
   playground: {
      endpoint: `/ohyay/graphql`
   },
   introspection: true,
   validationRules: [depthLimit(11)],
   formatError: err => {
      console.log(err)
      if (err.message.includes('ENOENT'))
         return isProd ? new Error('No such folder or file exists!') : err
      return isProd ? new Error(err) : err
   },
   debug: true,
   context: ({ req }) => {
      const ohyay_api_key = req.header('ohyay_api_key')
      return { ohyay_api_key }
   }
})

ohyayApolloserver.applyMiddleware({ app, path: '/ohyay/graphql' })

// ayrshare remote schema integration
const ayrshareApolloserver = new ApolloServer({
   schema: ayrshareSchema,
   playground: {
      endpoint: `/ayrshare/graphql`
   },
   introspection: true,
   validationRules: [depthLimit(11)],
   formatError: err => {
      console.log(err)
      return isProd ? new Error(err) : err
   },
   debug: true,
   context: ({ req }) => {
      const ayrshare_api_key = req.header('ayrshare_api_key')
      return { ayrshare_api_key }
   }
})

ayrshareApolloserver.applyMiddleware({ app, path: '/ayrshare/graphql' })

app.use('/:path(*)', serveSubscription)

app.listen(PORT, () => {
   console.log(`Server started on ${PORT}`)

   if (process.env.NODE_ENV !== 'development') {
      createEnvFiles()
   }
})
