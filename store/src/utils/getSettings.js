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
         if (settings[setting.meta.type]) {
            settings[setting.meta.type][setting.meta.identifier] = setting.value
         } else {
            settings[setting.meta.type] = {}
            settings[setting.meta.type][setting.meta.identifier] = setting.value
         }
      })

      const seoSetting = settings['App']['seo']

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
            seoSetting['/'].image ||
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
