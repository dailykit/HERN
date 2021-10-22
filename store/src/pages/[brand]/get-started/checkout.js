import React from 'react'
import { useRouter } from 'next/router'
import {
   isClient,
   getRoute,
   processJsFile,
   renderPageContent,
   getPageProps,
} from '../../../utils'
import { SEO, Layout } from '../../../components'
import { useUser } from '../../../context'

const Checkout = props => {
   const router = useRouter()
   const { isAuthenticated, isLoading } = useUser()
   const { seo, settings, folds, seoSettings } = props
   React.useEffect(() => {
      if (!isAuthenticated && !isLoading) {
         isClient && localStorage.setItem('landed_on', location.href)
         router.push(getRoute('/get-started/register'))
      }
   }, [isAuthenticated, isLoading])

   React.useEffect(() => {
      try {
         processJsFile(folds)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [folds])

   return (
      <Layout noHeader settings={settings}>
         <SEO seoSettings={seoSettings} />
         <main className="hern-checkout">{renderPageContent(folds)}</main>
      </Layout>
   )
}
export const getStaticProps = async ({ params }) => {

   const { parsedData, seo, settings, seoSettings } = await getPageProps(
      params,
      '/get-started/checkout'
   )
   return {
      props: {
         folds: parsedData,
         seo,
         settings,
         seoSettings
      },
      revalidate: 1,
   }
}
export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}

export default Checkout
