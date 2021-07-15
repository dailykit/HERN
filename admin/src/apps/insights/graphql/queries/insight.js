import gql from 'graphql-tag'

export const INSIGHTS = gql`
   query insights {
      insights_insights(where: { isActive: { _eq: true } }) {
         identifier
      }
   }
`
