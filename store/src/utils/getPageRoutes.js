import { GET_PAGE_ROUTES } from '../graphql'
import { graphQLClient } from '../lib'

export const getPageRoutes = async (domain) => {
   const client = await graphQLClient()
   const { brands } = await client.request(GET_PAGE_ROUTES, {
      domain,
   })
   return { pageRoutes: brands?.[0]?.brandPages || null }
}

