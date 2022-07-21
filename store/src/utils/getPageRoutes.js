import { GET_PAGE_ROUTES, GET_DISALLOWED_PAGE_ROUTES } from '../graphql'
import { graphQLClient } from '../lib'

export const getPageRoutes = async domain => {
   const client = await graphQLClient()
   const { brands } = await client.request(GET_PAGE_ROUTES, {
      domain,
   })
   const brandPages =
      brands.length === 0
         ? null
         : brands[0].brandPages.length === 0
         ? brands[1].brandPages.length === 0
            ? null
            : brands[1].brandPages
         : brands[0].brandPages
   return { pageRoutes: brandPages }
}

export const getDisallowedPageRoutes = async domain => {
   const client = await graphQLClient()
   const { brands } = await client.request(GET_DISALLOWED_PAGE_ROUTES, {
      domain,
   })
   const brandPages =
      brands.length === 0
         ? null
         : brands[0].brandPages.length === 0
         ? brands[1].brandPages.length === 0
            ? null
            : brands[1].brandPages
         : brands[0].brandPages
   return { pageRoutes: brandPages }
}
