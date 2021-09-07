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
   const { isAuthenticated } = useUser()
   const { seo, settings, folds } = props
   React.useEffect(() => {
      if (!isAuthenticated) {
         isClient && localStorage.setItem('landed_on', location.href)
         router.push(getRoute('/get-started/register'))
      }
   }, [isAuthenticated])

   React.useEffect(() => {
      try {
         processJsFile(folds)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [folds])

   return (
      <Layout noHeader settings={settings}>
         <SEO title="Checkout" />
         <main className="hern-checkout">{renderPageContent(folds)}</main>
      </Layout>
   )
}
export const getStaticProps = async ({ params }) => {
   // const domain =
   //    process.env.NODE_ENV === 'production'
   //       ? params.domain
   //       : 'test.dailykit.org'

   const { parsedData, seo, settings } = await getPageProps(
      params,
      '/get-started/checkout'
   )
   return {
      props: {
         folds: parsedData,
         seo,
         settings,
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
