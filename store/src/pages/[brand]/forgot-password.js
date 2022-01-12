import React from 'react'
import { SEO, Layout, ExternalJSCSSFiles } from '../../components'
import { getPageProps, renderPageContent } from '../../utils'

const ForgotPasswordPage = props => {
   const { folds, settings, navigationMenus, seoSettings, linkedFiles } = props

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO seoSettings={seoSettings} />
         <ExternalJSCSSFiles externalFiles={linkedFiles} />
         <main>{renderPageContent(folds)}</main>
      </Layout>
   )
}

export const getStaticProps = async ({ params }) => {
   const {
      parsedData,
      seo,
      settings,
      navigationMenus,
      seoSettings,
      linkedFiles,
   } = await getPageProps(params, '/forgot-password')

   return {
      props: {
         folds: parsedData,
         linkedFiles,
         seo,
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

export default ForgotPasswordPage
