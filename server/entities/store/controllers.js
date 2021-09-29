import { client } from '../../lib/graphql'
import { GET_STORE_DATA, GET_CUSTOMER } from './graphql/queries'
import { CREATE_CUSTOMER, CREATE_BRAND_CUSTOMER } from './graphql/mutations'

export const getStoreData = async (req, res, next) => {
   try {
      const { clientId, domain, email, keycloakId } = req.body

      if (!domain) {
         return res.status(400).json({
            success: false,
            message: 'domain missing!',
            data: null
         })
      } else {
         const { onDemand_getStoreData } = await client.request(
            GET_STORE_DATA,
            {
               domain
            }
         )

         if (onDemand_getStoreData.length) {
            const { settings, brandId } = onDemand_getStoreData[0]

            if (email && keycloakId) {
               const { customer } = await client.request(GET_CUSTOMER, {
                  keycloakId
               })
               if (customer) {
                  const brandCustomer = customer.brandCustomers.find(
                     record => record.brandId === brandId
                  )
                  if (!brandCustomer) {
                     await client.request(CREATE_BRAND_CUSTOMER, {
                        brandId,
                        keycloakId
                     })
                  }
                  return res.status(200).json({
                     success: true,
                     message: 'Customer and settings fetched!',
                     data: {
                        brandId,
                        settings,
                        customer
                     }
                  })
               } else {
                  const { createCustomer } = await client.request(
                     CREATE_CUSTOMER,
                     {
                        object: {
                           keycloakId,
                           email,
                           source: 'online store',
                           sourceBrandId: brandId,
                           brandCustomers: {
                              data: {
                                 brandId
                              }
                           }
                        }
                     }
                  )
                  return res.status(201).json({
                     success: true,
                     message: 'Customer created and settings fetched!',
                     data: {
                        brandId,
                        settings,
                        customer: createCustomer
                     }
                  })
               }
            } else {
               return res.status(200).json({
                  success: true,
                  message: 'Settings fetched!',
                  data: {
                     brandId,
                     settings
                  }
               })
            }
         } else {
            return res.status(424).json({
               success: false,
               message: 'Failed to fetch settings!',
               data: null
            })
         }
      }
   } catch (err) {
      next(err)
   }
}
