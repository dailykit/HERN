import React from 'react'
import { useRouter } from 'next/router'
import { useUser } from '../../../context'
import { SEO, Layout } from '../../../components'
import {
   getPageProps,
   getRoute,
   isClient,
   processJsFile,
   renderPageContent,
} from '../../../utils'

const SelectDelivery = props => {
   const router = useRouter()
   const { isAuthenticated, isLoading } = useUser()
   const { seo, settings, folds } = props
   React.useEffect(() => {
      if (!isAuthenticated && !isLoading) {
         isClient && localStorage.setItem('landed_on', location.href)
         router.push(getRoute('/get-started/register'))
      }
   }, [isAuthenticated, isLoading])

   React.useEffect(() => {
      if (isClient && !localStorage.getItem('plan')) {
         router.push('/get-started/select-plan')
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
      <Layout noHeader settings={settings}>
         <SEO title="Delivery" />
         <main className="hern-select-delivery">
            {renderPageContent(folds)}
         </main>
      </Layout>
   )
}
export const getStaticProps = async ({ params }) => {
   // const domain =
   //    process.env.NODE_ENV === 'production'
   //       ? params.domain
   //       : 'test.dailykit.org'
   //const domain = 'test.dailykit.org'

   const { parsedData, seo, settings } = await getPageProps(
      params,
      '/get-started/select-delivery'
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
export default SelectDelivery
