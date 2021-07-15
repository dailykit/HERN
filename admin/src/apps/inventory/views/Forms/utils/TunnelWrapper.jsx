import { Flex } from '@dailykit/ui'
import React from 'react'

export const TunnelWrapper = ({ children }) => (
   <Flex padding="0 16px" style={{ overflowY: 'auto' }} height="100%">
      {children}
   </Flex>
)
