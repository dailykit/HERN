import { client } from '../../lib/graphql'
import { getHtml } from '..'
import { SEND_MAIL } from '../../entities/occurence/graphql'

export const sendEmail = async ({
   brandCustomerId,
   subscriptionOccurenceId,
   fileName
}) => {
   try {
      const { subscriptionOccurences = [] } = await client.request(
         GET_CUSTOMER_EMAIL,
         {
            subscriptionOccurenceId,
            brandCustomerId
         }
      )

      if (subscriptionOccurences.length === 0) return
      const [occurence] = subscriptionOccurences

      const { subscription = {} } = occurence
      const { reminderSettings = {} } = subscription

      if (
         !('template' in reminderSettings) ||
         Object.keys(reminderSettings.template || {}).length === 0
      )
         return

      const {
         brands_brand_brandSetting = []
      } = await client.request(GET_TEMPLATE_SETTINGS, {
         identifier: template
      })

      if (brands_brand_brandSetting.length === 0) return
      const { value } = brands_brand_brandSetting[0]

      let html = await getHtml(value.template, {
         data: {
            fileName,
            subscriptionOccurenceId,
            brand_customerId: brandCustomerId
         }
      })

      await client.request(SEND_MAIL, {
         emailInput: {
            from: templateSettings.email,
            to: brand_customers.customer.email,
            subject: 'REMINDER: Your weekly box status.',
            attachments: [],
            html
         }
      })
   } catch (error) {
      // throw Error(error.message)
      console.log(error)
   }
}

const GET_CUSTOMER_EMAIL = `
   query subscriptionOccurences($subscriptionOccurenceId: Int!, $brandCustomerId: Int!) {
      subscriptionOccurences(where: { id: { _eq: $subscriptionOccurenceId } }) {
         id
         subscriptionId
         subscription {
            id
            reminderSettings
            brand_customers(where: { id: { _eq: $brandCustomerId } }) {
               id
               customer {
                  id
                  email
               }
            }
         }
      }
   }
`

export const GET_TEMPLATE_SETTINGS = `
query brands_brand_brandSetting($identifier: String!) {
   brands_brand_brandSetting(
      where: {
         brandSetting: { identifier: { _eq: $identifier } }
      }
   ) {
      value
   }
}
`
