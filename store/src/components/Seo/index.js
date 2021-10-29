import React from 'react'
import PropTypes from 'prop-types'
import Head from 'next/head'

const SEO = ({ description, title, image, richresult, children }) => {
   const favicon =
      'https://dailykit-239-primanti.s3.us-east-2.amazonaws.com/images/logos/StayIn_Horizontal_150x150.png'

   const metaTitle = title || 'StayInSocial'

   const metaDescription =
      description || 'Discover and book unique experiences hosted in your home.'

   const metaImage =
      image ||
      'https://dailykit-239-primanti.s3.us-east-2.amazonaws.com/images/stayInSocial-preview.png'

   return (
      <Head>
         <title>{metaTitle}</title>
         <link
            rel="icon"
            href="/assets/images/stayIn-logo-2.png"
            type="image/png"
            sizes="32x32"
         />
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

export default SEO

SEO.defaultProps = {
   meta: [],
   title: '',
   description: ''
}

SEO.propTypes = {
   description: PropTypes.string,
   title: PropTypes.string.isRequired,
   meta: PropTypes.arrayOf(PropTypes.object)
}
