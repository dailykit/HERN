import { graphQLClient } from '../lib'
import { getSettings, foldsResolver } from '.'
import { NAVIGATION_MENU, WEBSITE_PAGE } from '../graphql'

export const getPageProps = async (params, route) => {
   const client = await graphQLClient()

   //Getting data by their router
   const dataByRoute = await client.request(WEBSITE_PAGE, {
      domain: params.brand,
      route,
   })

   const domain = 'test.dailykit.org'

   //Seo and settings
   const { seo, settings } = await getSettings(domain, route)

   //Module
   const parsedData = await foldsResolver(
      dataByRoute.website_websitePage[0]['websitePageModules']
   )

   //Navigation Menu
   const navigationMenu = await client.request(NAVIGATION_MENU, {
      navigationMenuId:
         dataByRoute.website_websitePage[0]['website']['navigationMenuId'],
   })
   const navigationMenus = navigationMenu.website_navigationMenuItem

   return { parsedData, seo, settings, navigationMenus }
}
