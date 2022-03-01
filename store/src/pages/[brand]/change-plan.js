import React from 'react'
import { Layout, SEO, ExternalJSCSSFiles } from '../../components'
import { getPageProps, renderPageContent } from '../../utils'

const ChangePlanPage = props => {
   const { settings, linkedFiles, navigationMenus, folds, seoSettings } = props

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO seoSettings={seoSettings} />
         <ExternalJSCSSFiles externalFiles={linkedFiles} />
         <main>{renderPageContent(folds)}</main>
      </Layout>
   )
}

export const getStaticProps = async ({ params }) => {
   const { parsedData, settings, navigationMenus, seoSettings, linkedFiles } =
      await getPageProps(params, '/change-plan')

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

export default ChangePlanPage
