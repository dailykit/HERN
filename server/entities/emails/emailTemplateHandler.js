import { emailTrigger } from '../../utils'

export const emailTemplateHandler = async (req, res) => {
   try {
      let payload
      if (typeof req.body.payload === 'string') {
         payload = JSON.parse(req.body.payload)
      } else {
         payload = req.body.payload
      }
      if (payload) {
         const result = await emailTrigger({
            title: payload.emailTriggerTitle,
            variables: payload,
            to: payload.email,
            phone: payload.phone,
            brandId: payload.brandId,
            includeHeader: payload.includeHeader,
            includeFooter: payload.includeFooter,
            type: payload.type
         })
         res.json(result)
      }
   } catch (error) {
      console.log(error)
      res.status(500).json({
         status: false,
         message: error.message
      })
   }
}
