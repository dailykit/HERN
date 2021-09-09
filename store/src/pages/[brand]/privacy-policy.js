import React from 'react'
import { processJsFile, renderPageContent, getPageProps } from '../../utils'
import { Layout, SEO } from '../../components'
import 'regenerator-runtime'

const PraivacyPolicy = props => {
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
         <SEO title="Privacy Policy" />
         <main>{renderPageContent(folds)}</main>
      </Layout>
   )
}

export default PraivacyPolicy

export async function getStaticProps({ params }) {
   const { parsedData, seo, settings, navigationMenus } = await getPageProps(
      params,
      '/privacy-policy'
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
