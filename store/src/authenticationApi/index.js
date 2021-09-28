import axios from 'axios'
import jwt_decode from 'jwt-decode'
import { isClient, isEmpty } from '../utils'

const AUTH_SERVER_URL =
   isClient &&
   `${
      (process.browser && window?._env_?.NEXT_PUBLIC_KEYCLOAK_URL) ||
      process.env.NEXT_PUBLIC_KEYCLOAK_URL
   }/realms/consumers/protocol/openid-connect/token`

export const auth = {
   login: async ({ email, password }) => {
      try {
         const params = {
            scope: 'openid',
            grant_type: 'password',
            username: email.trim(),
            password: password.trim(),
            client_id:
               isClient &&
               ((process.browser && window?._env_?.NEXT_PUBLIC_CLIENTID) ||
                  process.env.NEXT_PUBLIC_CLIENTID)
         }
         const searchParams = Object.keys(params)
            .map(key => {
               return (
                  encodeURIComponent(key) +
                  '=' +
                  encodeURIComponent(params[key])
               )
            })
            .join('&')

         const response = await axios({
            url: AUTH_SERVER_URL,
            method: 'POST',
            headers: {
               'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: searchParams
         })
         if (response.status === 200) {
            isClient &&
               localStorage.setItem('token', response.data.access_token)
            const token = jwt_decode(response.data.access_token)
            return token
         }
         return {}
      } catch (error) {
         console.error('auth -> login:', error)
         if (error?.message.includes('401')) {
            throw { code: 401, message: 'Email or password is incorrect!' }
         }
      }
   },
   register: async ({ name, email, password }) => {
      try {
         const response = await axios({
            method: 'POST',
            url:
               isClient &&
               ((process.browser && window?._env_?.DATA_HUB_HTTPS) ||
                  process.env.DATA_HUB_HTTPS),
            headers: {
               'x-hasura-admin-secret':
                  isClient &&
                  ((process.browser && window?._env_?.ADMIN_SECRET) ||
                     process.env.ADMIN_SECRET)
            },
            data: {
               query: REGISTER,
               variables: {
                  name: name.trim(),
                  email: email.trim(),
                  password: password.trim()
               }
            }
         })
         console.log('register-api', response)
         if (response.status === 200 && response.statusText === 'OK') {
            const { data } = response
            if (data?.data?.registerCustomer?.success) {
               return data?.data?.registerCustomer
            } else {
               const { errors = [] } = data
               if (!isEmpty(errors)) {
                  throw errors[0]?.message
               }
            }
         }
         return {}
      } catch (error) {
         console.error('auth -> register:', error)
         throw error
      }
   }
}

const REGISTER = `
 mutation registerCustomer($name:String!,$email: String!, $password: String!){
    registerCustomer(username: $name, email: $email, password: $password) {
    success
    message
    }
 }
`
