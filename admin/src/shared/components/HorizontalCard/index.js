import React from 'react'
import { Text, TextButton, Card, Flex } from '@dailykit/ui'
import { StyledCard, StyledInfo } from './styled'
import { Tooltip } from '../Tooltip'

const HorizontalStyledCard = ({
   data,
   open,
   altMessage,
   identifier,
   type,
   subheading,
}) => {
   return (
      <StyledCard>
         <Flex container justifyContent="space-between">
            <Flex container alignItems="flex-start">
               <Card.Title>Basic Information</Card.Title>
               <Tooltip identifier={identifier} />
            </Flex>
            <TextButton type="outline" size="sm" onClick={() => open(1)}>
               Edit
            </TextButton>
         </Flex>
         <Flex container>
            <Card.Img src={data.image} alt={altMessage} />
            <StyledInfo>
               <Card>
                  <Card.Body>
                     <Card.Text>
                        {type && subheading && (
                           <Card.Stat>
                              <Text as="title">{subheading || ''}:</Text>
                              <Text as="subtitle">{type || ''}</Text>
                           </Card.Stat>
                        )}
                        <Card.Stat>
                           <Text as="title">Title :</Text>
                           <Text as="subtitle">{data.title}</Text>
                        </Card.Stat>
                        <Card.Stat>
                           <Text as="title">Description :</Text>
                           <Text as="subtitle">{data.description}</Text>
                        </Card.Stat>
                     </Card.Text>
                  </Card.Body>
               </Card>
            </StyledInfo>
         </Flex>
      </StyledCard>
   )
}

export default HorizontalStyledCard
