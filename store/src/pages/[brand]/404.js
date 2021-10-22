import React from 'react'
import { SEO, Layout } from '../../components'
import { getPageProps, processJsFile, renderPageContent } from '../../utils'

export default props => {
   const { folds, settings, navigationMenus, seoSettings } = props

   React.useEffect(() => {
      try {
         processJsFile(folds)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [folds])

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO seoSettings={seoSettings} />
         {renderPageContent(folds)}
      </Layout>
   )
}
export const getStaticProps = async ({ params }) => {
   const { parsedData, settings, navigationMenus, seoSettings } = await getPageProps(
      params,
      '/404'
   )

   return {
      props: { folds: parsedData, settings, navigationMenus, seoSettings },
      revalidate: 60, // will be passed to the page component as props
   }
}
export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
