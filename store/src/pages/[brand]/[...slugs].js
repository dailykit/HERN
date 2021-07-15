import router from 'next/router'
import React from 'react'
import styled from 'styled-components'
import { Layout, SEO } from '../../components'
import { NAVIGATION_MENU, WEBSITE_PAGE } from '../../graphql'
import { graphQLClient } from '../../lib'
import { fileParser, getSettings } from '../../utils'
import ReactHtmlParser from 'react-html-parser'

const Index = ({ params, seo, settings, navigationMenus, data }) => {
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
         <SEO title={params.slugs[0]} />
         <Main>
            <h1>hello - {params.brand}</h1>
            {data.length == 0 && <p>I'm Zero</p>}
            <div>
               {Boolean(data.length) &&
                  data.map(fold => ReactHtmlParser(fold?.content))}
            </div>
         </Main>
      </Layout>
   )
}

export default Index

export async function getStaticProps(ctx) {
   const params = ctx.params
   const domain = 'test.dailykit.org'
   // const domain =
   //    process.env.NODE_ENV === 'production'
   //       ? params.domain
   //       : 'test.dailykit.org'
   //page data

   //brand settings
   const { seo, settings } = await getSettings(domain, `/${params.slugs[0]}`)

   //page folds data
   const client = await graphQLClient()
   const data = await client.request(WEBSITE_PAGE, {
      domain: params.brand,
      route: '/' + params.slugs.join('/'),
   })

   if (data.website_websitePage.length > 0) {
      //parsed data of page
      const parsedData = await fileParser(
         data.website_websitePage[0]['websitePageModules']
      )
      //navigation menu for page

      const navigationMenu = await client.request(NAVIGATION_MENU, {
         navigationMenuId:
            data.website_websitePage[0]['linkedNavigationMenuId'],
      })

      //navigation menus for page
      const navigationMenus = navigationMenu.website_navigationMenuItem
      const props = { params, navigationMenus, seo, settings, data: parsedData }
      return { props, revalidate: 60 }
   } else {
      const props = {
         params,
         seo,
         settings,
         data: data.website_websitePage,
         navigationMenus: [],
      }
      return { props, revalidate: 60 }
   }
}

export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}

const Main = styled.main`
   margin: auto;
   overflow-y: auto;
   max-width: 1180px;
   width: calc(100vw - 40px);
   min-height: calc(100vh - 128px);
   > section {
      width: 100%;
      max-width: 360px;
   }
`
