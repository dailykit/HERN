import React from 'react'
import { SEO, Layout } from '../../components'
import {
   processExternalFiles,
   renderPageContent,
   getPageProps,
} from '../../utils'
import 'regenerator-runtime'

const Index = props => {
   const { folds, settings, navigationMenus, seoSettings, linkedFiles } = props

   React.useEffect(() => {
      try {
         processExternalFiles(folds, linkedFiles)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [folds, linkedFiles])

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO seoSettings={seoSettings} />
         <main>{renderPageContent(folds)}</main>
      </Layout>
   )
}

export default Index

export const getStaticProps = async ({ params }) => {
   const {
      parsedData,
      seo,
      settings,
      navigationMenus,
      seoSettings,
      linkedFiles,
   } = await getPageProps(params, '/' + params.slugs.join('/'))

   return {
      props: {
         params,
         folds: parsedData,
         seo,
         settings,
         navigationMenus,
         seoSettings,
         linkedFiles,
      },
      revalidate: 60, // will be passed to the page component as props
   }
}
export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
