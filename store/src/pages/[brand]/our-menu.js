/* eslint-disable jsx-a11y/no-onchange */

import React from 'react'
import { processJsFile, renderPageContent, getPageProps } from '../../utils'
import { Layout, SEO } from '../../components'
import 'regenerator-runtime'

const OurMenu = props => {
   const { folds, settings, navigationMenus, seoSettings } = props

   React.useEffect(() => {
      try {
         processJsFile(folds)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [folds])

   return (<>
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO title="our-menu" seoSettings={seoSettings} />
         <main className="hern-our-menu">{renderPageContent(folds)}</main>
      </Layout>
   </>
   )
}

export default OurMenu

export async function getStaticProps({ params }) {
   const { parsedData, seo, settings, navigationMenus, seoSettings } = await getPageProps(
      params,
      '/our-menu'
   )

   return {
      props: { folds: parsedData, seo, settings, navigationMenus, seoSettings },
      revalidate: 60, // will be passed to the page component as props
   }
}

export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
