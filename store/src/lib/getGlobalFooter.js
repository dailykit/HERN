import axios from 'axios'
import { graphqlClient } from './graphqlClient'
import { GET_GLOBAL_FOOTER, GET_FILE_PATH } from '../graphql'
import fs from 'fs'

export const getGlobalFooter = async () => {
   try {
      const client = await graphqlClient()
      const variables = {
         where: {
            onDemandSetting: {
               identifier: {
                  _eq: 'globalFooter'
               }
            },
            _or: [
               {
                  brandId: {
                     _eq: 1069 // hardcoded for now we will get this from the database
                  }
               },
               {
                  brand: {
                     isDefault: {
                        _eq: true
                     }
                  }
               }
            ]
         }
      }
      const { data: { brands_brand_storeSetting: settings = [] } = {} } =
         await client.query({ query: GET_GLOBAL_FOOTER, variables })

      if (settings.length > 0) {
         const [setting] = settings
         const { data: { editor_file_by_pk: file = {} } = {} } =
            await client.query({
               query: GET_FILE_PATH,
               variables: { id: setting.value.fileId }
            })
         const content = await fs.readFileSync(
            process.cwd() + '/public/env-config.js',
            'utf-8'
         )
         const config = JSON.parse(content.replace('window._env_ = ', ''))
         const DATA_HUB_HTTPS = config['DATA_HUB_HTTPS']
         const { origin } = new URL(DATA_HUB_HTTPS)
         const url = `${origin}/template/files${file.path}`
         const { data: html } = await axios.get(url)
         return html
      }
      return null
   } catch (error) {
      console.log(error)
   }
}
