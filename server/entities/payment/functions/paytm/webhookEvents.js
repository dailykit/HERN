import PaytmChecksum from 'paytmchecksum'
import paytm from '../../../../lib/paytm'
import get_env from '../../../../../get_env'

const razorpayWebhookEvents = async arg => {
   try {
      console.log('arg', arg.body)
      const _Paytm = await paytm()
      const { CHECKSUMHASH: incomingChecksumHas, ORDERID } = arg.body
      const orderId = parseInt(ORDERID)
      const PAYTM_MERCHANT_ID =
         'IMnPLs13302441482874' || (await get_env('PAYTM_MERCHANT_ID'))
      const PAYTM_MERCHANT_KEY =
         'A5npkiMoy@zOrIlX' || (await get_env('PAYTM_MERCHANT_KEY'))
      const PAYTM_WEBSITE = 'WEBSTAGING' || (await get_env('PAYTM_WEBSITE'))
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
      const requiredData = {
         cartPaymentId: orderId,
         transactionRemark: body,
         requestId: orderId.toString(),
         paymentStatus: body.resultInfo.resultStatus,
         transactionId: body.txnId
      }
      console.log('requiredData', requiredData)
      return {
         success: true,
         signatureIsValid: true,
         code: 200,
         data: requiredData,
         received: true
      }
   } catch (error) {
      return { success: false, code: 500, error }
   }
}

export default razorpayWebhookEvents
