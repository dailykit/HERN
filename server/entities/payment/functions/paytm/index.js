import initiatePayment from './initiatePayment'
import webhookEvents from './webhookEvents'

const paytm = async (data, methodType) => {
   console.log('inside paytm', methodType)
   if (methodType === 'initialize') {
      console.log('initiating payment via paytm')
      return await initiatePayment(data)
   }
   if (methodType === 'webhook') {
      return webhookEvents(data)
   }
   return null
}

export default paytm
