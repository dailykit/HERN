import glob from 'glob'
import path from 'path'
import fs from 'fs'
import Cors from 'cors'

const cors = Cors({
   methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
   origin: '*',
   optionsSuccessStatus: 200,
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
   return new Promise((resolve, reject) => {
      fn(req, res, result => {
         if (result instanceof Error) {
            console.log('reject')
            return reject(result)
         }
         console.log('resolve')
         return resolve(result)
      })
   })
}

export default async function handler(req, res) {
   // Run the middleware
   console.log('inside revalidate')
   await runMiddleware(req, res, cors)

   const content = await fs.readFileSync(
      process.cwd() + '/../hern/env-config.js',
      'utf-8'
   )
   const config = JSON.parse(content.replace('window._env_ = ', ''))

   const hostname = req.headers['host']
   const brand = hostname.replace(':', '')
   console.log('brand', brand)
   const revalidateTokenFromHeader = req.headers['revalidate-token']
   const revalidateTokenFromEnv = config['REVALIDATE_TOKEN']
   const NODE_ENV = config['NODE_ENV']

   // Check for secret to confirm this is a valid request
   if (revalidateTokenFromHeader !== revalidateTokenFromEnv) {
      return res.status(401).json({ message: 'Invalid token' })
   }

   try {
      // get all nested html files from .next/server/pages
      const paths = glob.sync(path.join(__dirname + `/../${brand}/**/*.html`))
      const dirnameToReplace = __dirname.replace(/\\/g, '/').replace('/api', '')
      const filePaths = await Promise.all(
         paths.map(async item => {
            const startTime = Date.now()
            const filePath = item
               .replace(dirnameToReplace, '')
               .replace('.html', '')
            const updatedFilePath =
               NODE_ENV === 'development'
                  ? filePath.replace(`/${brand}/`, '')
                  : filePath
            console.log('updatedFilePath', updatedFilePath)
            await res.unstable_revalidate(`/${updatedFilePath}`)
            return {
               path:
                  NODE_ENV === 'development'
                     ? `http://localhost:3000/${updatedFilePath}`
                     : `https://${updatedFilePath}`,
               status: 'revalidated',
               timeTaken: Date.now() - startTime,
            }
         })
      )
      return res.json({ revalidated: true, filePaths })
   } catch (err) {
      // If there was an error, Next.js will continue
      // to show the last successfully generated page
      console.log(err)
      return res.status(500).json({ success: false, message: err.message })
   }
}
