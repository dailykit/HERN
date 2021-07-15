import React from 'react'
import PropTypes from 'prop-types'
import Head from 'next/head'
import { useConfig } from '../lib'
import { useRouter } from 'next/router'

export const SEO = ({ description, title, image, richresult, children }) => {
   const router = useRouter()

   // const { site } = useStaticQuery(
   //    graphql`
   //       query {
   //          site {
   //             siteMetadata {
   //                title
   //                description
   //             }
   //          }
   //       }
   //    `
   // )

   const { favicon } = useConfig().configOf('theme-brand', 'brand')
   const seo = useConfig().configOf('seo', 'App')

   const path = router.pathname

   const metaTitle =
      title || seo[path]?.title || seo['/']?.title || 'Meal Kit Store'

   const metaDescription =
      description ||
      seo[path]?.description ||
      seo['/']?.description ||
      'A subscription based meal kit store'

   const metaImage =
      image ||
      seo[path]?.image ||
      seo['/']?.image ||
      'https://dailykit-133-test.s3.amazonaws.com/images/1596121558382.png'

   return (
      <Head>
         <title>{metaTitle}</title>
         <link rel="icon" href={favicon} type="image/png" />
         <meta property="og:title" content={metaTitle} title="og-title" />
         <meta
            property="og:description"
            content={metaDescription}
            title="og-desc"
         />
         <meta property="og:image" content={metaImage} title="og-image" />
         <meta property="og:type" content="website" />
         <meta property="twitter:card" content="summary" />
         <meta property="twitter:title" content={metaTitle} title="tw-title" />
         <meta
            property="twitter:description"
            content={metaDescription}
            title="tw-desc"
         />
         <meta
            property="twitter:image:src"
            content={metaImage}
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
