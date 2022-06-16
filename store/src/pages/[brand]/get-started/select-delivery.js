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

const SelectDelivery = props => {
   const router = useRouter()
   const { isAuthenticated, isLoading, user } = useUser()
   const { settings, linkedFiles, folds, seoSettings } = props
   React.useEffect(() => {
      if (!isAuthenticated && !isLoading) {
         isClient && localStorage.setItem('landed_on', location.href)
         router.push(getRoute('/login'))
      }
   }, [isAuthenticated, isLoading])

   React.useEffect(() => {
      if (isAuthenticated && !isLoading) {
         isClient && user?.isSubscriber && router.push(getRoute('/menu'))
      }
   }, [isAuthenticated, isLoading])
   React.useEffect(() => {
      if (isClient && !localStorage.getItem('plan')) {
         router.push('/get-started/select-plan')
      }
   }, [])

   return (
      <Layout noHeader settings={settings}>
         <SEO seoSettings={seoSettings} />
         <ExternalJSCSSFiles externalFiles={linkedFiles} />
         {isAuthenticated && !isLoading && (
            <main>{renderPageContent(folds)}</main>
         )}
      </Layout>
   )
}
export const getStaticProps = async ({ params }) => {
   const { parsedData, settings, seoSettings, linkedFiles } =
      await getPageProps(params, '/get-started/select-delivery')

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
export default SelectDelivery
