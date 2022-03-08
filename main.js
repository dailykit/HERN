import cors from 'cors'

import express from 'express'
import morgan from 'morgan'
import AWS from 'aws-sdk'
import bluebird from 'bluebird'
import depthLimit from 'graphql-depth-limit'

import get_env from './get_env'

import ServerRouter from './server'
import schema from './dailygit/schema'
import { createEnvFiles, syncEnvsFromPlatform } from './server/entities'
import ayrshareSchema from './server/ayrshare/src/schema/index'

require('dotenv').config()
const { createProxyMiddleware } = require('http-proxy-middleware')
const { ApolloServer } = require('apollo-server-express')
const ohyaySchema = require('./server/streaming/ohyay/src/schema/schema')

const app = express()

const setupForStripeWebhooks = {
   // Because Stripe needs the raw body, we compute it but only when hitting the Stripe callback URL.
   verify: (req, res, buf, encoding) => {
      const url = req.originalUrl
      if (url.startsWith('/server/api/payment/handle-payment-webhook')) {
         req.rawBody = buf.toString(encoding || 'utf8')
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

const isProd = process.env.NODE_ENV === 'production'

const templateProxy = createProxyMiddleware({
   target: 'http://localhost:5000',
   changeOrigin: true,
   pathRewrite: {
      '^/template': ''
   },
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
app.use('/template', templateProxy)

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

app.listen(PORT, () => {
   console.log(`Server started on ${PORT}`)
})
