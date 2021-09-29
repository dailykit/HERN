import { ButtonGroup, Flex, Text, TextButton } from '@dailykit/ui'
import React from 'react'
import styled, { css } from 'styled-components'

export const TableHeader = ({ children, heading, onClick }) => {
   return (
      <>
         <TableContainer>
            <Flex container justifyContent="space-between">
               <Text as="h2">{heading}</Text>
               {onClick && (
                  <ButtonGroup align="left">
                     <TextButton type="ghost" size="sm" onClick={onClick}>
                        VIEW ALL
                     </TextButton>
                  </ButtonGroup>
               )}
            </Flex>
            {children}
         </TableContainer>
      </>
   )
}

const TableContainer = styled.div(
   () => css`
      display: flex;
      flex-direction: column;
      width: 100%;
      border: 1px solid #efefef;
      padding: 9px;
      border-radius: 15px;
   `
)
