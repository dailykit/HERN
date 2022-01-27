import axios from 'axios'
import { client } from '../lib/graphql'
import get_env from '../../get_env'

const GET_BRAND_SETTING = `
query GET_BRAND_SETTING($brandId: Int!, $identifier: String!) {
   settings:brands_brand_brandSetting(where: {brandSetting: {identifier: {_eq: $identifier}}, _or: {brandId: {_eq: $brandId}, brand: {isDefault: {_eq: true}}}}) {
     brandId
     brandSettingId
     value
     brandSettingId
     brandId
   }
 }
 `

export const globalTemplate = async ({ brandId = null, identifier = null }) => {
   try {
      if (!brandId && !identifier) {
         return null
      }
      const { settings = [] } = await client.request(GET_BRAND_SETTING, {
         brandId,
         identifier: 'globalEmailLayout'
      })
      if (settings.length > 0) {
         const [setting] = settings
         let filePath
         if (setting.hasOwnProperty('value')) {
            filePath = setting.value.hasOwnProperty(identifier)
               ? setting.value[identifier].value ||
                 setting.value[identifier].default
               : ''
         } else {
            return null
         }
         const DATA_HUB = await get_env('DATA_HUB')
         const { origin } = new URL(DATA_HUB)
         const template_variables = encodeURI(JSON.stringify({ brandId }))
         const template_options = encodeURI(
            JSON.stringify({
               path: filePath,
               format: 'html'
            })
         )
         const url = `${origin}/template/?template=${template_options}&data=${template_variables}`
         console.log(url)
         const { data: html } = await axios.get(url)
         return html
      }
      return null
   } catch (error) {
      console.error(error)
      throw error
   }
}
