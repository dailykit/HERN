import { sendExpoNotification } from '../../utils/expoNotification'

export const sendNotification = async (req, res) => {
   const { title, body, notificationTokens, data = {} } = req.body
   const result = await sendExpoNotification({
      title,
      body,
      notificationTokens,
      data
   })
   if (result.status !== 'ok') {
      res.status(400).json({
         success: false,
         message: result.message
      })
   } else {
      res.status(200).json({
         success: true,
         message: result.message
      })
   }
}
