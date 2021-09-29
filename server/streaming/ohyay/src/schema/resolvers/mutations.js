const jwt = require('jsonwebtoken')
const axios = require('axios')

const resolvers = {
   Mutation: {
      ohyay_createInvites: async (_, args, { ohyay_api_key }) => {
         try {
            const token = jwt.sign(args, ohyay_api_key)
            let url
            if (args.userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/create-invites'
            }
            const { data: workspace } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })

            return {
               inviteUrl: workspace.links
            }
         } catch (error) {
            return error
         }
      },
      ohyay_cloneWorkspace: async (_, args, { ohyay_api_key }) => {
         try {
            const { cloneWorkspace = {} } = args

            const token = jwt.sign(cloneWorkspace, ohyay_api_key)
            let url
            if (Object.keys(cloneWorkspace).length) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/clone-workspace'
            }
            const { data: workspaces } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })

            return workspaces
         } catch (error) {
            return error
         }
      },
      ohyay_deleteWorkspace: async (_, args, { ohyay_api_key }) => {
         try {
            const { userId = '', wsid = '' } = args

            const token = jwt.sign({ userId, wsid }, ohyay_api_key)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/delete-workspace'
            }
            const { data } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })

            return data
         } catch (error) {
            return error
         }
      },
      ohyay_createPrettyUrl: async (_, args, { ohyay_api_key }) => {
         try {
            const { userId = '', wsid = '', urlPath = '' } = args

            const token = jwt.sign({ userId, wsid, urlPath }, ohyay_api_key)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/set-vanity-url'
            }
            const { data } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })

            return {
               prettyUrl: 'https://ohyay.co/s/' + urlPath
            }
         } catch (error) {
            return error
         }
      },
      ohyay_clearPrettyUrl: async (_, args, { ohyay_api_key }) => {
         try {
            const { userId = '', wsid = '' } = args

            const token = jwt.sign({ userId, wsid }, ohyay_api_key)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/clear-vanity-url'
            }
            const { data, status } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })
            if (status === 200) {
               return {
                  success: true
               }
            } else {
               return {
                  success: false
               }
            }
         } catch (error) {
            return error
         }
      },
      ohyay_updateUsers: async (_, args, { ohyay_api_key }) => {
         try {
            const { updateUsersInput = {} } = args

            const token = jwt.sign(
               {
                  userId: updateUsersInput.userId,
                  wsid: updateUsersInput.wsid,
                  editorsToRemove: updateUsersInput.editorsToRemove,
                  editorsToAdd: updateUsersInput.editorsToAdd,
                  tagUpdates: updateUsersInput.tagUpdates
               },
               ohyay_api_key
            )
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/update-users'
            }
            const { data, status } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })
            if (status === 200) {
               return {
                  success: true
               }
            } else {
               return {
                  success: false
               }
            }
         } catch (error) {
            return error
         }
      },
      ohyay_updateWorkspaceInfo: async (_, args, { ohyay_api_key }) => {
         try {
            const {
               userId = '',
               wsid = '',
               tagsToAdd = [],
               tagsToRemove = []
            } = args

            const token = jwt.sign(
               {
                  userId,
                  wsid,
                  tagsToAdd,
                  tagsToRemove
               },
               ohyay_api_key
            )
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/update-workspace-info'
            }
            const { data, status } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })
            if (status === 200) {
               return {
                  success: true
               }
            } else {
               return {
                  success: false
               }
            }
         } catch (error) {
            return error
         }
      }
   }
}

module.exports = resolvers
