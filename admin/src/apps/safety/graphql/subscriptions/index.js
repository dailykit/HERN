import gql from 'graphql-tag'

export const SAFETY_CHECKS_COUNT = gql`
   subscription SafetyChecksCount {
      safety_safetyCheck_aggregate {
         aggregate {
            count
         }
      }
   }
`

export const SAFETY_CHECKS = gql`
   subscription {
      safety_safetyCheck {
         id
         created_at
         SafetyCheckPerUsers {
            id
         }
      }
   }
`

export const USERS = gql`
   subscription {
      settings_user {
         id
         firstName
         lastName
      }
   }
`

export const SAFETY_CHECK = gql`
   subscription SafetyCheck($id: Int!) {
      safety_safetyCheck(where: { id: { _eq: $id } }) {
         id
         created_at
         SafetyCheckPerUsers {
            id
            temperature
            usesMask
            usesSanitizer
            user {
               firstName
               lastName
            }
         }
      }
   }
`
