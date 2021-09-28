const axios = require('axios')

const resolver = {
   Mutation: {
      sendPost: async (_, args, { ayrshare_api_key }) => {
         try {
            const response = await axios({
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${ayrshare_api_key}`
               },
               url: 'https://app.ayrshare.com/api/post',
               data: args
            })
            const data = await response.data
            return data
         } catch (error) {
            return error
         }
      },

      analyticsPost: async (_, args, { ayrshare_api_key }) => {
         try {
            const response = await axios({
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${ayrshare_api_key}`
               },
               url: 'https://app.ayrshare.com/api/analytics/post',
               data: args
            })
            const data = await response.data
            return data
         } catch (error) {
            return error
         }
      },

      analyticsSocialNetwork: async (_, args, { ayrshare_api_key }) => {
         try {
            const response = await axios({
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${ayrshare_api_key}`
               },
               url: 'https://app.ayrshare.com/api/analytics/social',
               data: args
            })
            const data = await response.data
            return data
         } catch (error) {
            return error
         }
      },

      postComment: async (_, args, { ayrshare_api_key }) => {
         try {
            const response = await axios({
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${ayrshare_api_key}`
               },
               url: 'https://app.ayrshare.com/api/comments',
               data: args
            })
            const data = await response.data
            return data
         } catch (error) {
            return error
         }
      },

      deletePost: async (_, args, { ayrshare_api_key }) => {
         try {
            const response = await axios({
               method: 'DELETE',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${ayrshare_api_key}`
               },
               url: 'https://app.ayrshare.com/api/post',
               data: args
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
