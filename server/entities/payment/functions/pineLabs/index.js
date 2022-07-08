import initiatePayment from './initiatePayment'
import webhookEvents from './webhookEvents'

const pineLabs = async (data, methodType) => {
   console.log('==> Inside pine labs initialize payment', methodType)
   if (methodType === 'initialize') {
      console.log('==> Initiating payment via pine labs')
      return await initiatePayment(data)
   }
   if (methodType === 'webhook') {
      return webhookEvents(data)
   }
   return null
}

export default pineLabs
