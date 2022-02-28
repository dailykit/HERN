import glob from 'glob'
import path from 'path'

export default async function handler(req, res) {
   const hostname = req.headers['host']
   const brand = hostname.replace(':', '')
   // Check for secret to confirm this is a valid request
   //    if (req.query.secret !== process.env.MY_SECRET_TOKEN) {
   //       return res.status(401).json({ message: 'Invalid token' })
   //    }

   try {
      // get all nested html files from .next/server/pages
      glob(__dirname + `/../${brand}/**/*.html`, {}, (err, files) => {
         files.forEach(async file => {
            const pathName = file
               .replace(/^.+\.{2,}\//g, '')
               .replace(brand, '')
               .replace('.html', '')
            await res.unstable_revalidate(pathName)
         })
      })
      return res.json({ revalidated: true })
   } catch (err) {
      // If there was an error, Next.js will continue
      // to show the last successfully generated page
      console.log(err)
      return res.status(500).send('Error revalidating')
   }
}
