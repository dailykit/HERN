import React from 'react'
import {
   getPageProps,
   processExternalFiles,
   renderPageContent,
} from '../../../utils'
import { Layout, SEO } from '../../../components'

const ProductPage = props => {
   const {
      folds,
      navigationMenus,
      seoSettings,
      linkedFiles,
      settings,
      productId,
   } = props
   React.useEffect(() => {
      try {
         processExternalFiles(folds, linkedFiles)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [])

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO seoSettings={seoSettings} />
         {renderPageContent(folds)}
      </Layout>
   )
}

export default ProductPage

export async function getStaticProps({ params }) {
   const { parsedData, settings, navigationMenus, seoSettings, linkedFiles } =
      await getPageProps(params, '/products')

   return {
      props: {
         folds: parsedData,
         linkedFiles,
         navigationMenus,
         seoSettings,
         settings,
         productId: parseInt(params.id),
      },
      revalidate: 60, // will be passed to the page component as props
   }
}

export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
