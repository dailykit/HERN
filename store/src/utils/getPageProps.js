import { graphQLClient } from '../lib'
import { getSettings, foldsResolver } from '.'
import { NAVIGATION_MENU, BRAND_PAGE } from '../graphql'

export const getPageProps = async (params, route) => {
   const client = await graphQLClient()

   //Getting data by their router
   const dataByRoute = await client.request(BRAND_PAGE, {
      domain: params.brand,
      route
   })
   console.log("dataByRoute😊👉", dataByRoute)
   const seoSettings = await dataByRoute?.brands_brandPages[0]?.brandPageSettings.filter((setting) => setting?.brandPageSetting?.type === 'seo')

   const domain = 'test.dailykit.org'
   //Seo and settings
   const { seo, settings } = await getSettings(domain, route)

   //Module
   const parsedData = await foldsResolver(
      dataByRoute.brands_brandPages[0]['brandPageModules']
   )

   //Navigation Menu
   const navigationMenu = await client.request(NAVIGATION_MENU, {
      navigationMenuId:
         dataByRoute.brands_brandPages[0]['brand']['navigationMenuId'],
   })
   const navigationMenus = navigationMenu.brands_navigationMenuItem

   return { parsedData, seo, settings, navigationMenus, seoSettings }
}

