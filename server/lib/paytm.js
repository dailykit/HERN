import get_env from '../../get_env'

const Paytm = require('paytm-pg-node-sdk')

const paytm = async () => {
   const PAYTM_ENVIRONMENT = Paytm.LibraryConstants.PRODUCTION_ENVIRONMENT
   const PAYTM_MERCHANT_ID = await get_env('PAYTM_MERCHANT_ID')
   const PAYTM_MERCHANT_KEY = await get_env('PAYTM_MERCHANT_KEY')
   const PAYTM_WEBSITE = await get_env('PAYTM_WEBSITE')
   const PAYTM_CALLBACK_URL = 'http://localhost:4000/'
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
