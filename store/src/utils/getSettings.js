import { SETTINGS_QUERY } from '../graphql'
import { graphQLClient } from '../lib'

export const getSettings = async (domain, path = '/') => {
   const client = await graphQLClient()
   const data = await client.request(SETTINGS_QUERY, {
      domain,
   })
   console.log("hello")
   if (data) {
      const settings = {}

      data.settings.forEach(setting => {
         if (settings[setting.meta.type]) {
            settings[setting.meta.type][setting.meta.identifier] = parsedConfigValue(setting.value)
         } else {
            settings[setting.meta.type] = {}
            settings[setting.meta.type][setting.meta.identifier] = parsedConfigValue(setting.value)
         }
      })

      const seoSetting = settings['seo']

      if (seoSetting) {
         const title =
            seoSetting[path]?.title ||
            seoSetting['/']?.title ||
            'Meal Kit Store'

         const description =
            seoSetting[path]?.description ||
            seoSetting['/']?.description ||
            'A subscription based meal kit store'

         const image =
            seoSetting[path]?.image ||
            seoSetting['/']?.image ||
            'https://dailykit-133-test.s3.amazonaws.com/images/1596121558382.png'

         return { seo: { title, description, image }, settings }
      }

      return {
         seo: {
            title: 'Meal Kit Store',
            description: 'A subscription based meal kit store',
            image: 'https://dailykit-133-test.s3.amazonaws.com/images/1596121558382.png',
         },
         settings,
      }
   }

   return { seo: null, settings: null }
}

function parsedConfigValue(setting) {
   const allPaths = getAllPaths(setting, 'value')
   console.log(setting)
   for (let i = 0; i < allPaths.length; i++) {

      console.log(allPaths[i], "🌻", allPaths, setting[allPaths[i]])
   }

   return (
      setting
   )
}
export default parsedConfigValue

function getAllPaths(obj, key, prev = '') {
   const result = []

   for (let k in obj) {
      let path = prev + (prev ? '.' : '') + k;

      if (k == key) {
         result.push(path)
      } else if (typeof obj[k] == 'object') {
         result.push(...getAllPaths(obj[k], key, path))
      }
   }

   return result
}
