import { get_env } from '../../../shared/utils'

const fetchCall = async body => {
   const response = await fetch(get_env('REACT_APP_DATA_HUB_URI'), {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'x-hasura-admin-secret': get_env(
            'REACT_APP_HASURA_GRAPHQL_ADMIN_SECRET'
         ),
      },
      body: body,
   })
   const data = await response.json()
   return await data
}

export default fetchCall
