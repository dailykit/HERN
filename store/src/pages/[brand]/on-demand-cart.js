import React from 'react'
import { useRouter } from 'next/router'
import { SEO, Layout } from '../../components'
import { useUser } from '../../context'
import {
   getPageProps,
   getRoute,
   isClient,
   processJsFile,
   renderPageContent,
} from '../../utils'

const CartPage = props => {
   const router = useRouter()
   const { isAuthenticated, isLoading } = useUser()
   const { folds, settings, navigationMenus } = props
   React.useEffect(() => {
      try {
         processJsFile(folds)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [folds])

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO title="Cart" />
         <main>{renderPageContent(folds)}</main>
      </Layout>
   )
}

export default CartPage

export const getStaticProps = async ({ params }) => {
   const { parsedData, seo, settings, navigationMenus } = await getPageProps(
      params,
      '/on-demand-cart'
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
