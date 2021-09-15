import initiatePayment from './initiatePayment'
import webhookEvents from './webhookEvents'

const stripe = async (data, methodType) => {
   console.log({ data, methodType })
   if (methodType === 'initialize') {
      return initiatePayment(data)
   }
   if (methodType === 'webhook') {
      return webhookEvents(data)
   }
   return null
}

export default stripe
