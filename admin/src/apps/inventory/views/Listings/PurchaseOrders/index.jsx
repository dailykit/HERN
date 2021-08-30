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
import { ResponsiveFlex } from '../styled'
import PackagingPurchaseOrders from './packaging'
import SelectPurchaseOrderTypeTunnel from './SelectPurchaseOrderTypeTunnel'
import ItemPurchaseOrders from './supplierItem'
import { useSubscription } from '@apollo/react-hooks'
import { PURCHASE_ORDERS_SUBSCRIPTION } from '../../../graphql' 
import { ErrorState, InlineLoader } from '../../../../../shared/components'
import { logger } from '@sentry/utils'
import { toast } from 'react-toastify'


const address = 'apps.inventory.views.listings.purchaseorders.'

export default function PurchaseOrders() {
   const { t } = useTranslation()
   const [view, setView] = useState('Supplier Items')

   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

   const {loading: supplierLoading,
      data: { purchaseOrderItems : supplierItem = [] } = {},
      error: supplierError,
   } = useSubscription(PURCHASE_ORDERS_SUBSCRIPTION, {
      variables: { type: 'SUPPLIER_ITEM' },
   })

   const {
      loading: packagingLoading,
      data: { purchaseOrderItems : packaging = [] } = {},
      error: packagingError,
   } = useSubscription(PURCHASE_ORDERS_SUBSCRIPTION, {
      variables: { type: 'PACKAGING' },
   })
   if( supplierError || packagingError ){
      if(supplierError){
      toast.error( 'Failed to fetch supplier count')
      logger(supplierError)
      return <ErrorState message='Could not get Supplier Items data' />}
      else{
      toast.error( 'Failed to fetch supplier count')
      logger(supplierError)
      return <ErrorState message='Could not get Packagings data' />} 
   }

   if (packagingLoading || supplierLoading) return <InlineLoader />
   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="sm">
               <SelectPurchaseOrderTypeTunnel close={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <ResponsiveFlex margin="0 auto" maxWidth="1280px">
            <Banner id="inventory-app-purchase-orders-listing-top" />
            <Flex container alignItems="center" justifyContent="space-between">
               <Flex container alignItems="center">
               {view === 'Supplier Items' ? (
               <Text as="h2">{t(address.concat('purchase orders'))}({supplierItem.length})</Text>
            ) : (
               <Text as="h2">{t(address.concat('purchase orders'))}({packaging.length})</Text>
            )}
                  <Tooltip identifier="purchase-orders_listings_header_title" />
               </Flex>
               <Flex
                  container
                  alignItems="center"
                  justifyContent="space-between"
                  padding="16px 0"
               >
                  <ComboButton type="solid" onClick={() => openTunnel(1)}>
                     <AddIcon color="#fff" size={24} />
                     Create Purchase Order
                  </ComboButton>
               </Flex>
            </Flex>
            <Spacer size="16px" />

            <RadioGroup
               options={[
                  { id: 1, title: 'Supplier Items' },
                  { id: 2, title: 'Packagings' },
               ]}
               active={1}
               onChange={option => setView(option.title)}
            />

            <Spacer size="16px" />

            {view === 'Supplier Items' ? (
               <ItemPurchaseOrders />
            ) : (
               <PackagingPurchaseOrders />
            )}
            <Banner id="inventory-app-purchase-orders-listing-bottom" />
         </ResponsiveFlex>
      </>
   )
}
