import React from 'react'
import PropTypes from 'prop-types'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useConfig } from '../lib'
export const SEO = ({ seoSettings, richresult, children }) => {
   const { pathname } = useRouter()
   const { favicon } = useConfig().configOf('theme-brand', 'brand')
   //for basic SEO settings 
   const basicSEO = seoSettings.find((setting) => setting?.brandPageSetting?.identifier === "basic-seo")
   //for SEO settings for social networks like Facebook,Pinterest,LinkedIn or Twitter
   const openGraphCard = seoSettings.find((setting) => setting?.brandPageSetting?.identifier === "og-card")
   //specifically for Twitter
   const twitterCard = seoSettings.find((setting) => setting?.brandPageSetting?.identifier === "twitter-card")

   return (
      <Head>
         <title>{basicSEO?.value?.metaTitle || pathname}</title>
         <link rel="icon" href={basicSEO?.value?.favicon || favicon} type="image/png" />
         <meta property="description" content={basicSEO?.value?.metaDescription || ''} name="description" />

         <meta property="og:title" content={openGraphCard?.value?.ogTitle || basicSEO?.value?.metaTitle} title="og-title" />
         <meta
            property="og:description"
            content={openGraphCard?.value?.ogDescription || basicSEO?.value?.metaDescription}
            title="og-desc"
         />
         <meta property="og:image" content={openGraphCard?.value?.ogImage || ''} title="og-image" />
         <meta property="og:type" content="website" />

         <meta property="twitter:card" content="summary" />
         <meta property="twitter:title" content={twitterCard?.value?.twitterTitle || openGraphCard?.value?.ogTitle || basicSEO?.value?.metaTitle || ''} title="tw-title" />
         <meta
            property="twitter:description"
            content={twitterCard?.value?.twitterDescription || openGraphCard?.value?.ogDescription || basicSEO?.value?.metaDescription || ''}
            title="tw-desc"
         />
         <meta
            property="twitter:image:src"
            content={twitterCard?.value?.twitterImage || openGraphCard?.value?.ogImage || basicSEO?.value?.favicon || ''}
            title="tw-image"
         />
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
