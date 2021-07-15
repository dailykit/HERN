const express = require('express')
const request = require('request')
const fs = require('fs')
const path = require('path')

const app = express()

const RESTRICTED_FILES = ['env-config.js', 'favicon', '.next', '_next']

app.use('/:path(*)', async (req, res, next) => {
   //     Browser <-> Express <-> NextJS

   const { path: routePath } = req.params
   const { host } = req.headers
   const brand = host.replace(':', '')

   const isAllowed = !RESTRICTED_FILES.some(file => routePath.includes(file))
   if (isAllowed) {
      const filePath =
         routePath === ''
            ? path.join(__dirname, `./.next/server/pages/${brand}.html`)
            : path.join(
                 __dirname,
                 `./.next/server/pages/${brand}/${routePath}.html`
              )
      if (fs.existsSync(filePath)) {
         res.sendFile(filePath)
      } else {
         const url = RESTRICTED_FILES.some(file => routePath.includes(file))
            ? 'http://localhost:3000/' + routePath
            : 'http://localhost:3000/' + brand + '/' + routePath
         request(url, function (error, _, body) {
            if (error) {
               console.log(error)
            } else {
               res.send(body)
            }
         })
      }
   } else {
      if (routePath.includes('env-config.js')) {
         res.sendFile(path.join(__dirname, 'public/env-config.js'))
      } else {
         res.sendFile(path.join(__dirname, routePath.replace('_next', '.next')))
      }
   }
})

app.listen(4000, () => {
   console.log('App started on 4000!')
})
