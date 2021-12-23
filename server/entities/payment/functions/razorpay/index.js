import initiatePayment from './initiatePayment'
import webhookEvents from './webhookEvents'

const razorpay = async (data, methodType) => {
   console.log('inside razorpay', methodType)
   if (methodType === 'initialize') {
      console.log('initiating payment via razorpay')
      return await initiatePayment(data)
   }
   if (methodType === 'webhook') {
      return webhookEvents(data)
   }
   return null
}

export default razorpay
