import gql from 'graphql-tag'

export const INSIGHT = gql`
   query INSIGHT($options: insights_insights_bool_exp!) {
      insights_insights(where: $options) {
         identifier
      }
   }
`
