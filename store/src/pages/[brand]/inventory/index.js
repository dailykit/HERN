import React from 'react'
import { Layout, SEO } from '../../../components'
import { getPageProps, processJsFile, renderPageContent } from '../../../utils'

const InventoryPage = props => {
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
         <SEO title="Inventory" />
         <main>{renderPageContent(folds)}</main>
      </Layout>
   )
}
export default InventoryPage

export const getStaticProps = async ({ params }) => {
   const { parsedData, seo, settings, navigationMenus } = await getPageProps(
      params,
      '/inventory'
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
