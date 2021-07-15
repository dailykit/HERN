import puppeteer from 'puppeteer'
import express from 'express'
import path from 'path'
import fs from 'fs'
import { GraphQLClient } from 'graphql-request'

import get_env from '../get_env'

const checkExist = require('./utils/checkExist')
const copyFolder = require('./utils/copyFolder')

const router = express.Router()

const format_currency = async (amount = 0) => {
   const currency = await get_env('CURRENCY')
   return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
   }).format(amount)
}

export const root = async (req, res) => {
   try {
      if (!('template' in req.query)) {
         return res.status(400).json({
            success: false,
            error: 'template query param is required!'
         })
      }
      if (!('data' in req.query)) {
         return res
            .status(400)
            .json({ success: false, error: 'data query param is required!' })
      }

      const template = await JSON.parse(req.query.template)
      const data = await JSON.parse(req.query.data)
      let method

      if (template.path) {
         method = require(`${path.join(__dirname, '..', 'templates')}/${
            template.path
         }`)
      } else {
         method = require(`${path.join(__dirname, '..', 'templates')}/${
            template.type
         }/${template.name}/index`)
      }

      const url = await get_env('DATA_HUB')
      const secret = await get_env('HASURA_GRAPHQL_ADMIN_SECRET')
      const client = new GraphQLClient(url, {
         headers: { 'x-hasura-admin-secret': secret }
      })

      const timezone = await get_env('TIMEZONE')

      let result = await method.default({
         data,
         template,
         meta: { client, format_currency, timezone }
      })

      switch (template.format) {
         case 'html':
            return res.send(result)
         case 'pdf': {
            const browser = await puppeteer.launch({
               args: ['--no-sandbox', '--disable-setuid-sandbox']
            })
            const page = await browser.newPage()
            await page.setContent(result)
            const buffer = await page.pdf({
               path: `${template.type}.pdf`
            })
            await browser.close()
            fs.unlinkSync(`${template.type}.pdf`)
            res.type('application/pdf')
            return res.send(buffer)
         }
         default:
            throw Error('Invalid Format')
      }
   } catch (error) {
      return res.status(400).json({ success: false, error: error.message })
   }
}

export const download = async (req, res) => {
   try {
      const src = `/${req.params.path}`
      const dest = await checkExist(src)
      const result = await copyFolder(src, dest)
      res.send(result)
   } catch (err) {
      console.log(err)
   }
}

export const hydrateFold = async (req, res) => {
   console.log('Incoming!')
   res.send('OK')
}

router.get('/', root)
router.post('/hydrate-fold', hydrateFold)
router.post('/download/:path(*)', download)
router.use('/files', express.static(__dirname + '../..' + '/templates'))

export default router
