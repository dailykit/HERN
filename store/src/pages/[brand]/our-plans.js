import React from 'react'
import tw, { styled } from 'twin.macro'
import { useQuery } from '@apollo/react-hooks'
import { webRenderer } from '@dailykit/web-renderer'

import { isClient } from '../../utils'
import { GET_FILEID, NAVIGATION_MENU, WEBSITE_PAGE } from '../../graphql'
import { Plans } from '../../sections/select-plan'
import { SEO, Layout } from '../../components'
import { GET_FILES } from '../../graphql'
import { graphQLClient } from '../../lib'
import 'regenerator-runtime'
import { fileParser, getSettings } from '../../utils'
import ReactHtmlParser from 'react-html-parser'

const SelectPlan = props => {
   const { data, settings, navigationMenus } = props

   React.useEffect(() => {
      try {
         if (data.length && typeof document !== 'undefined') {
            const scripts = data.flatMap(fold => fold.scripts)
            const fragment = document.createDocumentFragment()

            scripts.forEach(script => {
               const s = document.createElement('script')
               s.setAttribute('type', 'text/javascript')
               s.setAttribute('src', script)
               fragment.appendChild(s)
            })

            document.body.appendChild(fragment)
         }
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [data])

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO title="Plans" />
         <Main>
            <div id="select-plan-top-01">
               {Boolean(data.length) &&
                  ReactHtmlParser(
                     data.find(fold => fold.id === 'select-plan-top-01')
                        ?.content
                  )}
            </div>
            <Plans cameFrom="our-plans" />
         </Main>
         <div id="select-plan-bottom-01">
            {Boolean(data.length) &&
               ReactHtmlParser(
                  data.find(fold => fold.id === 'select-plan-bottom-01')
                     ?.content
               )}
         </div>
      </Layout>
   )
}

export default SelectPlan

const Main = styled.main`
   min-height: calc(100vh - 128px);
`

const Header = styled.header`
   height: 480px;
   position: relative;
   ${tw`bg-gray-100 flex flex-col items-center justify-center`}
   ::before {
      content: '';
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: 0;
      background-image: url(${props => props.url});
      ${tw`bg-no-repeat bg-center bg-cover`}
   }
   ::after {
      content: '';
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: 1;
      ${tw`bg-black opacity-25`}
   }
`
export const getStaticProps = async ({ params }) => {
   const client = await graphQLClient()
   const data = await client.request(GET_FILES, {
      divId: ['select-plan-top-01', 'select-plan-bottom-01'],
   })
   const dataByRoute = await client.request(WEBSITE_PAGE, {
      domain: params.brand,
      route: '/our-plans',
   })
   // const domain =
   //    process.env.NODE_ENV === 'production'
   //       ? params.domain
   //       : 'test.dailykit.org'
   const domain = 'test.dailykit.org'
   const { seo, settings } = await getSettings(domain, '/our-plans')
   //navigation menu
   const navigationMenu = await client.request(NAVIGATION_MENU, {
      navigationMenuId:
         dataByRoute.website_websitePage[0]['website']['navigationMenuId'],
   })
   const navigationMenus = navigationMenu.website_navigationMenuItem

   const parsedData = await fileParser(data.content_subscriptionDivIds)

   return {
      props: { data: parsedData, seo, settings, navigationMenus },
      revalidate: 60, // will be passed to the page component as props
   }
}
export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
