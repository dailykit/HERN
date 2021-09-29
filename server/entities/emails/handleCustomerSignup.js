import { emailTrigger } from '../../utils'
import { client } from '../../lib/graphql'

const GET_CUSTOMER_EMAIL = `query CustomerDetails($id: Int!) {
    brandCustomer(id: $id) {
        id
      customer {
        email
      }
    }
  }
  `

export const handleCustomerSignup = async (req, res) => {
   try {
      const { data = {} } = req.body.event
      // console.log("data", data)
      const { brandCustomer = [] } = await client.request(GET_CUSTOMER_EMAIL, {
         id: data.new.id
      })

      await emailTrigger({
         title: 'sendSignupEmail',
         variables: {
            brandCustomerId: brandCustomer.id
         },
         to: brandCustomer.customer.email
      })
      res.status(200).json({
         ok: true,
         message: 'you are signed up'
      })
      return
   } catch (error) {
      return res.status(400).json({ success: false, error })
   }
}
