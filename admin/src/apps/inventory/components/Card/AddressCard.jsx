import { Flex, Text } from '@dailykit/ui'
import React from 'react'
import styled from 'styled-components'

export default function AddressCard({ city, zip, address, image }) {
   return (
      <StyledCard>
         <Flex container alignItems="center">
            {image && <StyledImage src={image} alt="person" />}
            {address && <Text as="p">{address}.</Text>}
            {city && zip && <Text as="p">{`${city}, ${zip}`}</Text>}
         </Flex>
      </StyledCard>
   )
}

const StyledCard = styled.div`
   margin: 0 auto;
   margin-top: 20px;
`
const StyledImage = styled.img`
   width: 80px;
   height: 50px;
   margin-right: 10px;
`
