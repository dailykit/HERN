import React from 'react'
import { renderPageContent, getPageProps } from '../../utils'
import { SEO, Layout, ExternalJSCSSFiles } from '../../components'

const CheckoutPage = props => {
   const { folds, settings, navigationMenus, seoSettings, linkedFiles } = props

   return (
      <Layout
         settings={settings}
         navigationMenus={navigationMenus}
         noFooter={true}
      >
         <SEO seoSettings={seoSettings} />
         <ExternalJSCSSFiles externalFiles={linkedFiles} />
         <main>{renderPageContent(folds)}</main>
      </Layout>
   )
}

export const getStaticProps = async ({ params }) => {
   const { parsedData, settings, navigationMenus, seoSettings, linkedFiles } =
      await getPageProps(params, '/checkout')

   return {
      props: {
         folds: parsedData,
         linkedFiles,
         settings,
         navigationMenus,
         seoSettings,
      },
      revalidate: 1, // will be passed to the page component as props
   }
}
export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}

export default CheckoutPage
