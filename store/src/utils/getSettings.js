import { SETTINGS_QUERY } from '../graphql'
import { graphQLClient } from '../lib'

export const getSettings = async (domain, path = '/') => {
   const client = await graphQLClient()
   const data = await client.request(SETTINGS_QUERY, {
      domain,
   })
   if (data) {
      const settings = {}

      data.settings.forEach(setting => {
         console.log('parsee', parseConfig(setting.value))
         if (settings[setting.meta.type]) {
            settings[setting.meta.type][setting.meta.identifier] = parseConfig(
               setting.value
            )
         } else {
            settings[setting.meta.type] = {}
            settings[setting.meta.type][setting.meta.identifier] = parseConfig(
               setting.value
            )
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

function parseConfig(obj) {
   const parsedObj = {}
   for (let key in obj) {
      const value = obj[key]
      if (typeof value === 'object' && !Array.isArray(value)) {
         if (value.hasOwnProperty('value')) {
            parsedObj[key] = { ...parsedObj[key] }
            parsedObj[key]['value'] = value['value'] ?? value['default']
            continue
         }
         const tempObj = parseConfig(value)
         for (let nestedKey in tempObj) {
            parsedObj[key] = { ...parsedObj[key], [nestedKey]: {} }
            parsedObj[key][nestedKey] = tempObj[nestedKey]
         }
      }
   }
   return parsedObj
}
