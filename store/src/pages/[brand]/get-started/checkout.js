import React from 'react'
import { useRouter } from 'next/router'
import {
   isClient,
   getRoute,
   renderPageContent,
   getPageProps,
} from '../../../utils'
import {
   SEO,
   Layout,
   LoginWarning,
   ExternalJSCSSFiles,
} from '../../../components'
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

   return (
      <Layout noHeader settings={settings}>
         <SEO seoSettings={seoSettings} />
         <ExternalJSCSSFiles externalFiles={linkedFiles} />
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
