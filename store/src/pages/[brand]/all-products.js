import router from 'next/router'
import React from 'react'
import styled from 'styled-components'
import { Layout, SEO } from '../../components'
import { NAVIGATION_MENU, WEBSITE_PAGE } from '../../graphql'
import { graphQLClient } from '../../lib'
import { fileParser, getSettings, get_env } from '../../utils'
import ReactHtmlParser from 'react-html-parser'
import axios from 'axios'

// Page for displaying all products
const AllProducts = ({ params, seo, settings, navigationMenus, folds }) => {
   React.useEffect(() => {
      try {
         if (folds.length && typeof document !== 'undefined') {
            const scripts = folds.flatMap(fold => fold.scripts)
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
   }, [folds])

   const renderComponent = fold => {
      try {
         if (fold.component) {
            switch (fold.component) {
               case 'Products':
                  return <Products />
               default:
                  return null
            }
         } else if (fold.extension === 'html') {
            return ReactHtmlParser(fold.content)
         } else {
            // const url = get_env('EXPRESS_URL') + `/template/hydrate-fold`
            const url = 'http://localhost:4000' + `/template/hydrate-fold`
            console.log(url)
            axios
               .post(url, {
                  id: fold.id,
                  brandId: settings['brand']['id'],
               })
               .then(response => {
                  const { data } = response
                  const targetDiv = document.getElementById(fold.id)
                  targetDiv.innerHTML = ReactHtmlParser(data)
               })
            return 'Loading...'
            // make request to template service
         }
      } catch (err) {
         console.log(err)
      }
   }

   const renderPageContent = folds => {
      return folds.map(fold => (
         <div key={fold.id} id={fold.id}>
            {renderComponent(fold)}
         </div>
      ))
   }

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO title="All Products" />
         <Main>{renderPageContent(folds)}</Main>
      </Layout>
   )
}

export default AllProducts

const Products = () => {
   return <h1>Products</h1>
}

export async function getStaticProps(ctx) {
   const params = ctx.params
   const domain = 'test.dailykit.org'
   // const domain =
   //    process.env.NODE_ENV === 'production'
   //       ? params.domain
   //       : 'test.dailykit.org'
   //page data

   //brand settings
   const { seo, settings } = await getSettings(domain, `/products`)

   //page folds data
   const client = await graphQLClient()
   const data = await client.request(WEBSITE_PAGE, {
      domain: params.brand,
      route: '/products',
   })

   if (data.website_websitePage.length > 0) {
      //parsed data of page
      const parsedData = await fileParser(
         data.website_websitePage[0]['websitePageModules']
      )
      console.log(parsedData)

      //navigation menu for page

      const navigationMenu = await client.request(NAVIGATION_MENU, {
         navigationMenuId:
            data.website_websitePage[0]['linkedNavigationMenuId'],
      })

      //navigation menus for page
      const navigationMenus = navigationMenu.website_navigationMenuItem
      const props = {
         params,
         navigationMenus,
         seo,
         settings,
         folds: parsedData,
      }
      return { props, revalidate: 1 }
   } else {
      const props = {
         params,
         seo,
         settings,
         data: data.website_websitePage,
         navigationMenus: [],
      }
      return { props, revalidate: 1 }
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
