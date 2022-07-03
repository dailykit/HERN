import { client } from '../../lib/graphql'
import { INSERT_CUSTOMER, OTPS, PLATFORM_CUSTOMER } from './graphql'
import * as jwt from 'jsonwebtoken'
import get_env from '../../../get_env'

export const authHandler = async (req, res) => {
   const { authType } = JSON.parse(req.query.authDetails)
   console.log('authType', JSON.parse(req.query.authDetails))
   if (authType === 'otp') {
      const {
         phoneNumber,
         otp,
         email = null
      } = JSON.parse(req.query.authDetails)
      if (!Boolean(phoneNumber) || !Boolean(otp)) {
         res.status(404).json({
            message: `Provide${!Boolean(phoneNumber) ? ' phoneNumber' : ''}${
               !Boolean(phoneNumber) && !Boolean(otp) ? ' and' : ''
            }${!Boolean(otp) ? ' otp' : ''}`
         })
      }
      const { otps = [] } = await client.request(OTPS, {
         where: { phoneNumber: { _eq: phoneNumber } }
      })
      if (otps.length > 0) {
         const [firstOtp] = otps
         if (Number(otp) === firstOtp.code) {
            const { platform_customer = [] } = await client.request(
               PLATFORM_CUSTOMER,
               {
                  where: { phoneNumber: { _eq: phoneNumber } }
               }
            )
            let customerInfo
            if (platform_customer.length > 0) {
               const [customer] = platform_customer
               customerInfo = customer
            } else {
               const { insertCustomer = {} } = await client.request(
                  INSERT_CUSTOMER,
                  {
                     object: {
                        ...(email && {
                           email: email
                        }),
                        phoneNumber: credentials.phone
                     }
                  }
               )
               customerInfo = insertCustomer
            }
            const secretKey = await get_env('HASURA_GRAPHQL_ADMIN_SECRET')

            const token = jwt.sign({ ...customerInfo }, secretKey, {
               expiresIn: '365d'
            })
            return res.status(200).json({
               token
            })
         }
         return res.status(400).json({
            message: 'Incorrect OTP'
         })
      }
      return res.status(400).json({
         message: 'OTP not available'
      })
   }
   return res.status(400).json({
      message: 'There should be a authType.'
   })
}
