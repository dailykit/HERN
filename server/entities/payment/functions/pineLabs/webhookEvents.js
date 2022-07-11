import { transactionStatus } from './functions'
import { CART_PAYMENT, BRAND } from '../../graphql'
import { client } from '../../../../lib/graphql'
import get_env from '../../../../../get_env'
import { isEmpty } from 'lodash'

const pineLabsWebhookEvents = async arg => {
   try {
      console.log('==> Pine labs Webhook Called!')
      const host = arg.hostname || arg.headers.host
      const { TransactionNumber: ORDERID, PlutusTransactionReferenceID } =
         arg.body
      const orderId = parseInt(ORDERID.split('-').pop())

      const { cartPayment } = await client.request(CART_PAYMENT, {
         id: orderId
      })

      if (isEmpty(cartPayment.cart) || isEmpty(cartPayment.cart.orderTab)) {
         return { success: false, code: 500, error: 'Cart is not present' }
      }

      const { ResponseCode, TransactionData, ResponseMessage } =
         await transactionStatus({
            TransactionNumber: ORDERID,
            PlutusTransactionReferenceID,
            orderInterface:
               cartPayment.cart.orderTab.availableOrderInterfaceLabel,
            locationKioskId: cartPayment.cart.locationKioskId
         })

      if (ResponseCode !== 0) {
         return {
            success: false,
            code: 200,
            data: {
               cartPaymentId: orderId,
               paymentStatus: 'FAILED'
            }
         }
      }

      const requiredData = {
         cartPaymentId: orderId,
         transactionRemark: TransactionData,
         requestId: ORDERID,
         paymentStatus: ResponseMessage,
         cartId: cartPayment.cartId
      }
      console.log('requiredData', requiredData)

      return {
         success: true,
         signatureIsValid: true,
         code: 200,
         data: requiredData,
         company: 'pinelabs',
         received: true
      }
   } catch (error) {
      return { success: false, code: 500, error }
   }
}

export default pineLabsWebhookEvents
