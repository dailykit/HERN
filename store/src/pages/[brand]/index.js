import React from 'react'
import 'regenerator-runtime'

import { SEO, Layout, ExternalJSCSSFiles } from '../../components'
import { getPageProps, renderPageContent } from '../../utils'

const IndexPage = props => {
   const { folds, settings, navigationMenus, seoSettings, linkedFiles } = props

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO seoSettings={seoSettings} />
         <ExternalJSCSSFiles externalFiles={linkedFiles} />
         {renderPageContent(folds)}
      </Layout>
   )
}

export default IndexPage

export const getStaticProps = async ({ params }) => {
   const { parsedData, settings, navigationMenus, seoSettings, linkedFiles } =
      await getPageProps(params, '/')

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
