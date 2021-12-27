import webhookEvents from './webhookEvents'

const terminal = async (data, methodType) => {
   console.log('inside terminal', methodType)
   if (methodType === 'webhook') {
      return webhookEvents(data)
   }
   return null
}

export default terminal
