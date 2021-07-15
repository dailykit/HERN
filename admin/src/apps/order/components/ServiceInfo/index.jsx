import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { Card, TextButton } from '@dailykit/ui'

import { Wrapper } from './styled'
import { QUERIES } from '../../graphql'

export const ServiceInfo = ({ id }) => {
   const { loading, error, data: { service = {} } = {} } = useQuery(
      QUERIES.DELIVERY.SERVICE,
      { variables: { id } }
   )

   if (loading)
      return (
         <Wrapper>
            <span>Loading...</span>
         </Wrapper>
      )
   if (error)
      return (
         <Wrapper>
            <span>{error.message}</span>
         </Wrapper>
      )

   return (
      <Wrapper>
         <Card>
            <Card.Title>{service.details.name}</Card.Title>
            <Card.Img
               src={service.details.assets.logo}
               alt={service.details.name}
            />
            <Card.Body>
               <Card.Text>{service.details.description.short}</Card.Text>
               <Card.Text>
                  <Card.Stat>
                     <span>Established:</span>
                     <span>{service.details.established}</span>
                  </Card.Stat>
               </Card.Text>
            </Card.Body>
            <Card.Footer>
               <TextButton
                  type="outline"
                  onClick={() => window.open(service.details.website, '_blank')}
               >
                  View Website
               </TextButton>
            </Card.Footer>
         </Card>
      </Wrapper>
   )
}
