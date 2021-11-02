import React from 'react'
import {
   processExternalFiles,
   renderPageContent,
   getPageProps,
} from '../../utils'
import { Layout, SEO } from '../../components'
import 'regenerator-runtime'

const PraivacyPolicy = props => {
   const { folds, settings, navigationMenus, seoSettings, linkedFiles } = props

   React.useEffect(() => {
      try {
         processExternalFiles(folds, linkedFiles)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [folds])

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO seoSettings={seoSettings} />
         <main>{renderPageContent(folds)}</main>
      </Layout>
   )
}

export default PraivacyPolicy

export async function getStaticProps({ params }) {
   const { parsedData, settings, navigationMenus, seoSettings, linkedFiles } =
      await getPageProps(params, '/privacy-policy')

   return {
      props: {
         folds: parsedData,
         linkedFiles,
         settings,
         navigationMenus,
         seoSettings,
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
