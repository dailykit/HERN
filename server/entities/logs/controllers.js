import fs from 'fs'
import path from 'path'

export const requests = (req, res) => {
   fs.readFile(
      path.join(__dirname + '../../../logs/requests.log'),
      'utf8',
      (error, data) => {
         if (error) {
            return res.json({ success: false, error: error.message })
         }
         return res.send(data.split(/\r\n|\r|\n/).filter(Boolean))
      }
   )
}

export const errors = (req, res) => {
   fs.readFile(
      path.join(__dirname + '../../../logs/errors.log'),
      'utf8',
      (error, data) => {
         if (error) {
            return res.json({ success: false, error: error.message })
         }
         return res.send(data.split(/\r\n|\r|\n/).filter(Boolean))
      }
   )
}
