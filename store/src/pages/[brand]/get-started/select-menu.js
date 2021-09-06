import React from 'react'
import { useRouter } from 'next/router'
import { useConfig } from '../../../lib'
import { useUser } from '../../../context'
import { SEO, Layout } from '../../../components'
import {
   getPageProps,
   getRoute,
   isClient,
   processJsFile,
   renderPageContent,
} from '../../../utils'

const SelectMenu = props => {
   const { settings, folds } = props
   const router = useRouter()
   const { isAuthenticated } = useUser()
   React.useEffect(() => {
      if (!isAuthenticated) {
         isClient && localStorage.setItem('landed_on', location.href)
         router.push(getRoute('/get-started/register'))
      }
   }, [isAuthenticated])

   React.useEffect(() => {
      try {
         processJsFile(folds)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [folds])

   const { configOf } = useConfig('Select-Menu')
   const config = configOf('select-menu-header')

   return (
      <Layout settings={settings}>
         <SEO title="Select Menu" />
         <main className="hern-select-menu">{renderPageContent(folds)}</main>
      </Layout>
   )
}

export default SelectMenu

export async function getStaticProps({ params }) {
   // const domain =
   //    process.env.NODE_ENV === 'production'
   //       ? params.domain
   //       : 'test.dailykit.org'

   const { parsedData, seo, settings } = await getPageProps(
      params,
      '/get-started/select-menu'
   )

   return {
      props: { folds: parsedData, seo, settings },
      revalidate: 60, // will be passed to the page component as props
   }
}

export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
