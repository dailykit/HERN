import { client } from '../../lib/graphql'
import {
   BRAND_CUSTOMER_AND_DEVICE_ID,
   INSERT_BRAND_CUSTOMER,
   INSERT_BRAND_CUSTOMER_ID_DEVICE_ID,
   INSERT_CUSTOMER,
   OTPS,
   PLATFORM_CUSTOMER
} from './graphql'
import * as jwt from 'jsonwebtoken'
import get_env from '../../../get_env'

export const authHandler = async (req, res) => {
   const { authType } = JSON.parse(req.query.authDetails)
   console.log('authType', JSON.parse(req.query.authDetails))
   if (authType === 'otp') {
      const {
         phoneNumber,
         otp,
         email = null,
         notificationToken,
         brandId
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
                        phoneNumber: phoneNumber
                     }
                  }
               )
               await client.request(INSERT_BRAND_CUSTOMER, {
                  object: {
                     sourceBrandId: brandId,
                     brandCustomers: {
                        data: {
                           brandId: brandId
                        }
                     },
                     email: email,
                     keycloakId: insertCustomer.id
                  }
               })
               customerInfo = insertCustomer
            }

            // get brand customer and mobile device id
            const { brandCustomers = [], deviceHub_mobileDevice = [] } =
               await client.request(BRAND_CUSTOMER_AND_DEVICE_ID, {
                  where: {
                     keycloakId: {
                        _eq: customerInfo.id
                     },
                     brandId: {
                        _eq: brandId
                     }
                  },
                  where1: {
                     notificationToken: {
                        _eq: notificationToken
                     }
                  }
               })
            // insert new entry for brandCustomerId with mobileDeviceId
            await client.request(INSERT_BRAND_CUSTOMER_ID_DEVICE_ID, {
               object: {
                  brandCustomerId: brandCustomers[0].id,
                  mobileDeviceId: deviceHub_mobileDevice[0].id
               }
            })

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
