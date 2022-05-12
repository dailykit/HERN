import React from 'react'
import { SEO, Layout, ExternalJSCSSFiles } from '../../components'
import { renderPageContent, getPageProps } from '../../utils'
import 'regenerator-runtime'
import { isEmpty } from 'lodash'

const Index = props => {
   const { folds, settings, navigationMenus, seoSettings, linkedFiles } = props
   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO seoSettings={seoSettings} />
         <ExternalJSCSSFiles externalFiles={linkedFiles} />
         <main>{renderPageContent(folds)}</main>
      </Layout>
   )
}

export default Index

export const getStaticProps = async ({ params }) => {
   const {
      parsedData,
      seo,
      settings,
      navigationMenus,
      seoSettings,
      linkedFiles,
   } = await getPageProps(params, '/' + params.slugs.join('/'))

   if (isEmpty(parsedData)) {
      return {
         notFound: true,
      }
   }
   return {
      props: {
         params,
         folds: parsedData,
         seo,
         settings,
         navigationMenus,
         seoSettings,
         linkedFiles,
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
