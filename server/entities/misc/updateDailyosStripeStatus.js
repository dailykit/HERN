import { client } from '../../lib/graphql'

const STORE_SETTINGS = `
   query settings($identifier: String_comparison_exp!) {
      settings: storeSettings(where: { identifier: $identifier }) {
         id
         type
         value
      }
   }
`

const CREATE_STORE_SETTING = `
   mutation createStoreSetting(
      $object: brands_storeSetting_insert_input!
   ) {
      createStoreSetting(object: $object) {
         id
      }
   }
`

const UPDATE_STORE_SETTING = `
   mutation updateStoreSetting(
      $identifier: String_comparison_exp!
      $_set: brands_storeSetting_set_input!
   ) {
      updateStoreSetting(where: { identifier: $identifier }, _set: $_set) {
         affected_rows
      }
   }
`

export const updateDailyosStripeStatus = async (req, res) => {
   try {
      const {
         stripeAccountId = '',
         datahubUrl = '',
         adminSecret = ''
      } = req.body.event.data.new

      if (!stripeAccountId) throw Error('Stripe account is not linked yet!')
      if (!datahubUrl) throw Error('Datahub is not configured yet!')
      if (!adminSecret) throw Error('Missing admin secret!')

      const { settings } = await client.request(STORE_SETTINGS, {
         identifier: { _eq: 'Store Live' }
      })

      if (settings.length === 0) {
         await client.request(CREATE_STORE_SETTING, {
            identifier: 'Store Live',
            type: 'availability',
            value: {
               isStoreLive: false,
               isStripeConfigured: true
            }
         })
      } else {
         await client.request(UPDATE_STORE_SETTING, {
            identifier: {
               _eq: 'Store Live'
            },
            _set: {
               value: {
                  ...settings[0].value,
                  isStripeConfigured: true
               }
            }
         })
      }

      return res
         .status(200)
         .json({ success: true, message: 'Update store setting successfully.' })
   } catch (error) {
      return res.status(400).json({ success: false, error: error.message })
   }
}
