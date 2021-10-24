import { graphqlClient } from './graphqlClient'
import { GET_PAGE_MODULES } from '../graphql'
export const getWebPageModule = async ({ domain, route }) => {
   try {
      const client = await graphqlClient()
      const brandId = 1069 // hardcoded for now until we have a way to get the brandId
      const variables = {
         where: {
            route: { _eq: route },
            brand: {
               id: { _eq: brandId },
               _or: [
                  { isDefault: { _eq: true } },
                  { domain: { _eq: 'stayinsocial.com' } }
               ]
            }
         }
      }
      const { data: { brands_brandPages: brandPage = [] } = {} } =
         await client.query({ query: GET_PAGE_MODULES, variables })
      return brandPage
   } catch (error) {
      console.log(error)
   }
}
