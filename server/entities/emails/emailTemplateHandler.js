import { emailTrigger } from '../../utils'

export const emailTemplateHandler = async (req, res) => {
   try {
      const { payload = null } = req.body
      const parsedPayload = JSON.parse(payload)
      if (parsedPayload) {
         const result = await emailTrigger({
            title: parsedPayload.emailTriggerTitle,
            variables: parsedPayload,
            to: parsedPayload.email,
            brandId: parsedPayload.brandId,
            includeHeader: parsedPayload.includeHeader,
            includeFooter: parsedPayload.includeFooter
         })
         res.status(result.success ? 200 : 400).json(result)
      }
   } catch (error) {
      console.log(error)
      res.status(500).json({
         status: false,
         message: error.message
      })
   }
}
