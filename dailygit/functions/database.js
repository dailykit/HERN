const { GraphQLClient, gql } = require('graphql-request')
const nodePath = require('path')

const graphQLClient = new GraphQLClient(process.env.DATA_HUB, {
   headers: {
      'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET
   }
})

const query = gql`
   query getFileId($path: String!) {
      editor_file(where: { path: { _eq: $path } }) {
         id
      }
   }
`

const createFileRecordMutation = gql`
   mutation INSERT_FILE($object: editor_file_insert_input!) {
      insert_editor_file_one(object: $object) {
         id
      }
   }
`
const createFileMutation = gql`
   mutation createFile($path: String, $content: String) {
      createFile(path: $path, content: $content) {
         ... on Error {
            success
            error
         }
         ... on Success {
            success
            message
         }
      }
   }
`
const updateMutation = gql`
   mutation UPDATE_FILE($path: String!, $set: editor_file_set_input!) {
      update_editor_file(where: { path: { _eq: $path } }, _set: $set) {
         returning {
            id
            path
         }
      }
   }
`
const deleteMutation = gql`
   mutation DELETE_RECORD($path: String!) {
      delete_editor_file(where: { path: { _eq: $path } }) {
         returning {
            id
            path
         }
      }
   }
`
const renameMutation = gql`
   mutation RENAME_FILE($path: String!, $set: editor_file_set_input!) {
      update_editor_file(where: { path: { _eq: $path } }, _set: $set) {
         returning {
            id
            path
         }
      }
   }
`
const linkCssMutation = gql`
   mutation linkCssMutation(
      $cssFileId: Int!
      $guiFileId: Int!
      $position: bigint!
   ) {
      insert_editor_cssFileLinks_one(
         object: {
            cssFileId: $cssFileId
            guiFileId: $guiFileId
            position: $position
         }
      ) {
         id
      }
   }
`
const linkJsMutation = gql`
   mutation linkJsMutation($jsFileId: Int!, $guiFileId: Int!, $position: Int!) {
      insert_editor_jsFileLinks_one(
         object: {
            jsFileId: $jsFileId
            guiFileId: $guiFileId
            position: $position
         }
      ) {
         id
      }
   }
`

const createFileRecord = async path => {
   try {
      console.log({ pathfromCreateFileRecord: path })
      const variables = {
         object: {
            fileType: nodePath.basename(path).split('.').pop(),
            fileName: nodePath.basename(path),
            path,
            lastSaved: new Date().toISOString()
         }
      }

      const data = await graphQLClient.request(
         createFileRecordMutation,
         variables
      )
      return data.insert_editor_file_one.id
   } catch (err) {
      console.error(err)
   }
}

const createFile = async (path, content) => {
   try {
      const variables = {
         path,
         content
      }

      const data = await graphQLClient.request(createFileMutation, variables)
      console.log(data)
   } catch (err) {
      console.error(err)
   }
}

const updateRecordedFile = async ({ path, lastSaved }) => {
   const variables = {
      path,
      set: {
         lastSaved
      }
   }

   const data = await graphQLClient.request(updateMutation, variables)
   return console.log(JSON.stringify(data, undefined, 2))
}

const renameRecordedFile = async ({
   oldFilePath,
   fileName,
   newFilePath,
   lastSaved
}) => {
   const variables = {
      path: oldFilePath,
      set: {
         fileName: fileName,
         path: newFilePath,
         lastSaved
      }
   }

   const data = await graphQLClient.request(renameMutation, variables)
   return console.log(JSON.stringify(data, undefined, 2))
}

const deleteRecordedFile = async ({ path }) => {
   const variables = {
      path
   }

   const data = await graphQLClient.request(deleteMutation, variables)
   return console.log(JSON.stringify(data, undefined, 2))
}

const createCsslinkRecord = async ({ cssFileId, guiFileId, position }) => {
   const variables = {
      cssFileId,
      guiFileId,
      position
   }

   const data = await graphQLClient.request(linkCssMutation, variables)
   return console.log(JSON.stringify(data, undefined, 2))
}
const createJslinkRecord = async ({ jsFileId, guiFileId, position }) => {
   const variables = {
      jsFileId,
      guiFileId,
      position
   }

   const data = await graphQLClient.request(linkJsMutation, variables)
   return console.log(JSON.stringify(data, undefined, 2))
}

const getFileId = async path => {
   const variables = {
      path
   }
   const data = await graphQLClient.request(query, variables)
   console.log({ dataFromFileId: data })
   if (
      // if fileId exist then return the file id
      Object.keys(data).length &&
      data.editor_file.length &&
      data.editor_file[0].id
   ) {
      return data.editor_file[0].id
   } else {
      // if fileId not exist save the file in datahub and then return the fileId
      const id = await createFileRecord(path)
      return id
   }
}

module.exports = {
   getFileId,
   createFileRecord,
   updateRecordedFile,
   deleteRecordedFile,
   renameRecordedFile,
   createCsslinkRecord,
   createJslinkRecord,
   createFile
}
