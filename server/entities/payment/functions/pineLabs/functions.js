import axios from 'axios'
import { client } from '../../../../lib/graphql'
import get_env from '../../../../../get_env'
import { PINE_LABS_DEVICE_INFO } from '../../graphql'

// get IMEI number and POS code of Pine Labs Device for a Kiosk
async function getPineLabsDeviceInfo(orderInterface, locationKioskId) {
   console.log('==> Order Interface:', orderInterface)
   if (
      (orderInterface && orderInterface !== 'Kiosk Ordering') ||
      !locationKioskId
   ) {
      return
   }

   var { devices = [] } = await client.request(PINE_LABS_DEVICE_INFO, {
      kioskId: locationKioskId
   })

   if (devices.length == 0) {
      return
   }

   const deviceInfo = devices[0].pineLabsDevice

   return deviceInfo
}

// start transaction for native flow with Pine Labs
const makeRequest = async ({
   baseUrl = '',
   apiPath = '',
   data = {},
   headers = {
      'Content-Type': 'application/json'
   }
}) => {
   const PINE_LABS_API_URL = await get_env('PINE_LABS_API_URL')
   const url = baseUrl
      ? `${baseUrl}${apiPath}`
      : `${PINE_LABS_API_URL}${apiPath}`
   const response = await axios({
      url,
      data,
      headers,
      method: 'POST'
   })
   console.log('==> PineLabs API Request Data: ', data)
   console.log('==> PineLabs API Response Data: ', response.data)
   return response.data
}

export const initiateTransaction = async arg => {
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
      AllowedPaymentMode,
      cartId,
      orderId,
      orderInterface,
      locationKioskId
   } = arg
   const PINE_LABS_MERCHANT_ID = await get_env('PINE_LABS_MERCHANT_ID')
   const PINE_LABS_SECURITY_TOKEN = await get_env('PINE_LABS_SECURITY_TOKEN')

   const pineLabsDeviceInfo = await getPineLabsDeviceInfo(
      orderInterface,
      locationKioskId
   )

   if (!pineLabsDeviceInfo) {
      return
   }

   const { imei, merchantStorePosCode } = pineLabsDeviceInfo

   const requestPayload = {
      TransactionNumber: orderId,
      SequenceNumber: 1,
      AllowedPaymentMode: AllowedPaymentMode,
      MerchantStorePosCode: merchantStorePosCode,
      Amount: amount.toFixed(2).replace('.', ''),
      MerchantID: parseInt(PINE_LABS_MERCHANT_ID),
      SecurityToken: PINE_LABS_SECURITY_TOKEN,
      IMEI: imei,
      AutoCancelDurationInMinutes: 1
   }

   const data = await makeRequest({
      apiPath: `/API/CloudBasedIntegration/V1/UploadBilledTransaction`,
      data: requestPayload
   })
   return data
}

//  gets the transaction status corresponding to requested OrderId for specific merchant.
export const transactionStatus = async arg => {
   const {
      TransactionNumber,
      PlutusTransactionReferenceID,
      orderInterface,
      locationKioskId
   } = arg
   const PINE_LABS_MERCHANT_ID = await get_env('PINE_LABS_MERCHANT_ID')
   const PINE_LABS_SECURITY_TOKEN = await get_env('PINE_LABS_SECURITY_TOKEN')

   const pineLabsDeviceInfo = await getPineLabsDeviceInfo(
      orderInterface,
      locationKioskId
   )

   if (!pineLabsDeviceInfo) {
      return
   }

   const { imei, merchantStorePosCode } = pineLabsDeviceInfo

   const requestPayload = {
      MerchantID: parseInt(PINE_LABS_MERCHANT_ID),
      SecurityToken: PINE_LABS_SECURITY_TOKEN,
      IMEI: imei,
      MerchantStorePosCode: merchantStorePosCode,
      PlutusTransactionReferenceID,
      TransactionNumber
   }

   const data = await makeRequest({
      apiPath: `/API/CloudBasedIntegration/V1/GetCloudBasedTxnStatus`,
      data: requestPayload
   })

   return data
}
