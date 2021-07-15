import React from 'react'
import Link from 'next/link'
import tw, { styled } from 'twin.macro'

import { SEO, Layout } from '../../components'
import { getRoute, getSettings } from '../../utils'
import { NAVIGATION_MENU, WEBSITE_PAGE } from '../../graphql'
import { graphQLClient } from '../../lib'

const Wrapper = styled.div`
   ${tw`flex items-center flex-col pt-24`}
`

const Heading = tw.h1`
  text-2xl text-gray-500 uppercase
`

const Text = tw.p`
  text-xl text-gray-700
`

export default props => {
   const { seo, settings, navigationMenus } = props
   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO title="Page Not Found" />
         <Wrapper>
            <Heading>Oops!</Heading>
            <Text>We can't find the page that you are looking for..</Text>
            <Link
               href={getRoute('/subscription')}
               tw="mt-4 text-blue-500 border-b border-blue-500"
            >
               Go to Home
            </Link>
         </Wrapper>
      </Layout>
   )
}
export const getStaticProps = async ({ params }) => {
   const client = await graphQLClient()
   const dataByRoute = await client.request(WEBSITE_PAGE, {
      domain: params.brand,
      route: '/404',
   })
   // const domain =
   //    process.env.NODE_ENV === 'production'
   //       ? params.domain
   //       : 'test.dailykit.org'
   const domain = 'test.dailykit.org'
   const { settings, seo } = await getSettings(domain, '/404')
   //navigation menu
   const navigationMenu = await client.request(NAVIGATION_MENU, {
      navigationMenuId:
         dataByRoute.website_websitePage[0]['website']['navigationMenuId'],
   })
   const navigationMenus = navigationMenu.website_navigationMenuItem
   return {
      props: {
         settings,
         seo,
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
