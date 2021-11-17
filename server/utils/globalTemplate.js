import axios from 'axios'
import { client } from '../lib/graphql'
import get_env from '../../get_env'

const GET_BRAND_SETTING = `
query GET_BRAND_SETTING($brandId: Int, $identifier: String!) {
   brands_brand_brandSetting(where: {brandSetting: {identifier: {_eq: $identifier}}, _or: {brandId: {_eq: $brandId}, brand: {isDefault: {_eq: true}}}}) {
     brandId
     brandSettingId
     value
   }
 }
 `
const GET_FILE_PATH = `
query GET_FILE_PATH($id: Int!) {
   editor_file_by_pk(id: $id) {
     id
     path
   }
 }
 `

export const globalTemplate = async ({ brandId, identifier }) => {
   try {
      const { brands_brand_brandSetting: settings } =
         await client.request(GET_BRAND_SETTING, { brandId, identifier })
      console.log({ settings })
      if (settings.length > 0) {
         const [setting] = settings
         const { editor_file_by_pk: file } = await client.request(
            GET_FILE_PATH,
            { id: setting.value.functionFileId }
         )
         const DATA_HUB = await get_env('DATA_HUB')
         const { origin } = new URL(DATA_HUB)
         const template_variables = encodeURI(JSON.stringify({ brandId }))

         const template_options = encodeURI(
            JSON.stringify({
               path: file.path,
               format: 'html'
            })
         )
         const url = `${origin}/template/?template=${template_options}&data=${template_variables}`
         const { data: html } = await axios.get(url)
         return html
      }
      return null
   } catch (error) {
      console.log(error)
      throw error
   }
}
