import { CART_PAYMENT } from '../../graphql'
import { client } from '../../../../lib/graphql'
import get_env from '../../../../../get_env'

const terminalWebhookEvents = async arg => {
   try {
      const { cartPaymentId, status, transactionId } = arg.body
      const requiredData = {
         cartPaymentId,
         transactionRemark: arg.body,
         paymentStatus: status,
         transactionId
      }
      console.log('requiredData', requiredData)

      return {
         success: true,
         code: 200,
         data: requiredData
      }
   } catch (error) {
      return { success: false, code: 500, error }
   }
}

export default terminalWebhookEvents
