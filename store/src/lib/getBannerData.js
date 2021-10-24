import { graphqlClient } from './graphqlClient'
import { BRAND_PAGE_MODULE } from '../graphql'
export const getBannerData = async where => {
   try {
      const client = await graphqlClient()
      const variables = {
         where
      }
      const { data: { content_experienceDivId: experienceDivs = [] } = {} } =
         await client.query({ query: BRAND_PAGE_MODULE, variables })

      const bannerData = experienceDivs.map(div => ({
         id: div.id,
         subscriptionDivFileId: div.brandPage.brandPageModules.map(
            pageModule => pageModule.subscriptionDivFileId
         )
      }))
      return bannerData
   } catch (error) {
      console.log(error)
   }
}
