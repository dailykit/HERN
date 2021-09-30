const axios = require('axios')
const {
   default: AddArgumentsAsVariablesTransform
} = require('graphql-tools/dist/transforms/AddArgumentsAsVariables')

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

      // Premium or Business Plan required on analyticsPost.

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

      // Premium or Business Plan required on analyticsSocialNetwork.

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

      // Premium or Business Plan required on postComment.

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

      // Instagram doesn't support this feature

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
