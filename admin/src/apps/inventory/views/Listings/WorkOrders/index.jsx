import {
   ComboButton,
   Flex,
   RadioGroup,
   Spacer,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Banner } from '../../../../../shared/components'
import { Tooltip } from '../../../../../shared/components/Tooltip'
import { AddIcon } from '../../../assets/icons'
import { StyledWrapper } from '../styled'
import BulkWorkOrders from './bulk'
import SachetWorkOrders from './sachet'
import WorkOrderTypeTunnel from './WorkOrderTypeTunnel'

const address = 'apps.inventory.views.listings.workorders.'

export default function WorkOrders() {
   const { t } = useTranslation()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

   const [view, setView] = useState('Bulk')

   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="sm">
               <WorkOrderTypeTunnel close={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <StyledWrapper>
            <Banner id="inventory-app-work-orders-listing-top" />

            <Flex
               container
               alignItems="center"
               justifyContent="space-between"
               padding="16px 0"
            >
               <Flex container alignItems="center">
                  <Text as="h2">{t(address.concat('work orders'))}</Text>
                  <Tooltip identifier="work-orders_listings_header_title" />
               </Flex>
               <Flex container>
                  <ComboButton
                     type="solid"
                     onClick={() => {
                        openTunnel(1)
                     }}
                  >
                     <AddIcon color="#fff" size={24} />
                     Create Work Order
                  </ComboButton>
               </Flex>
            </Flex>

            <RadioGroup
               options={[
                  { id: 1, title: 'Bulk' },
                  { id: 2, title: 'Sachet' },
               ]}
               active={1}
               onChange={option => setView(option.title)}
            />
            <Spacer size="16px" />

            {view === 'Bulk' ? <BulkWorkOrders /> : <SachetWorkOrders />}
            <Banner id="inventory-app-work-orders-listing-bottom" />
         </StyledWrapper>
      </>
   )
}
