import React from 'react'
import gql from 'graphql-tag'
import { getPageRoutes } from '../utils/getpageRoutes'
import { graphQLClient } from '../lib'

const Sitemap = () => { }

export const getServerSideProps = async ({ req, res }) => {
    const client = await graphQLClient()

    // using hostname as baseURL-------(1)
    const baseUrl = 'https://' + req.headers.host
    const { pageRoutes } = await getPageRoutes(req.headers.host)
    // console.log(pageRoutes, "pageRoutes---⛵🏩")

    const { products } = await client.request(GET_PRODUCT_ID)
    const { simpleRecipeYields: recipes } = await client.request(GET_RECIPE_ID)

    //product Pages
    const productFields = products.map(({ id }) => {
        return `${baseUrl}/products/${id}`
    })

    //recipe Pages
    const recipeFields = recipes.map(({ id }) => {
        return `${baseUrl}/recipes/${id}`
    })

    //filteredRoutes
    const filteredRoutes = pageRoutes.filter(({ route }) => {
        console.log('route', route)
        return ![
            '/products',
            '/recipes',
            "/checkout",
            "/404",
        ].includes(route)
    })

    const simpleRoutes = filteredRoutes.map(({ route }) => {
        const pureRoute = route.replace(/ /g, '')
        return `${baseUrl}${pureRoute}`
    })

    const allRoutes = [...simpleRoutes, ...productFields, ...recipeFields]

    // generating sitemap-url for each page-------(5)
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          ${allRoutes
            .map(url => {
                return `
                <url>
                  <loc>${url}</loc>
                  <lastmod>${new Date().toISOString()}</lastmod>
                  <changefreq>monthly</changefreq>
                  <priority>1.0</priority>
                </url>
              `
            })
            .join('')}
        </urlset>
      `

    //header on the response to signal back to the browser that we're returning an .xml file-----(5)
    res.setHeader('Content-Type', 'text/xml')
    // passing the generated 'sitemap' string-------(6)
    res.write(sitemap)
    res.end()
    //no use of this props, but to meet the requirements of the getServerSideProps function so that it doesn't throw error
    return {
        props: {},
    }
}

export default Sitemap

// Name of the page is like this so that it look like this https://mydomain.com/sitemap.xml
//because Google and other browsers looks for this name in the pages folder.

export const GET_PRODUCT_ID = gql`
   query getProducts {
      products(order_by: { id: asc }, where: { isPublished: { _eq: true } }) {
         id
      }
   }
`
export const GET_RECIPE_ID = gql`
   query getRecipes {
      simpleRecipeYields(
         order_by: { id: asc }
         where: { isArchived: { _eq: false }, baseYieldId: { _is_null: false } }
      ) {
         id: baseYieldId
      }
   }
`
