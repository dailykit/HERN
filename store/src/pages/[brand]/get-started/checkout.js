import React from 'react'
import { useRouter } from 'next/router'
import {
   isClient,
   getRoute,
   processExternalFiles,
   renderPageContent,
   getPageProps,
} from '../../../utils'
import { SEO, Layout, LoginWarning } from '../../../components'
import { useUser } from '../../../context'

const Checkout = props => {
   const router = useRouter()
   const { isAuthenticated, isLoading } = useUser()
   const { settings, folds, seoSettings, linkedFiles } = props
   React.useEffect(() => {
      if (!isAuthenticated && !isLoading) {
         isClient && localStorage.setItem('landed_on', location.href)
         // router.push(getRoute('/get-started/register'))
      }
   }, [isAuthenticated, isLoading])

   React.useEffect(() => {
      try {
         processExternalFiles(folds, linkedFiles)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [folds])

   return (
      <Layout noHeader settings={settings}>
         <SEO seoSettings={seoSettings} />
         {!isAuthenticated && !isLoading ? (
            <LoginWarning />
         ) : (
            <main>{renderPageContent(folds)}</main>
         )}
      </Layout>
   )
}
export const getStaticProps = async ({ params }) => {
   const { parsedData, settings, seoSettings, linkedFiles } =
      await getPageProps(params, '/get-started/checkout')
   return {
      props: {
         folds: parsedData,
         settings,
         seoSettings,
         linkedFiles,
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
