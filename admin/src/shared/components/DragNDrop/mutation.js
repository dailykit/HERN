import gql from 'graphql-tag'

export const PRIORITY_UPDATE = gql`
   query PRIORITY_UPDATE($arg: jsonb!) {
      editor_HandlePriority4(args: { arg: $arg }) {
         id
      }
   }
`
