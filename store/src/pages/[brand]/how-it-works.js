import React from 'react'
import { SEO, Layout } from '../../components'
import { processJsFile, renderPageContent, getPageProps } from '../../utils'
import 'regenerator-runtime'

const HowItWorks = props => {
   const { folds, settings, navigationMenus } = props

   React.useEffect(() => {
      try {
         processJsFile(folds)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [folds])

   return (
      <Layout settings={settings}>
         <SEO title="How it works" />
         <main>{renderPageContent(folds)}</main>
      </Layout>
   )
}

export default HowItWorks

export const getStaticProps = async ({ params }) => {
   const { parsedData, seo, settings, navigationMenus } = await getPageProps(
      params,
      '/how-it-works'
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
