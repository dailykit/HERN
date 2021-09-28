import fs from 'fs'
import { ApolloClient, InMemoryCache } from '@apollo/client'

export const graphqlClient = async () => {
   try {
      const content = await fs.readFileSync(
         process.cwd() + '/public/env-config.js',
         'utf-8'
      )
      const config = JSON.parse(content.replace('window._env_ = ', ''))

      return new ApolloClient({
         uri: config['DATA_HUB_HTTPS'],
         cache: new InMemoryCache(),
         headers: {
            'x-hasura-admin-secret': config['ADMIN_SECRET']
         }
      })
   } catch (error) {
      console.error('error', error)
   }
}
