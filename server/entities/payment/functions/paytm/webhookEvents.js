import PaytmChecksum from 'paytmchecksum'

import { CART_PAYMENT } from '../../graphql'
import paytm from '../../../../lib/paytm'
import { client } from '../../../../lib/graphql'
import get_env from '../../../../../get_env'

const razorpayWebhookEvents = async arg => {
   try {
      console.log('arg', arg.body)
      const host = arg.hostname || arg.headers.host
      const _Paytm = await paytm(host)
      const { CHECKSUMHASH: incomingChecksumHas, ORDERID } = arg.body
      const orderId = parseInt(ORDERID)
      const PAYTM_MERCHANT_KEY =
         process.env.PAYTM_MERCHANT_KEY || (await get_env('PAYTM_MERCHANT_KEY'))
      var isVerifySignature = PaytmChecksum.verifySignature(
         arg.body,
         PAYTM_MERCHANT_KEY,
         incomingChecksumHas
      )
      console.log('isVerifySignature', isVerifySignature)
      if (!isVerifySignature) {
         console.log('Checksum Mismatched')
         return {
            success: false,
            signatureIsValid: false,
            code: 500,
            error: 'Signature is not valid'
         }
      }
      console.log('Checksum Matched')
      const readTimeout = 8000
      const paymentStatusDetailBuilder = new _Paytm.PaymentStatusDetailBuilder(
         orderId.toString()
      )
      const paymentStatusDetail = paymentStatusDetailBuilder
         .setReadTimeout(readTimeout)
         .build()
      const response = await _Paytm.Payment.getPaymentStatus(
         paymentStatusDetail
      )
      const { body } = response.responseObject
      console.log('body', body)
      const { cartPayment } = await client.request(CART_PAYMENT, {
         id: orderId
      })
      const requiredData = {
         cartPaymentId: orderId,
         transactionRemark: body,
         requestId: orderId.toString(),
         paymentStatus: body.resultInfo.resultStatus,
         transactionId: body.txnId,
         cartId: cartPayment.cartId
      }
      console.log('requiredData', requiredData)

      return {
         success: true,
         signatureIsValid: true,
         code: 200,
         data: requiredData,
         company: 'paytm',
         received: true
      }
   } catch (error) {
      return { success: false, code: 500, error }
   }
}

export default razorpayWebhookEvents
