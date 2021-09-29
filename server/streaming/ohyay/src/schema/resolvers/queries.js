const jwt = require('jsonwebtoken')
const axios = require('axios')

const resolvers = {
   Query: {
      ohyay_workspaces: async (_, args, { ohyay_api_key }) => {
         try {
            const { userId = '' } = args

            const token = jwt.sign({ userId }, ohyay_api_key)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/list-workspaces'
            }
            const { data: workspaces } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })

            return workspaces.spaces
         } catch (error) {
            return error
         }
      },
      ohyay_workspaceInfo: async (_, args, { ohyay_api_key }) => {
         try {
            const { userId = '', wsid = '' } = args

            const token = jwt.sign({ userId, wsid }, ohyay_api_key)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/get-workspace-info'
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
               prettyUrl: workspace.vanityUrl,
               tags: workspace.tags
            }
         } catch (error) {
            return error
         }
      },
      ohyay_workspaceChats: async (_, args, { ohyay_api_key }) => {
         try {
            const { userId = '', wsid = '' } = args

            const token = jwt.sign({ userId, wsid }, ohyay_api_key)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/download-chats'
            }
            const { data: workspace } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })

            return workspace
         } catch (error) {
            return error
         }
      },
      ohyay_getWorkspaceMovement: async (_, args, { ohyay_api_key }) => {
         try {
            const { userId = '', wsid = '', startTime = 0, endTime = 0 } = args

            const token = jwt.sign(
               { userId, wsid, startTime, endTime },
               ohyay_api_key
            )
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/get-movement'
            }
            const { data: workspace } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })

            return workspace.movement
         } catch (error) {
            return error
         }
      },
      ohyay_workspaceUsers: async (_, args, { ohyay_api_key }) => {
         try {
            const { userId = '', wsid = '' } = args

            const token = jwt.sign({ userId, wsid }, ohyay_api_key)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/list-users'
            }
            const { data: workspaces } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })

            return workspaces.users
         } catch (error) {
            return error
         }
      },
      ohyay_workspaceActiveUsers: async (_, args, { ohyay_api_key }) => {
         try {
            const { userId = '', wsid = '' } = args

            const token = jwt.sign({ userId, wsid }, ohyay_api_key)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/get-active-users'
            }
            const { data: workspaces } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })
            return workspaces.users
         } catch (error) {
            return error
         }
      },
      ohyay_workspaceRecordings: async (_, args, { ohyay_api_key }) => {
         try {
            const { userId = '', wsid = '' } = args

            const token = jwt.sign({ userId, wsid }, ohyay_api_key)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/list-recordings'
            }
            const { data: workspaces } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })
            return workspaces.recordings
         } catch (error) {
            return error
         }
      },
      ohyay_workspaceRecordingMetaData: async (_, args, { ohyay_api_key }) => {
         try {
            const { userId = '', wsid = '', recordingId = '' } = args

            const token = jwt.sign({ userId, wsid, recordingId }, ohyay_api_key)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/recording-metadata'
            }
            const { data: recordingMetaData } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })
            return recordingMetaData
         } catch (error) {
            return error
         }
      }
   }
}

module.exports = resolvers
