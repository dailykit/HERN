import React from 'react'
import 'regenerator-runtime'

import { SEO, Layout } from '../../components'
import { getPageProps, processJsFile, renderPageContent } from '../../utils'

const IndexPage = props => {
   const { folds, settings, navigationMenus } = props

   React.useEffect(() => {
      try {
         processJsFile(folds)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [folds])

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO title="Home" />
         {renderPageContent(folds)}
      </Layout>
   )
}

export default IndexPage

export const getStaticProps = async ({ params }) => {
   const { parsedData, seo, settings, navigationMenus } = await getPageProps(
      params,
      '/'
   )

   return {
      props: { folds: parsedData, seo, settings, navigationMenus },
      revalidate: 60, // will be passed to the page component as props
   }
}
export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
