import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   ButtonTile,
   Flex,
   Form,
   Loader,
   Spacer,
   Text,
   TextButton,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui/'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Banner, ErrorState, Tooltip } from '../../../../../shared/components'
import { logger } from '../../../../../shared/utils/errorLog'
import { ItemCard, Separator, StatusSwitch } from '../../../components'
import { GENERAL_ERROR_MESSAGE } from '../../../constants/errorMessages'
import {
   PACKAGING_PURCHASE_ORDER_SUBSCRIPTION,
   UPDATE_PURCHASE_ORDER,
   UPDATE_PURCHASE_ORDER_ITEM,
} from '../../../graphql'
import { validators } from '../../../utils/validators'
import { StyledWrapper } from '../styled'
import PackagingTunnel from './PackagingTunnel'

const address = 'apps.inventory.views.forms.purchaseorders.'

function onError(error) {
   toast.error(GENERAL_ERROR_MESSAGE)
   logger(error)
}

export default function PackagingPurchaseOrderForm() {
   const { t } = useTranslation()
   const [orderQuantity, setOrderQuantity] = useState({
      value: '',
      meta: { isTouched: false, isValid: false, errors: [] },
   })
   const { id } = useParams()

   const {
      data: { purchaseOrderItem: item = {} } = {},
      loading: orderLoading,
      error,
   } = useSubscription(PACKAGING_PURCHASE_ORDER_SUBSCRIPTION, {
      variables: { id },
      onSubscriptionData: data => {
         const { orderQuantity } = data.subscriptionData.data.purchaseOrderItem
         const { isValid, errors } = validators.quantity(orderQuantity)
         setOrderQuantity({
            value: orderQuantity,
            meta: { isValid, errors, ...orderQuantity.meta },
         })
      },
   })

   const [updatePurchaseOrderItem] = useMutation(UPDATE_PURCHASE_ORDER, {
      onError,
      onCompleted: () => toast.success('Status updated.'),
   })

   const checkIsValid = () => {
      if (!item.packaging?.packagingName) return 'Please select a packaging.'
      if (!orderQuantity.meta.isValid) return 'invalid order quantity.'

      return true
   }

   const saveStatus = async status => {
      const isValid = checkIsValid()

      if (!isValid.length)
         updatePurchaseOrderItem({
            variables: {
               id: item.id,
               status,
            },
         })
      else toast.error(isValid)
   }

   const handlePublish = () => {
      const isValid = checkIsValid()
      if (!isValid.length) saveStatus('PENDING')
      else toast.error(isValid)
   }

   if (error) {
      onError(error)
      return <ErrorState />
   }

   if (orderLoading) return <Loader />

   return (
      <>
         <StyledWrapper>
            <Banner id="inventory-app-purchase-orders-packaging-top" />
            <Flex
               container
               alignItems="center"
               justifyContent="space-between"
               padding="16px 0"
            >
               <Text as="h1">{t(address.concat('purchase order'))}</Text>

               {item.status !== 'UNPUBLISHED' ? (
                  <StatusSwitch
                     currentStatus={item.status}
                     onSave={saveStatus}
                  />
               ) : (
                  <TextButton onClick={handlePublish} type="solid">
                     Publish
                  </TextButton>
               )}
            </Flex>

            <Content
               item={item}
               orderQuantity={orderQuantity}
               setOrderQuantity={setOrderQuantity}
            />
            <Banner id="inventory-app-purchase-orders-packaging-bottom" />
         </StyledWrapper>
      </>
   )
}

function Content({ item, orderQuantity, setOrderQuantity }) {
   const { t } = useTranslation()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(4)

   const [updatePurchaseOrderItem] = useMutation(UPDATE_PURCHASE_ORDER_ITEM, {
      onError,
      onCompleted: () => {
         toast.success('quantity updated.')
      },
   })

   const updateOrderQuantity = value => {
      updatePurchaseOrderItem({
         variables: { id: item.id, set: { orderQuantity: +value } },
      })
   }

   const editable = ['PENDING', 'UNPUBLISHED'].includes(item.status)

   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <PackagingTunnel close={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <Text as="title">Select Packaging</Text>

         {item && item.packaging ? (
            <>
               <ItemCard
                  title={item.packaging.packagingName}
                  onHand={item.packaging.onHand}
               />

               <Separator />
               <Flex container alignItems="flex-end" margin="0px 0px 0px 16px">
                  <Form.Group>
                     <Form.Label htmlFor="quantity" title="quantity">
                        <Flex container alignItems="center">
                           {t(address.concat('enter order quantity'))}
                           <Tooltip identifier="purchase_order_form_order_quantity" />
                        </Flex>
                     </Form.Label>
                     <Form.Number
                        id="quantity"
                        name="quantity"
                        hasWriteAccess={editable}
                        placeholder={t(address.concat('enter order quantity'))}
                        value={orderQuantity.value}
                        onChange={e =>
                           setOrderQuantity({
                              value: e.target.value,
                              meta: { ...orderQuantity.meta },
                           })
                        }
                        onBlur={e => {
                           const { isValid, errors } = validators.quantity(
                              e.target.value
                           )
                           setOrderQuantity({
                              value: e.target.value,
                              meta: { isValid, errors, isTouched: true },
                           })

                           if (isValid) {
                              updateOrderQuantity(e.target.value)
                           }
                        }}
                     />
                     {orderQuantity.meta.isTouched &&
                        !orderQuantity.meta.isValid && (
                           <Form.Error>
                              {orderQuantity.meta.errors[0]}
                           </Form.Error>
                        )}
                  </Form.Group>
                  <Spacer xAxis size="8px" />
                  <Text as="title">in {item.unit || 'pieces'}</Text>
               </Flex>
            </>
         ) : (
            <ButtonTile
               noIcon
               type="secondary"
               text="Select Packaging"
               onClick={() => openTunnel(1)}
               style={{ margin: '20px 0' }}
            />
         )}
      </>
   )
}
