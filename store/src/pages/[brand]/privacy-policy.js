import React from 'react'
import tw from 'twin.macro'
import ReactHtmlParser from 'react-html-parser'
import { Layout, StyledArticle } from '../../components'
import { graphQLClient, useConfig } from '../../lib'
import { getSettings } from '../../utils'
import { NAVIGATION_MENU, WEBSITE_PAGE } from '../../graphql'

const PrivacyPolicy = props => {
   const { value } = useConfig('brand').configOf('Privacy Policy')
   const { seo, settings, navigationMenus } = props
   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <div tw="min-h-full text-gray-600 md:mx-64 mx-10 mb-4">
            <h1 tw="my-10  text-5xl text-gray-800 text-center py-2 border-gray-200 border-b-2">
               Privacy Policy
            </h1>
            <div tw="text-lg">
               <StyledArticle>{ReactHtmlParser(value)}</StyledArticle>
            </div>
         </div>
      </Layout>
   )
}
export const getStaticProps = async ({ params }) => {
   const client = await graphQLClient()
   const dataByRoute = await client.request(WEBSITE_PAGE, {
      domain: params.brand,
      route: '/privacy-policy',
   })
   // const domain =
   //    process.env.NODE_ENV === 'production'
   //       ? params.domain
   //       : 'test.dailykit.org'
   const domain = 'test.dailykit.org'
   const { seo, settings } = await getSettings(domain, '/privacy-policy')
   //navigation menu
   const navigationMenu = await client.request(NAVIGATION_MENU, {
      navigationMenuId:
         dataByRoute.website_websitePage[0]['website']['navigationMenuId'],
   })
   const navigationMenus = navigationMenu.website_navigationMenuItem
   return {
      props: {
         seo,
         settings,
         navigationMenus,
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
export default PrivacyPolicy
