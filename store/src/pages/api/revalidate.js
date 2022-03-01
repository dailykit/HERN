import glob from 'glob'
import path from 'path'
import fs from 'fs'

export default async function handler(req, res) {
   const content = await fs.readFileSync(
      process.cwd() + '/public/env-config.js',
      'utf-8'
   )
   const config = JSON.parse(content.replace('window._env_ = ', ''))

   const hostname = req.headers['host']
   const brand = hostname.replace(':', '')
   const revalidateTokenFromHeader = req.headers['revalidate-token']
   const revalidateTokenFromEnv = config['REVALIDATE_TOKEN']

   // console.log({
   //    secret: revalidateTokenFromHeader,
   //    env: revalidateTokenFromEnv,
   // })

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
            console.log('logging item', item)
            const filePath = item
               .replace(dirnameToReplace, '')
               .replace(`/${brand}`, '')
               .replace('.html', '')
            await res.unstable_revalidate(filePath)
            return {
               path: hostname + filePath,
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
