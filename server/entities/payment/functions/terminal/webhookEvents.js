import { CART_PAYMENT } from '../../graphql'
import { client } from '../../../../lib/graphql'
import get_env from '../../../../../get_env'

const terminalWebhookEvents = async arg => {
   try {
      console.log(arg.body)
      // const { cartPayment } = await client.request(CART_PAYMENT, {
      //    id: orderId
      // })
      // const requiredData = {
      //    cartPaymentId: orderId,
      //    transactionRemark: body,
      //    requestId: orderId.toString(),
      //    paymentStatus: body.resultInfo.resultStatus,
      //    transactionId: body.txnId,
      //    cartId: cartPayment.cartId
      // }
      // console.log('requiredData', requiredData)

      return {
         success: true,
         code: 200,
         data: {}
      }
   } catch (error) {
      return { success: false, code: 500, error }
   }
}

export default terminalWebhookEvents
