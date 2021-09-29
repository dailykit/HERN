import { emailTrigger } from '../../utils'
import { client } from '../../lib/graphql'

const GET_CUSTOMER_EMAIL = `query CustomerDetails($id: Int!) {
    brandCustomer(id: $id) {
        id
        isSubscriptionCancelled
        customer {
          email
        }
      }
    }
  `

export const handleSubscriptionCancelled = async (req, res) => {
   try {
      const { data = {} } = req.body.event
      // console.log("data", data)
      const { brandCustomer = [] } = await client.request(GET_CUSTOMER_EMAIL, {
         id: data.new.id
      })
      if (
         data.old.isSubscriptionCancelled !== data.new.isSubscriptionCancelled
      ) {
         if (brandCustomer.isSubscriptionCancelled) {
            await emailTrigger({
               title: 'reactivateSubscription',
               variables: {
                  brandCustomerId: brandCustomer.id
               },
               to: brandCustomer.customer.email
            })
            res.status(200).json({
               ok: true,
               message: 'event reactivateSubscription triggered'
            })
            return
         }
         if (!brandCustomer.isSubscriptionCancelled) {
            await emailTrigger({
               title: 'deactivateSubscription',
               variables: {
                  brandCustomerId: brandCustomer.id
               },
               to: brandCustomer.customer.email
            })
            res.status(200).json({
               ok: true,
               message: 'event deactivateSubscription triggered'
            })
            return
         }
      }
   } catch (error) {
      return res.status(400).json({ success: false, error })
   }
}
