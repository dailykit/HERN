import React from 'react'
import { SEO, Layout } from '../../components'
import { getPageProps, processJsFile, renderPageContent } from '../../utils'

const ForgotPasswordPage = props => {
   const { folds, seo, settings, navigationMenus, seoSettings } = props

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
         <main>{renderPageContent(folds)}</main>
      </Layout>
   )
}

export const getStaticProps = async ({ params }) => {
   const { parsedData, seo, settings, navigationMenus, seoSettings } = await getPageProps(
      params,
      '/forgot-password'
   )

   return {
      props: { folds: parsedData, seo, settings, navigationMenus, seoSettings },
      revalidate: 1, // will be passed to the page component as props
   }
}
export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}

export default ForgotPasswordPage
