import React from 'react'
import { useRouter } from 'next/router'

import { useUser } from '../../../context'
import { SEO, Layout, ExternalJSCSSFiles } from '../../../components'
import {
   getPageProps,
   isClient,
   renderPageContent,
   getRoute,
} from '../../../utils'

const WalletPage = props => {
   const router = useRouter()
   const { isAuthenticated, isLoading } = useUser()
   const { folds, settings, navigationMenus, seoSettings, linkedFiles } = props

   React.useEffect(() => {
      if (!isAuthenticated && !isLoading) {
         isClient && localStorage.setItem('landed_on', location.href)
         router.push(getRoute('/login'))
      }
   }, [isAuthenticated, isLoading])

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO seoSettings={seoSettings} />
         <ExternalJSCSSFiles externalFiles={linkedFiles} />
         {isAuthenticated && !isLoading && (
            <main>{renderPageContent(folds)}</main>
         )}
      </Layout>
   )
}

export const getStaticProps = async ({ params }) => {
   const { parsedData, settings, navigationMenus, seoSettings, linkedFiles } =
      await getPageProps(params, '/account/wallet')

   return {
      props: {
         folds: parsedData,
         linkedFiles,
         settings,
         navigationMenus,
         seoSettings,
      },
      // revalidate: 60, // will be passed to the page component as props
   }
}

export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}

export default WalletPage
