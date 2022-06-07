import axios from 'axios'
import CryptoJS from 'crypto-js'
import get_env from '../../../get_env'
import { getUrlDetails } from '../../utils'

export const getInvoice = async (req, res) => {
   const { detail } = req.params
   const secretKey = await get_env('HASURA_GRAPHQL_ADMIN_SECRET')
   const detailBytes = CryptoJS.AES.decrypt(detail, secretKey)
   const decryptDetail = JSON.parse(detailBytes.toString(CryptoJS.enc.Utf8))

   const { template, data } = decryptDetail

   const format = template.format

   const hostName = getUrlDetails(process.env.DATA_HUB).hostname

   try {
      const invoice = await axios.get(
         `https://${hostName}/template/?template=${JSON.stringify(
            template
         )}&data=${JSON.stringify(data)}`,
         {
            ...(format === 'pdf' && { responseType: 'arraybuffer' })
         }
      )
      if (invoice.status === 200) {
         if (format === 'pdf') {
            res.type('application/pdf')
            return res.send(invoice.data)
         }
         return res.send(invoice.data)
      }
   } catch (error) {
      console.error('error', error)
      res.send({ error })
   }
}
