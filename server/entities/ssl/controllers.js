import sslChecker from 'ssl-checker'
import { getUrlDetails, checkDNSRecordStatus } from '../../utils'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

const createFile = (filePath, content) => {
   const parentDir = path.dirname(filePath)
   console.log('parentDir', parentDir)
   console.log('dir check', fs.existsSync(parentDir))
   if (fs.existsSync(path.join(parentDir))) {
      fs.writeFileSync(filePath, content)
   } else {
      console.log('dir creating', fs.existsSync(parentDir))
      fs.mkdirSync(parentDir, { recursive: true })
      console.log('dir created', fs.existsSync(parentDir))
      fs.writeFileSync(filePath, content)
   }
}

export const verify = async (req, res) => {
   try {
      // const { domain } = req.event.body.new
      const { domain } = req.body
      const hostname = getUrlDetails(
         'https://testhern.dailykit.org/' || process.env.DATA_HUB
      ).hostname
      const platformUrl = 'http://localhost:7000/api/ssl'

      const cnameResponse = await checkDNSRecordStatus({
         type: 'CNAME',
         name: domain
      })
      const isCNameVerified = cnameResponse.includes(hostname)
      const getSslDetails = await sslChecker(domain)

      if (
         getSslDetails &&
         getSslDetails.isValid &&
         getSslDetails.daysRemaining < 10 &&
         isCNameVerified
      ) {
         return res.send({
            status: 'success',
            message: 'SSL Certificate is valid and expires in less than 10 days'
         })
      }
      if (!isCNameVerified) {
         return res.send({
            status: 'not-verified',
            message: 'CNAME record is not verified',
            cnameResponse
         })
      }

      const { data } = await axios.post(`${platformUrl}/create`, {
         certificate_domains: domain
      })

      if (data.success) {
         const { id, validation } = data
         console.log(validation.other_methods)
         const filePath = validation.other_methods[
            domain
         ].file_validation_url_http.replace('http://', '')
         const fileContent =
            validation.other_methods[domain].file_validation_content
         await createFile(
            path.join(process.cwd(), '/hern/brandSsl', filePath),
            JSON.stringify(fileContent.join('\n'))
         )
         const verifyResponse = await axios.post(`${platformUrl}/verify`, {
            id
         })
         if (verifyResponse.data.success) {
            const downloadResponse = await axios.post(
               `${platformUrl}/download`,
               {
                  id
               }
            )
            if (downloadResponse.data.success) {
               const { cert, privateKey } = downloadResponse.data
               const certificateFilePath = path.join(
                  process.cwd(),
                  `/hern/brandSsl/certs/${domain}`,
                  '/certificate.crt'
               )
               const privateKeyFilePath = path.join(
                  process.cwd(),
                  `/hern/brandSsl/certs/${domain}`,
                  '/private.key'
               )
               await createFile(certificateFilePath, cert)
               await createFile(privateKeyFilePath, privateKey)
               if (
                  fs.existsSync(certificateFilePath) &&
                  fs.existsSync(privateKeyFilePath)
               ) {
                  return res.status(200).send({
                     success: true,
                     message:
                        'SSL Certificate is downloaded and created successfully',
                     data: { ssl: getSslDetails, cname: isCNameVerified }
                  })
               }
            }
         }
      }

      res.json({ ssl: getSslDetails, cnameResponse, cname: isCNameVerified })
   } catch (error) {
      console.log('throwing errors.: ', error)
      res.status(500).json(error)
   }
}

// hern/brandSsl/$host.wellknown/pki-validation/c7b9f8f7.txt
// hern/brandSsl/$host/certs/certificate.crt
// hern/brandSsl/$host/certs/private.key
