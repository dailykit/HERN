import gql from 'graphql-tag'

export const USERS = gql`
   subscription users($where: settings_user_bool_exp) {
      users: settings_user(where: $where) {
         id
         email
         firstName
         lastName
         phoneNo
         roles {
            id
            role {
               id
               title
            }
         }
      }
   }
`
