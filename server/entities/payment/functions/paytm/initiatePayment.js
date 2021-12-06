import _isEmtpy from 'lodash/isEmpty'
import paytm from '../../../../lib/paytm'
import { logger, paymentLogger } from '../../../../utils'

const initiatePayment = async arg => {
   try {
      const {
         id: cartPaymentId,
         statementDescriptor,
         stripeInvoiceId,
         paymentMethodId: paymentMethod,
         paymentCustomerId,
         requires3dSecure,
         amount,
         oldAmount
      } = arg
      console.log('initiating paytm instance')
      const _Paytm = await paytm()
      const channelId = _Paytm.EChannelId.WEB
      const orderId = `ORDERID_${cartPaymentId}`
      const txnAmount = _Paytm.Money.constructWithCurrencyAndValue(
         _Paytm.EnumCurrency.INR,
         amount.toFixed(2)
      )
      const userInfo = new _Paytm.UserInfo(`CUST_${new Date().getTime()}`)
      userInfo.setAddress('CUSTOMER_ADDRESS')
      userInfo.setEmail('deepak@yopmail.com')
      userInfo.setFirstName('Deepak')
      userInfo.setLastName('Negi')
      userInfo.setMobile('9934270925')
      userInfo.setPincode('110023')
      const paymentDetailBuilder = new _Paytm.PaymentDetailBuilder(
         channelId,
         orderId,
         txnAmount,
         userInfo
      )
      const paymentDetail = paymentDetailBuilder.build()
      const response = await _Paytm.Payment.createTxnToken(paymentDetail)
      const { txnToken } = response.responseObject.body
      console.log('txnToken', txnToken, response.responseObject.body)
      if (_isEmtpy(response) && _isEmtpy(response.responseObject)) {
         return {
            success: false,
            message: 'Failed to create order'
         }
      }
      await paymentLogger({
         cartPaymentId,
         transactionRemark: response.responseObject,
         requestId: orderId,
         paymentStatus: 'PENDING',
         transactionId: txnToken
      })
      return {
         success: true,
         data: response,
         message: 'Order created via paytm'
      }
   } catch (error) {
      console.log('error from paytm initiatePayment', error)
      logger('/api/payment-intent', error)
      return {
         success: false,
         error: error.message
      }
   }
}

export default initiatePayment
