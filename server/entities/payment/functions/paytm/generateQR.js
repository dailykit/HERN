import _isEmtpy from 'lodash/isEmpty'
const PaytmChecksum = require('PaytmChecksum')
const axios = require('axios')
import { CART } from '../../graphql'
import { client } from '../../../../lib/graphql'
import { logger, paymentLogger } from '../../../../utils'
import get_env from '../../../../../get_env'
import qrcode from 'qrcode'

const generateQR = async args => {
   try {
      const {
         id: cartPaymentId,
         statementDescriptor,
         stripeInvoiceId,
         paymentMethodId: paymentMethod,
         paymentCustomerId,
         requires3dSecure,
         amount,
         oldAmount,
         host,
         cartId,
         metaData
      } = args
      const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
      const PAYTM_API_URL = await get_env('PAYTM_API_URL')
      const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')

      let orderId
      if (cartId) {
         orderId = `ORD-${cartId}-${cartPaymentId}`
         var { cart = {} } = await client.request(CART, {
            id: cartId
         })
      } else {
         orderId = `ORD-${cartPaymentId}`
      }

      let posId
      if (cart && cart.usedOrderInterface === 'Kiosk Ordering') {
         posId = `KIOSK_${cart.locationKioskId}`
      } else {
         posId = 'WEB'
      }

      let requestPayload = {}
      requestPayload.body = {
         mid: PAYTM_MERCHANT_ID,
         orderId: orderId,
         amount: amount.toFixed(2),
         businessType: 'UPI_QR_CODE',
         posId: posId
      }
      requestPayload.head = {
         version: 'v3',
         clientId: 'C11',
         signature: await PaytmChecksum.generateSignature(
            JSON.stringify(requestPayload.body),
            PAYTM_MERCHANT_KEY
         )
      }

      var post_data = JSON.stringify(requestPayload)

      const response = (
         await axios({
            url: `${PAYTM_API_URL}/paymentservices/qr/create`,
            method: 'POST',
            data: post_data,
            headers: {
               'Content-Type': 'application/json',
               'Content-Length': post_data.length
            }
         })
      ).data
      let actionUrl = null
      let actionRequired = false
      if (_isEmtpy(response) && _isEmtpy(response)) {
         return {
            success: false,
            message: 'Failed to create QR'
         }
      }
      if (
         !_isEmtpy(response.body.resultInfo) &&
         response.body.resultInfo.resultStatus === 'SUCCESS'
      ) {
         actionUrl = await qrcode.toDataURL(response.body.qrData)
      }

      await paymentLogger({
         cartPaymentId,
         transactionRemark: response,
         actionUrl,
         actionRequired,
         requestId: orderId,
         paymentStatus: 'QR_GENERATED'
      })
      return {
         success: true,
         data: response,
         message: 'QR created via paytm'
      }
   } catch (error) {
      console.log('error from paytm generateQR', error)
      logger('/api/payment-intent', error)
      return {
         success: false,
         error: error.message
      }
   }
}

export default generateQR
