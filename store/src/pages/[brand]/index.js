import React from 'react'
import Link from 'next/link'
import 'regenerator-runtime'
import tw, { styled, css } from 'twin.macro'
import ReactHtmlParser from 'react-html-parser'

import { GET_FILES, NAVIGATION_MENU, WEBSITE_PAGE } from '../../graphql'

import { SEO, Layout, PageLoader } from '../../components'
import { graphQLClient } from '../../lib'
import { fileParser, getSettings } from '../../utils'

const Index = props => {
   const { data, settings, random, revalidate, navigationMenus } = props
   // const params = useQueryParams()
   // const [loading, setLoading] = React.useState(false)
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
   // React.useEffect(() => {
   //    if (params) {
   //       const code = params['invite-code']
   //       if (code) {
   //          localStorage.setItem('code', code)
   //       }
   //       const token = params['imp-token']
   //       if (token && isClient) {
   //          localStorage.setItem('token', token)
   //          localStorage.setItem('impersonating', true)
   //          window.location.href =
   //             window.location.origin + window.location.pathname
   //       }
   //    }
   // }, [params])

   // if (loading) return <PageLoader />

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO title="Home" />
         <Main>
            <div style={{ height: 260, display: 'grid', placeItems: 'center' }}>
               <h1>
                  {random} - {revalidate}
               </h1>
            </div>
            <div id="home-bottom-01">
               {Boolean(data.length) &&
                  ReactHtmlParser(
                     data.find(fold => fold.id === 'home-bottom-01')?.content
                  )}
            </div>
         </Main>
      </Layout>
   )
}

export default Index

export async function getStaticProps(ctx) {
   const params = ctx.params
   const client = await graphQLClient()
   const data = await client.request(GET_FILES, {
      divId: ['home-bottom-01'],
   })
   const dataByRoute = await client.request(WEBSITE_PAGE, {
      domain: params.brand,
      route: '/',
   })
   const navigationMenu = await client.request(NAVIGATION_MENU, {
      navigationMenuId:
         dataByRoute.website_websitePage[0]['website']['navigationMenuId'],
   })

   // const domain =
   //    process.env.NODE_ENV === 'production'
   //       ? params.domain
   //       : 'test.dailykit.org'
   const domain = 'test.dailykit.org'
   const { seo, settings } = await getSettings(domain, '/')
   const parsedData = await fileParser(data.content_subscriptionDivIds)
   const navigationMenus = navigationMenu.website_navigationMenuItem
   return {
      props: {
         data: parsedData,
         seo,
         settings,
         random: Math.floor(Math.random() * 1000 + 1),
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

const Main = styled.main`
   min-height: calc(100vh - 128px);
`

const Tagline = styled.h1`
   width: 100%;
   max-width: 480px;
   font-family: 'DM Serif Display', serif;
   ${tw`mb-4 text-teal-900 text-4xl md:text-5xl font-bold`}
`

const Header = styled.header`
   height: 560px;
   background-size: cover;
   background-position: bottom;
   background-repeat: no-repeat;
   background-image: url('https://dailykit-assets.s3.us-east-2.amazonaws.com/subs-icons/banner.png');
   ${tw`relative bg-gray-200 overflow-hidden flex flex-col justify-center`}
   div {
      margin: auto;
      max-width: 980px;
      width: calc(100vw - 40px);
   }
   :after {
      background: linear-gradient(-45deg, #ffffff 16px, transparent 0),
         linear-gradient(45deg, #ffffff 16px, transparent 0);
      background-position: left-bottom;
      background-repeat: repeat-x;
      background-size: 24px 24px;
      content: ' ';
      display: block;
      position: absolute;
      bottom: 0px;
      left: 0px;
      width: 100%;
      height: 24px;
   }
`

const CTA = styled(Link)(
   ({ theme }) => css`
      ${tw`
      rounded
      px-6 h-12
      shadow-xl
      text-white
      bg-green-700
      inline-flex items-center
      uppercase tracking-wider font-medium
   `}
      ${theme?.accent && `background-color: ${theme.accent}`}
   `
)
