const axios = require('axios')
const resolver = {
   Query: {
      getUser: async (_, args, { ayrshare_api_key }) => {
         try {
            const response = await axios({
               method: 'GET',
               headers: {
                  // API Key
                  Authorization: `Bearer ${ayrshare_api_key}`
               },
               url: 'https://app.ayrshare.com/api/user'
            })
            const data = await response.data
            return data
         } catch (error) {
            return error
         }
      },

      getAnalytics: async (_, args, { ayrshare_api_key }) => {
         try {
            const { lastDays } = args
            const response = await axios({
               method: 'GET',
               headers: {
                  Authorization: `Bearer ${ayrshare_api_key}`
               },
               url: `https://app.ayrshare.com/api/analytics/links?lastDays=${lastDays}`
            })
            const data = await response.data
            return data
         } catch (error) {
            return error
         }
      },

      getComments: async (_, args, { ayrshare_api_key }) => {
         try {
            const { postId } = args
            const response = await axios({
               method: 'GET',
               headers: {
                  Authorization: `Bearer ${ayrshare_api_key}`
               },
               url: `https://app.ayrshare.com/api/comments?id=${postId}`
            })
            const data = await response.data
            return data
         } catch (error) {
            return error
         }
      }
   }
}
module.exports = resolver
