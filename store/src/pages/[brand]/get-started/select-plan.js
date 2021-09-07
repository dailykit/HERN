import React from 'react'
import { useRouter } from 'next/router'
import {
   getPageProps,
   getRoute,
   isClient,
   renderPageContent,
   processJsFile,
} from '../../../utils'
import { SEO, Layout } from '../../../components'
import { useUser } from '../../../context'

const SelectPlan = props => {
   const router = useRouter()
   const { settings, folds } = props
   const { isAuthenticated } = useUser()
   React.useEffect(() => {
      if (!isAuthenticated) {
         isClient && localStorage.setItem('landed_on', location.href)
         router.push(getRoute('/get-started/register'))
      }
   }, [isAuthenticated])

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
         processJsFile(folds)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [folds])

   return (
      <Layout settings={settings}>
         <SEO title="Plans" />
         <main className="hern-get-started-select-plan__main">
            {renderPageContent(folds)}
         </main>
      </Layout>
   )
}

export default SelectPlan

export const getStaticProps = async ({ params }) => {
   const { parsedData, seo, settings } = await getPageProps(
      params,
      '/get-started/select-plan'
   )

   return {
      props: { folds: parsedData, seo, settings },
      revalidate: 60,
   }
}
export const getStaticPaths = () => {
   return {
      paths: [],
      fallback: 'blocking',
   }
}
