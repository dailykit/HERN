import React from 'react'
import PropTypes from 'prop-types'
import Head from 'next/head'

export const SEO = ({ seoSettings, children }) => {
   const {
      metaTitle,
      metaDescription,
      favicon,
      twitterImage,
      twitterTitle,
      twitterDescription,
      ogImage,
      ogTitle,
      ogDescription,
      ogUrl,
      googleAnalyticsId,
      facebookPixelId,
      additionalTags,
      richResults,
   } = seoSettings

   return (
      <Head>
         <title>{metaTitle}</title>
         <link rel="icon" href={favicon} type="image/png" sizes="16x16" />
         <meta
            property="description"
            content={metaDescription || ''}
            name="description"
         />
         {console.log(richResults, "richResults")}
         {/* additionalTags if any */}
         {additionalTags?.length > 0 &&
            additionalTags.map((obj, index) => {
               return (
                  <meta
                     key={`${Object.keys(obj)[0]}-${index} `}
                     name={Object.keys(obj)[0]}
                     content={Object.values(obj)[0]}
                  />
               )
            })}

         <meta
            property="og:title"
            content={ogTitle || metaTitle}
            title="og-title"
         />
         <meta
            property="og:description"
            content={ogDescription || metaDescription || ''}
            title="og-desc"
         />
         <meta property="og:image" content={ogImage} title="og-image" />
         <meta property="og:type" content="website" />
         <meta property="og:url" content={ogUrl} />
         <meta property="twitter:card" content="summary" />
         <meta
            property="twitter:title"
            content={twitterTitle || ogTitle || metaTitle}
            title="tw-title"
         />
         <meta
            property="twitter:description"
            content={
               twitterDescription || ogDescription || metaDescription || ''
            }
            title="tw-desc"
         />
         <meta
            property="twitter:image:src"
            content={twitterImage || ogImage || favicon}
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

         {richResults && (
            <script
               type="application/ld+json"
               dangerouslySetInnerHTML={{ __html: JSON.stringify(richResults) }} />)}

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
