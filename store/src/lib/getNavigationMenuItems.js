import { graphqlClient } from './graphqlClient'
import { NAVBAR_MENU } from '../graphql'
export const getNavigationMenuItems = async domain => {
   const client = await graphqlClient()
   const variables = {
      domain
   }
   const { data: { website_navigationMenu: navigationMenu = [] } = {} } =
      await client.query({ query: NAVBAR_MENU, variables })
   return navigationMenu[0]?.navigationMenuItems
}
