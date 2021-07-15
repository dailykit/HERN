import { Flex, IconButton, Spacer, Text } from '@dailykit/ui'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { EditIcon } from '../../../../shared/assets/icons'

const address = 'apps.inventory.components.workorder.'

export default function ItemCard({
   title,
   onHand,
   shelfLife,
   edit,
   available,
   par,
   isBulk,
}) {
   const { t } = useTranslation()
   return (
      <StyledCard>
         <Flex>
            <Text as="h2">{title}</Text>

            {isBulk ? (
               <Flex container>
                  <Text as="subtitle">
                     {t(address.concat('on hand'))}: {onHand.trim() || 'N/A'}
                  </Text>
                  <Spacer xAxis size="16px" />
                  <Text as="subtitle">
                     {t(address.concat('shelf life'))}:{' '}
                     {shelfLife?.trim() || 'N/A'}
                  </Text>

                  {available ? (
                     <Text as="subtitle">
                        {t(address.concat('available'))}: {available}{' '}
                     </Text>
                  ) : null}
                  {par ? (
                     <>
                        <Spacer xAxis size="16px" />
                        <Text as="subtitle">
                           {t(address.concat('par'))}: {par.trim() || 'N/A'}
                        </Text>{' '}
                     </>
                  ) : null}
               </Flex>
            ) : null}
         </Flex>
         <Spacer xAxis size="68px" />

         {edit && (
            <Flex>
               <IconButton type="outline" onClick={() => edit()}>
                  <EditIcon />
               </IconButton>
            </Flex>
         )}
      </StyledCard>
   )
}

const StyledCard = styled.div`
   display: flex;
   align-items: center;
   margin: 16px 0px 40px 16px;
   background-color: #f3f3f3;
   padding: 20px;
   border-radius: 4px;
   width: fit-content;
`
