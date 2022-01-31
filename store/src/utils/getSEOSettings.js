import { BRAND_SETTINGS_BY_TYPE, PRODUCT_SEO_SETTINGS_BY_ID } from '../graphql'
import { graphQLClient } from '../lib'
import _ from 'lodash'


export const getSEOSettings = async (domain, dataByRoute) => {
   const client = await graphQLClient()
   // console.log(domain, "domain")
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
         pageLevelSEOSettings?.find(
            setting => setting?.brandPageSetting?.identifier === type
         )?.value?.[property]
      )
         ? pageLevelSEOSettings?.find(
            setting => setting?.brandPageSetting?.identifier === type
         )?.value?.[property]
         : brandLevelSEOSettings?.find(
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

//****PRODUCT SETTINGS FOR PRODUCT PAGE */
export const getProductSEOSettings = async (productId) => {
   const client = await graphQLClient()

   //calling product info and seodetails
   const { products_productPageSetting: ProductPageSettings, products } =
      await client.request(PRODUCT_SEO_SETTINGS_BY_ID, {
         productId,
         type: 'seo',
      })

   //assigning product info as defaultSettings
   const defaultProductSettings = [
      {
         "value": {
            "metaTitle": products[0]?.name,
            "metaDescription": products[0]?.description,
            "favicon": products[0]?.assets?.images[0]
         }

      }
   ]

   // ASSIGNING SEO settings ACCORDING TO PRIORITY*************
   const getSEOValue = (property, type) => {
      const value = !_.isEmpty(
         ProductPageSettings?.find(
            setting => setting?.identifier === type
         )?.product_productPageSettings[0]?.value?.[property]
      )
         ? ProductPageSettings?.find(
            setting => setting?.identifier === type
         )?.product_productPageSettings[0]?.value?.[property]
         : defaultProductSettings?.[0]?.value?.[property]
      return value
   }

   // ACCESSING SETTINGS
   const settings = {
      metaTitle: getSEOValue('metaTitle', 'basic-seo'),
      metaDescription: getSEOValue('metaDescription', 'basic-seo'),
      favicon: getSEOValue('favicon', 'basic-seo'),
      twitterImage: getSEOValue('twitterImage', 'twitter-card') || null,
      twitterTitle: getSEOValue('twitterTitle', 'twitter-card') || null,
      twitterDescription: getSEOValue('twitterDescription', 'twitter-card') || null,
      ogImage: getSEOValue('ogImage', 'og-card') || null,
      ogTitle: getSEOValue('ogTitle', 'og-card') || null,
      ogDescription: getSEOValue('ogDescription', 'og-card') || null,
      googleAnalyticsId: getSEOValue('googleAnalyticsId', 'googleAnalyticsId') || null,
      facebookPixelId: getSEOValue('fbPixelId', 'facebookPixelId') || null
   }

   return settings
}