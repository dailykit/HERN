import { isEmpty } from 'lodash'
import { client } from '../../lib/graphql'
import { sendExpoNotification } from '../../utils/expoNotification'

const GET_BRAND = `query GET_BRAND($id: Int!) {
   brand(id: $id) {
     domain
     title
   }
 }
`
const GET_MOBILE_DEVICE_IDS = `query GET_MOBILE_DEVICE_ID($where: crm_brand_customer_bool_exp!) {
   brandCustomers(where: $where) {
     brand_customer_devices {
       mobileDeviceId
     }
   }
 }
 `

const GET_NOTIFICATION_TOKENS = `query MyQuery($where: deviceHub_mobileDevice_bool_exp!) {
   deviceHub_mobileDevice(where: $where) {
     notificationToken
   }
 }
 `
export const sendOrderStatusNotification = async (req, res) => {
   try {
      const {
         status,
         brandId,
         customerKeycloakId,
         id: cartId
      } = req.body.event.data.new

      // get brand detail
      const { brand = {} } = await client.request(GET_BRAND, {
         id: brandId
      })

      // get notification token
      const { brandCustomers = [] } = await client.request(
         GET_MOBILE_DEVICE_IDS,
         {
            where: {
               keycloakId: {
                  _eq: customerKeycloakId
               },
               brandId: {
                  _eq: brandId
               }
            }
         }
      )

      const mobileDeviceIds = brandCustomers[0].brand_customer_devices.map(
         eachDevice => eachDevice.mobileDeviceId
      )

      const { deviceHub_mobileDevice = [] } = await client.request(
         GET_NOTIFICATION_TOKENS,
         {
            where: {
               id: {
                  _in: mobileDeviceIds
               }
            }
         }
      )

      const flatNotificationTokens = deviceHub_mobileDevice.map(
         eachToken => eachToken.notificationToken
      )

      let [title, body, data] = [
         '',
         '',
         {
            screen: 'OrderTracking',
            cartId: cartId
         }
      ]
      switch (status) {
         case 'ORDER_PENDING':
            {
               title = `Your order has been placed with ${brand.title}`
               body = 'Tap here to track your order'
            }
            break
         case 'ORDER_UNDER_PROCESSING':
            {
               title = `Your order is being prepared.`
               body = 'Tap here to track your order'
            }
            break
         case 'ORDER_READY_TO_DISPATCH':
            {
               title = `Your order is ready to dispatch.`
               body = 'Tap here to track your order'
            }
            break
         case 'ORDER_OUT_FOR_DELIVERY':
            {
               title = `Your order is on the way, it will reach you soon.`
               body = 'Tap here to track your order'
            }
            break
         case 'ORDER_DELIVERED':
            {
               title = `Your order has been delivered, enjoy your meal.`
               body = 'Tap here to see order details'
               data = {
                  screen: 'OrderDetail',
                  cartId: cartId
               }
            }
            break
         default: {
            title = ''
            body = ''
            data = {}
         }
      }
      if (!isEmpty(title) && !isEmpty(body)) {
         const result = await sendExpoNotification({
            title,
            body,
            notificationTokens: flatNotificationTokens,
            data
         })
         if (result.status !== 'ok') {
            res.status(400).json({
               success: false,
               message: result.message
            })
         } else {
            res.status(200).json({
               success: true,
               message: 'Notification has been sent successfully'
            })
         }
      } else {
         res.status(400).json({
            success: false,
            message: 'Order status not matched'
         })
      }
   } catch (err) {
      return res.status(400).json({
         success: false,
         message: err
      })
   }
}
