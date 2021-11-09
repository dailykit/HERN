import { client } from '../../lib/graphql'

const BRAND_SETTINGS = `
query settings($identifier: String_comparison_exp!) {
   settings: brandSettings(where: {identifier: $identifier}) {
     id
     type
     brand_brandSetting {
       value
       brandId
     }
   }
 }
`

const CREATE_BRAND_SETTING = `
mutation createBrandSetting(
   $object: brands_brandSetting_insert_input!
) {
   createBrandSetting(object: $object) {
      id
   }
}
`

const UPDATE_BRAND_SETTING = `
mutation updateBrand_BrandSetting($brandId: Int!, $identifier: String_comparison_exp!, $_set: brands_brand_brandSetting_set_input!) {
   update_brands_brand_brandSetting(where: {brandId: {_eq: $brandId}, brandSetting: {identifier: $identifier}}, _set: $_set) {
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

      const { settings } = await client.request(BRAND_SETTINGS, {
         identifier: { _eq: 'Store Live' }
      })

      if (settings.length === 0) {
         await client.request(CREATE_BRAND_SETTING, {
            identifier: 'Store Live',
            type: 'availability',
            brand_brandSettings: {
               data: [{
                  brandId: settings[0].brand_brandSetting.brandId,
                  value: {
                     isStoreLive: false,
                     isStripeConfigured: true
                  }
               }]
            }
         })
      } else {
         await client.request(UPDATE_BRAND_SETTING, {
            identifier: {
               _eq: 'Store Live'
            },
            brandId: settings[0].brand_brandSetting.brandId,
            _set: {
               value: {
                  ...settings[0].brand_brandSetting.value,
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
