import React from 'react'
import { Layout, SEO, ExternalJSCSSFiles } from '../../../components'
import {
   getPageProps,
   renderPageContent,
   isClient,
   getRoute,
} from '../../../utils'
import { useRouter } from 'next/router'
import { useUser } from '../../../context'
import 'regenerator-runtime'

const ManageCardsPage = props => {
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

export default ManageCardsPage

export const getStaticProps = async ({ params }) => {
   const { parsedData, settings, navigationMenus, seoSettings, linkedFiles } =
      await getPageProps(params, '/account/cards')

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
