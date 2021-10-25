import { graphqlClient } from './graphqlClient'
import { NAVBAR_MENU } from '../graphql'
export const getNavigationMenuItems = async domain => {
   const client = await graphqlClient()
   const variables = {
      brandId: 1069, // hardcoded for now until we have a better way to get the brandId
      domain: 'stayinsocial.com'
   }
   const { data: { brands_navigationMenu: navigationMenu = [] } = {} } =
      await client.query({ query: NAVBAR_MENU, variables })
   return navigationMenu[0]?.navigationMenuItems
}
