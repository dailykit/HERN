import glob from 'glob'
import path from 'path'
import fs from 'fs'

export default async function handler(req, res) {
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
            const filePath = item
               .replace(dirnameToReplace, '')
               .replace('.html', '')
            const updatedFilePath =
               process.env.NEXT_PUBLIC_NODE_ENV === 'development'
                  ? filePath.replace(`/${brand}/`, '')
                  : filePath
            console.log('updatedFilePath', updatedFilePath)
            await res.unstable_revalidate(`/${updatedFilePath}`)
            return {
               path:
                  process.env.NEXT_PUBLIC_NODE_ENV === 'development'
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
