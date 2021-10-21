import { client } from '../../lib/graphql'
import { CREATE_SCHEDULED_EVENT } from './graphql'

export const getCustomer = async (req, res) => {
   try {
      const { email = '' } = req.params
      if (!email)
         return res
            .status(401)
            .json({ success: false, error: 'Email is required!' })
      // const user = await getUserKeycloakDetails(email)
      return res.status(200).json({ success: true, data: { email } })
   } catch (error) {
      return res.status(500).json({ success: false, error })
   }
}

export const createReferralProgramScheduledEvent = async (req, res) => {
   try {
      const { data = {} } = req.body.event
      if (data.new.isSubscriber) {
         const { hasura_createScheduledEvent: scheduleEventData } =
            await client.request(CREATE_SCHEDULED_EVENT, {
               scheduledEventInput: {
                  webhook: 'abc112.com/referral', // need to change with the actual webhook url
                  schedule_at: '2022-08-15T18:45:00Z', // need to update the date with the date 2 week after the customer becomes a subscriber
                  payload: data.new // for now just passing all the customer related data in payload
               }
            })
         if (scheduleEventData.success) {
            return res
               .status(200)
               .json({ success: true, message: data.message })
         } 
            return res
               .status(400)
               .json({ success: false, message: data.message })
      } 
         return res
            .status(400)
            .json({ success: false, message: 'Customer is not a subscriber' })

   } catch (error) {
      return res.status(500).json({ success: false, error })
   }
}
