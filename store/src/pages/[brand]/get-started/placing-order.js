import React from 'react'
import { SEO, Layout } from '../../../components'
import { processJsFile, renderPageContent, getPageProps } from '../../../utils'
import 'regenerator-runtime'

const FirstOrderPlace = props => {
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
         <SEO title="Placing Order" />
         <main>{renderPageContent(folds)}</main>
      </Layout>
   )
}

export default FirstOrderPlace

export const getStaticProps = async ({ params }) => {
   const { parsedData, seo, settings, navigationMenus } = await getPageProps(
      params,
      '/get-started/placing-order'
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
