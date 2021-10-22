import { graphQLClient } from '../lib'
import { getSettings, foldsResolver, getSEOSettings } from '.'
import { NAVIGATION_MENU, BRAND_PAGE } from '../graphql'

export const getPageProps = async (params, route) => {
   const client = await graphQLClient()

   //Getting data by their router
   const dataByRoute = await client.request(BRAND_PAGE, {
      domain: params.brand,
      route,
   })

   //Seo and settings
   const seoSettings = await getSEOSettings(params.brand, dataByRoute)

   //Settings
   const domain = 'test.dailykit.org'
   const { settings } = await getSettings(domain, route)

   //pageModules
   const parsedData = await foldsResolver(
      dataByRoute.brands_brandPages[0]['brandPageModules']
   )

   //Navigation Menu
   const { brands_navigationMenuItem: navigationMenus } = await client.request(
      NAVIGATION_MENU,
      {
         navigationMenuId:
            dataByRoute.brands_brandPages[0]['brand']['navigationMenuId'],
      }
   )
   

   return { parsedData, settings, navigationMenus, seoSettings }
}
