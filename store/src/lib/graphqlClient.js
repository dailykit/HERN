import fs from 'fs'
import { GraphQLClient } from 'graphql-request'
import { get_env, isClient } from '../utils'

export const graphQLClient = async () => {
   try {
      const content = await fs.readFileSync(
         process.cwd() + '/public/env-config.js',
         'utf-8'
      )
      const config = JSON.parse(content.replace('window._env_ = ', ''))

      return new GraphQLClient(config['DATA_HUB_HTTPS'], {
         headers: {
            'x-hasura-admin-secret': config['ADMIN_SECRET'],
         },
      })
   } catch (error) {
      console.error('error', error)
   }
}

export const graphQLClientSide = new GraphQLClient(
   isClient ? get_env('DATA_HUB_HTTPS') : '',
   {
      headers: {
         'x-hasura-admin-secret': isClient ? get_env('ADMIN_SECRET') : '',
      },
   }
)
