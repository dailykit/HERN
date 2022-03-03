import sslChecker from 'ssl-checker'
import { getUrlDetails, checkDNSRecordStatus } from '../../utils'
export const verify = async (req, res) => {
   try {
      // const { domain } = req.event.body.new
      const hostname = getUrlDetails(process.env.DATA_HUB).hostname
      const cnameResponse = await checkDNSRecordStatus({
         type: 'CNAME',
         name: hostname
      })
      const getSslDetails = await sslChecker(hostname)

      res.json({ ssl: getSslDetails, cname: cnameResponse })
   } catch (error) {
      console.log('throwing errors.: ', error)
      res.status(500).json(error)
   }
}
