import { BRAND_SETTINGS_BY_TYPE } from '../graphql'
import { graphQLClient } from '../lib'

export const getSEOSettings = async (domain, dataByRoute) => {
   const client = await graphQLClient()

   //Passing page level SEO settings
   const { brands_brand_brandSetting: brandLevelSEOSettings } =
      await client.request(BRAND_SETTINGS_BY_TYPE, {
         domain,
         type: 'seo',
      })

   //Page level SEO Settings
   const pageLevelSEOSettings =
      await dataByRoute?.brands_brandPages[0]?.brandPageSettings.filter(
         setting => setting?.brandPageSetting?.type === 'seo'
      )

   return {
      pageLevel: pageLevelSEOSettings,
      brandLevel: brandLevelSEOSettings,
   }
}
