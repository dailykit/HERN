import { client } from '../../lib/graphql'
export const sendOtp = async (req, res) => {
   try {
      const { id, phoneNumber, resendAttempts, code } = req.body.event.data.new
      if (resendAttempts >= 3) {
         return res.status(429).json({
            success: false,
            message: 'You have reached maximum resend attempts'
         })
      }

      if (phoneNumber && code) {
         return res.status(400).json({
            success: false,
            message: 'Either phone number or code is missing'
         })
      }

      const { sendSMS } = await client.request(SEND_SMS, {
         message: `Your OTP is ${code}`,
         phone: phoneNumber
      })

      if (sendSMS) {
         return res.status(200).json({
            success: true,
            message: 'OTP sent successfully'
         })
      }
   } catch (error) {
      return res.status(400).json({
         success: false,
         message: error.message
      })
   }
}

export const SEND_SMS = `
   mutation sendSMS($message: String!, $phone: String!) {
      sendSMS(message: $message, phone: $phone) {
         success
         message
      }
   }
`
