import { BRAND_SETTINGS_BY_TYPE } from '../graphql'
import { graphQLClient } from '../lib'
import _ from 'lodash'

export const getSEOSettings = async (domain, dataByRoute) => {
   const client = await graphQLClient()

   //Passing page level SEO settings
   //********brandLevelSEOSettings
   const { brands_brand_brandSetting: brandLevelSEOSettings } =
      await client.request(BRAND_SETTINGS_BY_TYPE, {
         domain,
         type: 'seo',
      })

   //*******Page level SEO Settings
   const pageLevelSEOSettings =
      await dataByRoute?.brands_brandPages[0]?.brandPageSettings.filter(
         setting => setting?.brandPageSetting?.type === 'seo'
      )

   // ASSIGNING SEO settings ACCORDING TO PRIORITY*************
   const getSEOValue = (property, type) => {
      const value = !_.isEmpty(
         pageLevelSEOSettings.find(
            setting => setting?.brandPageSetting?.identifier === type
         )?.value?.[property]
      )
         ? pageLevelSEOSettings.find(
            setting => setting?.brandPageSetting?.identifier === type
         )?.value?.[property]
         : brandLevelSEOSettings.find(
            setting => setting.meta.identifier === type
         )?.value?.[property]
      return value
   }

   // ACCESSING SETTINGS
   const settings = {
      metaTitle: getSEOValue('metaTitle', 'basic-seo'),
      metaDescription: getSEOValue('metaDescription', 'basic-seo'),
      favicon: getSEOValue('favicon', 'basic-seo'),
      twitterImage: getSEOValue('twitterImage', 'twitter-card'),
      twitterTitle: getSEOValue('twitterTitle', 'twitter-card'),
      twitterDescription: getSEOValue('twitterDescription', 'twitter-card'),
      ogImage: getSEOValue('ogImage', 'og-card'),
      ogTitle: getSEOValue('ogTitle', 'og-card'),
      ogDescription: getSEOValue('ogDescription', 'og-card'),
      googleAnalyticsId: getSEOValue('googleAnalyticsId', 'googleAnalyticsId'),
      facebookPixelId: getSEOValue('fbPixelId', 'facebookPixelId')
   }

   return settings
}

//after test.dailykit.org/product/