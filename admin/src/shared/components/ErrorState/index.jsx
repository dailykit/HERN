import { Flex, Text } from '@dailykit/ui'
import React from 'react'

import { ReactComponent as Illustration } from './illustration.svg'

export const ErrorState = ({
   message = 'Error occured, please try refreshing the page.',
   height = '100%',
   width = '100%',
   illustration,
}) => {
   return (
      <Flex
         container
         flexDirection="column"
         justifyContent="center"
         alignItems="center"
         width={width}
         height={height}
      >
         {illustration || <Illustration height="200px" />}
         <Text as="h3">{message}</Text>
      </Flex>
   )
}
