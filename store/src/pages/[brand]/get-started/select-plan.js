import React from 'react'
import { useRouter } from 'next/router'
import {
   getPageProps,
   getRoute,
   isClient,
   renderPageContent,
} from '../../../utils'
import {
   SEO,
   Layout,
   LoginWarning,
   ExternalJSCSSFiles,
} from '../../../components'
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

   return (
      <Layout settings={settings}>
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

export default SelectPlan

export const getStaticProps = async ({ params }) => {
   const { parsedData, settings, seoSettings, linkedFiles } =
      await getPageProps(params, '/get-started/select-plan')

   return {
      props: { folds: parsedData, linkedFiles, settings, seoSettings },
      // revalidate: 60,
   }
}
export const getStaticPaths = () => {
   return {
      paths: [],
      fallback: 'blocking',
   }
}
