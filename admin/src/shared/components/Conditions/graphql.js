import gql from 'graphql-tag'

// Queries

export const FACTS = gql`
   query Facts {
      facts {
         id
         query
      }
   }
`

export const CONDITION = gql`
   query Condition($id: Int!) {
      condition(id: $id) {
         id
         condition
      }
   }
`

// Mutations

export const CREATE_CONDITION = gql`
   mutation CreateCondition($object: rules_conditions_insert_input!) {
      createCondition(object: $object) {
         id
      }
   }
`

export const UPDATE_CONDITION = gql`
   mutation UpdateCondition($id: Int!, $set: rules_conditions_set_input) {
      updateCondition(pk_columns: { id: $id }, _set: $set) {
         id
      }
   }
`
