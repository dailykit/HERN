/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-empty-function */
import { getServerSideSitemap } from 'next-sitemap'
import gql from 'graphql-tag'
import { graphQLClient } from '../../lib'
export const getServerSideProps = async (ctx) => {
    // Method to source urls from cms
    // const urls = await fetch('https//example.com/api')
    const client = await graphQLClient()
    const { products } = await client.request(GET_PRODUCT_ID)
    const { simpleRecipeYields: recipes } = await client.request(GET_RECIPE_ID)
    const productFields = products.map(({ id }) => {
        return ({
            loc: `https://testhern.dailykit.org/products/${id}`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: '0.7'
        })
    })
    const recipeFields = recipes.map(({ id }) => ({
        loc: `https://testhern.dailykit.org/recipes/${id}`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: '0.7'
    }))
    return getServerSideSitemap(ctx, [...productFields, ...recipeFields])
}

// Default export to prevent next.js errors
export default function Sitemap() { }


export const GET_PRODUCT_ID = gql`
query getProducts {
    products(order_by: {id: asc}, where: {isPublished: {_eq: true}}) {
      id
    }
  }`
export const GET_RECIPE_ID = gql`
  query getRecipes {
  simpleRecipeYields(order_by: {id: asc}, where: {isArchived: {_eq: false}, baseYieldId: {_is_null: false}}) {
    id: baseYieldId
  }
}`