import { graphQLClient } from '../lib'
import {
   resolveCSSJSFiles,
   getSettings,
   foldsResolver,
   getSEOSettings,
   getProductSEOSettings,
} from '.'
import { NAVIGATION_MENU, BRAND_PAGE, GET_JS_CSS_FILES } from '../graphql'

export const getPageProps = async (params, route) => {
   const client = await graphQLClient()

   //Getting data by their router
   const dataByRoute = await client.request(BRAND_PAGE, {
      domain: params.brand,
      route,
   })
   //Seo and settings(for product pages, checks route and internal page name )
   const seoSettings =
      dataByRoute?.brands_brandPages[0]?.route == '/products' &&
      dataByRoute?.brands_brandPages[0]?.internalPageName == 'Product '
         ? await getProductSEOSettings(params.id)
         : await getSEOSettings(params.brand, dataByRoute)

   //Settings
   const domain = 'test.dailykit.org'
   const { settings, seo } = await getSettings(domain, route)

   //pageModules
   const parsedData = await foldsResolver(
      dataByRoute.brands_brandPages[0]['brandPageModules']
   )

   //All the linked CSS and JS files
   const pageModules = dataByRoute.brands_brandPages[0]['brandPageModules']
   const fileIds = {
      htmlFileIds: pageModules
         .filter(file => file.fileId !== null)
         .map(file => file.fileId),
      pageModules: pageModules.map(module => module.id),
   }
   const { brands_jsCssFileLinks: linkedCSSJSFiles } = await client.request(
      GET_JS_CSS_FILES,
      {
         where: {
            _or: [
               { brandPage: { route: { _eq: route } } },
               { brandPageModuleId: { _in: fileIds.htmlFileIds } },
               { htmlFileId: { _in: fileIds.pageModules } },
               {
                  brand: {
                     _or: [
                        { isDefault: { _eq: true } },
                        { domain: { _eq: params.brand } },
                     ],
                  },
               },
            ],
         },
      }
   )

   //Linked files with page
   const linkedFiles = await resolveCSSJSFiles(linkedCSSJSFiles)

   //Navigation Menu
   const { brands_navigationMenuItem: navigationMenus } = await client.request(
      NAVIGATION_MENU,
      {
         navigationMenuId:
            dataByRoute.brands_brandPages[0]['brand']['navigationMenuId'],
      }
   )

   return {
      parsedData,
      settings,
      navigationMenus,
      seoSettings,
      seo,
      linkedFiles,
   }
}
