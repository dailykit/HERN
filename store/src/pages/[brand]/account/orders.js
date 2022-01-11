import React from 'react'
import { useRouter } from 'next/router'

import { useUser } from '../../../context'
import {
   getPageProps,
   getRoute,
   isClient,
   processExternalFiles,
   renderPageContent,
} from '../../../utils'
import {
   SEO,
   Layout,
   LoginWarning,
   ExternalJSCSSFiles,
} from '../../../components'

const OrdersPage = props => {
   const router = useRouter()
   const { isAuthenticated, isLoading } = useUser()
   const { folds, settings, navigationMenus, seoSettings, linkedFiles } = props

   React.useEffect(() => {
      if (!isAuthenticated && !isLoading) {
         isClient && localStorage.setItem('landed_on', location.href)
         // router.push(getRoute('/get-started/register'))
      }
   }, [isAuthenticated, isLoading])

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
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

export default OrdersPage

export const getStaticProps = async ({ params }) => {
   const { parsedData, settings, navigationMenus, seoSettings, linkedFiles } =
      await getPageProps(params, '/account/orders')

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
