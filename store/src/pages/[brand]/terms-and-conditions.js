import React from 'react'
import { SEO, Layout, ExternalJSCSSFiles } from '../../components'
import { renderPageContent, getPageProps } from '../../utils'
import 'regenerator-runtime'

const TermsAndConditionsPage = props => {
   const { folds, settings, seoSettings, linkedFiles } = props

   return (
      <Layout settings={settings}>
         <SEO seoSettings={seoSettings} />
         <ExternalJSCSSFiles externalFiles={linkedFiles} />
         <main>{renderPageContent(folds)}</main>
      </Layout>
   )
}

export default TermsAndConditionsPage

export const getStaticProps = async ({ params }) => {
   const { parsedData, settings, navigationMenus, seoSettings, linkedFiles } =
      await getPageProps(params, '/terms-and-conditions')

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
