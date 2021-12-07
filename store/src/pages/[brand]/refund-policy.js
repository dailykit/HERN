import React from 'react'
import { SEO, Layout } from '../../components'
import { processJsFile, renderPageContent, getPageProps } from '../../utils'

const RefundPolicyPage = props => {
   const { folds, settings, seoSettings } = props

   React.useEffect(() => {
      try {
         processJsFile(folds)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [folds])

   return (
      <Layout settings={settings}>
         <SEO seoSettings={seoSettings} />
         <main>{renderPageContent(folds)}</main>
      </Layout>
   )
}

export default RefundPolicyPage

export const getStaticProps = async ({ params }) => {
   const { parsedData, seo, settings, navigationMenus, seoSettings } = await getPageProps(
      params,
      '/refund-policy'
   )

   return {
      props: { folds: parsedData, seo, settings, navigationMenus, seoSettings },
      revalidate: 60, // will be passed to the page component as props
   }
}
export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
