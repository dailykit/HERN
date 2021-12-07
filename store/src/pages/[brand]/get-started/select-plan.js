import React from 'react'
import { useRouter } from 'next/router'
import {
   getPageProps,
   getRoute,
   isClient,
   renderPageContent,
   processExternalFiles,
} from '../../../utils'
import { SEO, Layout, LoginWarning } from '../../../components'
import { useUser } from '../../../context'

const SelectPlan = props => {
   const router = useRouter()
   const { settings, linkedFiles, folds, seoSettings } = props
   const { isAuthenticated, isLoading } = useUser()
   React.useEffect(() => {
      if (!isAuthenticated && !isLoading) {
         isClient && localStorage.setItem('landed_on', location.href)
         // router.push(getRoute('/get-started/register'))
      }
   }, [isAuthenticated, isLoading])

   React.useEffect(() => {
      if (isClient) {
         const plan = localStorage.getItem('plan')
         if (plan) {
            router.push(getRoute('/get-started/select-delivery'))
         }
      }
   }, [])

   React.useEffect(() => {
      try {
         processExternalFiles(folds, linkedFiles)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [folds])

   return (
      <Layout settings={settings}>
         <SEO seoSettings={seoSettings} />
         {!isAuthenticated && !isLoading ? (
            <LoginWarning />
         ) : (
            <main>{renderPageContent(folds)}</main>
         )}
      </Layout>
   )
}

export default SelectPlan

export const getStaticProps = async ({ params }) => {
   const { parsedData, settings, seoSettings, linkedFiles } =
      await getPageProps(params, '/get-started/select-plan')

   return {
      props: { folds: parsedData, linkedFiles, settings, seoSettings },
      revalidate: 60,
   }
}
export const getStaticPaths = () => {
   return {
      paths: [],
      fallback: 'blocking',
   }
}
