import axios from 'axios'
import jwt_decode from 'jwt-decode'
import { isEmpty } from 'lodash'

import { isClient } from '../utils'

const AUTH_SERVER_URL =
   isClient &&
   `${window._env_.KEYCLOAK_URL}/realms/consumers/protocol/openid-connect/token`

export const auth = {
   login: async ({ email, password }) => {
      try {
         const params = {
            scope: 'openid',
            grant_type: 'password',
            username: email.trim(),
            password: password.trim(),
            client_id: isClient && window._env_.CLIENTID,
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
               'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: searchParams,
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
   register: async ({ email, password }) => {
      try {
         const response = await axios({
            method: 'POST',
            url: isClient && window._env_.DATA_HUB_HTTPS,
            headers: {
               'x-hasura-admin-secret': isClient && window._env_.ADMIN_SECRET,
            },
            data: {
               query: REGISTER,
               variables: {
                  email: email.trim(),
                  password: password.trim(),
               },
            },
         })
         if (response.status === 200 && response.statusText === 'OK') {
            const { data } = response
            if (data?.data?.register?.success) {
               return data?.data?.register
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
   },
}

const REGISTER = `
   mutation register($email: String!, $password: String!) {
      register: registerCustomer(email: $email, password: $password) {
         message
         success
      }
   }
`
