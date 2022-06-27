import initiatePayment from './initiatePayment'
import webhookEvents from './webhookEvents'
import generateQR from './generateQR'

const paytm = async (data, methodType) => {
   console.log('inside paytm', methodType)
   if (methodType === 'initialize') {
      console.log('initiating payment via paytm')
      return await initiatePayment(data)
   }
   if (methodType === 'initializeQR') {
      console.log('initiating QR via paytm')
      return await generateQR(data)
   }
   if (methodType === 'webhook') {
      return webhookEvents(data)
   }
   return null
}

export default paytm
