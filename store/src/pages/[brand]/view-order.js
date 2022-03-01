/* eslint-disable jsx-a11y/no-onchange */

import React from 'react'
import { renderPageContent, getPageProps } from '../../utils'
import { Layout, SEO, ExternalJSCSSFiles } from '../../components'
import 'regenerator-runtime'

const ViewOrderPage = props => {
   const { folds, settings, navigationMenus, seoSettings, linkedFiles } = props

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO seoSettings={seoSettings} />
         <ExternalJSCSSFiles externalFiles={linkedFiles} />
         {renderPageContent(folds)}
      </Layout>
   )
}

export default ViewOrderPage

export async function getStaticProps({ params }) {
   const { parsedData, settings, navigationMenus, seoSettings, linkedFiles } =
      await getPageProps(params, '/view-order')

   return {
      props: {
         folds: parsedData,
         linkedFiles,
         settings,
         navigationMenus,
         seoSettings,
      },
      // revalidate: 60, // will be passed to the page component as props
   }
}

export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
