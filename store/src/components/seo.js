import React from 'react'
import PropTypes from 'prop-types'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useConfig } from '../lib'
import _ from 'lodash'
export const SEO = ({ seoSettings, richresult, children }) => {
   const { pageLevel, brandLevel } = seoSettings
   const { pathname } = useRouter()
   // const { favicon } = useConfig().configOf('theme-brand', 'brand')

   //for basic SEO settings
   // const basicSEO =
   //    pageLevel.find(
   //       setting => setting?.brandPageSetting?.identifier === 'basic-seo'
   //    ) || brandLevel.find(setting => setting?.meta?.identifier === 'basic-seo')

   //for SEO settings for social networks like Facebook,Pinterest,LinkedIn or Twitter
   const openGraphCard =
      pageLevel.find(
         setting => setting?.brandPageSetting?.identifier === 'og-card'
      ) || brandLevel.find(setting => setting?.meta?.identifier === 'og-card')

   //specifically for Twitter
   const twitterCard =
      pageLevel.find(
         setting => setting?.brandPageSetting?.identifier === 'twitter-card'
      ) ||
      brandLevel.find(setting => setting?.meta?.identifier === 'twitter-card')

   // for googleAnalyticsId
   const googleAnalyticsId = brandLevel.find(
      setting => setting?.meta?.identifier === 'googleAnalyticsId'
   )?.value?.value

   //for facebookpixel code
   const facebookPixelId = brandLevel.find(
      setting => setting?.meta?.identifier === 'facebookPixelId'
   )?.value?.value

   const getBasicSEOValue = property => {
      const value = !_.isEmpty(
         seoSettings?.pageLevel.find(
            setting => setting?.brandPageSetting?.identifier === 'basic-seo'
         )?.value?.[property]
      )
         ? seoSettings?.pageLevel.find(
              setting => setting?.brandPageSetting?.identifier === 'basic-seo'
           )?.value?.[property]
         : seoSettings?.brandLevel.find(
              setting => setting.meta.identifier === 'basic-seo'
           )?.value?.[property]
      return value
   }
   return (
      <Head>
         <title>
            {getBasicSEOValue('metaTitle') || pathname.split('/').slice(-1)}
         </title>
         <link rel="icon" href={getBasicSEOValue('favicon')} type="image/png" />
         <meta
            property="description"
            content={getBasicSEOValue('metaDescription') || ''}
            name="description"
         />

         <meta
            property="og:title"
            content={
               openGraphCard?.value?.ogTitle ||
               getBasicSEOValue('title') ||
               pathname.split('/').slice(-1)
            }
            title="og-title"
         />
         <meta
            property="og:description"
            content={
               openGraphCard?.value?.ogDescription ||
               getBasicSEOValue('metaDescription') ||
               ''
            }
            title="og-desc"
         />
         <meta
            property="og:image"
            content={openGraphCard?.value?.ogImage}
            title="og-image"
         />
         <meta property="og:type" content="website" />

         <meta property="twitter:card" content="summary" />
         <meta
            property="twitter:title"
            content={
               twitterCard?.value?.twitterTitle ||
               openGraphCard?.value?.ogTitle ||
               getBasicSEOValue('metaTitle') ||
               pathname.split('/').slice(-1)
            }
            title="tw-title"
         />
         <meta
            property="twitter:description"
            content={
               twitterCard?.value?.twitterDescription ||
               openGraphCard?.value?.ogDescription ||
               getBasicSEOValue('metaDescription') ||
               ''
            }
            title="tw-desc"
         />
         <meta
            property="twitter:image:src"
            content={
               twitterCard?.value?.twitterImage ||
               openGraphCard?.value?.ogImage ||
               getBasicSEOValue('favicon')
            }
            title="tw-image"
         />
         {/* <!-- Global site tag (gtag.js) - Google Analytics --> */}
         {googleAnalyticsId && (
            <script
               async
               src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            ></script>
         )}

         {/* facebook pixel */}
         {facebookPixelId && (
            <noscript>
               <img
                  src={`https://www.facebook.com/tr?id=${facebookPixelId}&ev=PageView&noscript=1`}
                  height="1"
                  width="1"
                  style={{ display: 'none' }}
               />
            </noscript>
         )}
         {richresult && (
            <script type="application/ld+json"> {richresult} </script>
         )}
         {children}
      </Head>
   )
}

SEO.defaultProps = {
   meta: [],
   title: '',
   description: '',
}

SEO.propTypes = {
   description: PropTypes.string,
   title: PropTypes.string.isRequired,
   meta: PropTypes.arrayOf(PropTypes.object),
}
