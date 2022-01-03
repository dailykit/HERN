import get_env from '../../get_env'

const Paytm = require('paytm-pg-node-sdk')

const paytm = async host => {
   const PAYTM_ENVIRONMENT = Paytm.LibraryConstants.STAGING_ENVIRONMENT
   const PAYTM_MERCHANT_ID =
      (await get_env('PAYTM_MERCHANT_ID')) || process.env.PAYTM_MERCHANT_ID
   const PAYTM_MERCHANT_KEY =
      (await get_env('PAYTM_MERCHANT_KEY')) || process.env.PAYTM_MERCHANT_KEY
   const PAYTM_WEBSITE =
      (await get_env('PAYTM_WEBSITE')) || process.env.PAYTM_WEBSITE
   const PAYTM_CALLBACK_URL = `${host}/server/api/payment/handle-payment-webhook`
   Paytm.MerchantProperties.setCallbackUrl(PAYTM_CALLBACK_URL)
   Paytm.MerchantProperties.initialize(
      PAYTM_ENVIRONMENT,
      PAYTM_MERCHANT_ID,
      PAYTM_MERCHANT_KEY,
      PAYTM_WEBSITE
   )
   return Paytm
}

export default paytm
