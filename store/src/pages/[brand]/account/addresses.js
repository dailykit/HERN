import React from 'react'
import { useRouter } from 'next/router'
import { useUser } from '../../../context'
import {
   isClient,
   getRoute,
   processJsFile,
   getPageProps,
   renderPageContent,
} from '../../../utils'

import { SEO, Layout } from '../../../components'

const AddressesPage = props => {
   const router = useRouter()
   const { isAuthenticated, isLoading } = useUser()
   const { folds, settings, navigationMenus } = props

   React.useEffect(() => {
      if (!isAuthenticated && !isLoading) {
         isClient && localStorage.setItem('landed_on', location.href)
         router.push(getRoute('/get-started/register'))
      }
   }, [isAuthenticated, isLoading])

   React.useEffect(() => {
      try {
         processJsFile(folds)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [folds])

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO title="Addresses" />
         <main>{renderPageContent(folds)}</main>
      </Layout>
   )
}

export default AddressesPage

export const getStaticProps = async ({ params }) => {
   const { parsedData, seo, settings, navigationMenus } = await getPageProps(
      params,
      '/account/addresses'
   )

   return {
      props: { folds: parsedData, seo, settings, navigationMenus },
      revalidate: 60, // will be passed to the page component as props
   }
}
export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
