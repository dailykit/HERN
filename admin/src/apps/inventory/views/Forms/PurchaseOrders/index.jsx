import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   ButtonTile,
   Dropdown,
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
   PURCHASE_ORDER_SUBSCRIPTION,
   UNITS_SUBSCRIPTION,
   UPDATE_PURCHASE_ORDER_ITEM,
} from '../../../graphql'
import { validators } from '../../../utils/validators'
import { StyledWrapper } from '../styled'
import SelectSupplierItemTunnel from './Tunnels/SelectSupplierItemTunnel'

const address = 'apps.inventory.views.forms.purchaseorders.'

function onError(error) {
   logger(error)
   toast.error(GENERAL_ERROR_MESSAGE)
}

export default function PurchaseOrderForm() {
   const { t } = useTranslation()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const { id } = useParams()

   const [options, setOptions] = React.useState([])
   const [orderQuantity, setOrderQuantity] = useState({
      value: '',
      meta: { isValid: false, isTouched: false, errors: [] },
   })
   const [orderUnit, setOrderUnit] = useState('')

   const {
      data: { purchaseOrderItem: state = {} } = {},
      loading: orderLoading,
      error,
   } = useSubscription(PURCHASE_ORDER_SUBSCRIPTION, {
      variables: { id },
      onSubscriptionData: data => {
         const { orderQuantity } = data.subscriptionData.data?.purchaseOrderItem
         const { isValid, errors } = validators.quantity(orderQuantity)
         setOrderQuantity({
            value: orderQuantity,
            meta: { isValid, errors, ...orderQuantity.meta },
         })
         const { supplierItem } = data.subscriptionData.data.purchaseOrderItem
         const validUnits = []
         validUnits.push(supplierItem.bulkItemAsShipped.unit)
         supplierItem.bulkItemAsShipped.bulkItemUnitConversions.forEach(
            ({ unitConversion: c }) => {
               validUnits.push(c.inputUnitName)
               validUnits.push(c.outputUnitName)
            }
         )
         const formattedUnits = [...new Set(validUnits)].map(op => ({
            title: op,
         }))
         setOptions(formattedUnits)
      },
   })

   // const { loading, error: unitsError } = useSubscription(UNITS_SUBSCRIPTION, {
   //    skip: !Object.keys(state).length,
   //    onSubscriptionData: data => {
   //       const { units } = data.subscriptionData.data

   //       const updatedUnits = units.filter(unit => {

   //       })
   //       console.log(updatedUnits)
   //       setOptions(updatedUnits)
   //    },
   // })
   // if (unitsError) console.log(unitsError)

   const [updatePurchaseOrder] = useMutation(UPDATE_PURCHASE_ORDER_ITEM, {
      onError,
      onCompleted: () => {
         toast.success('Purchase Order updated!')
      },
   })

   const editable = ['PENDING', 'UNPUBLISHED'].includes(state.status)

   const checkForm = () => {
      if (!state.supplierItem?.id) {
         toast.error('No Supplier Item selecetd!')
         return false
      }
      if (editable && (!orderQuantity.value || !orderQuantity.meta.isValid)) {
         toast.error('Invalid order quantity!')
         return false
      }
      if (editable && !state.unit) {
         toast.error('No unit selected!')
         return false
      }

      return true
   }

   const saveStatus = status => {
      const isValid = checkForm()

      if (isValid) {
         updatePurchaseOrder({ variables: { id: state.id, set: { status } } })
      }
   }

   const handleOnBlur = e => {
      const { isValid, errors } = validators.quantity(e.target.value)
      setOrderQuantity({
         value: e.target.value,
         meta: { isTouched: true, isValid, errors },
      })

      if (isValid) {
         updatePurchaseOrder({
            variables: {
               id: state.id,
               set: {
                  orderQuantity: +e.target.value,
               },
            },
         })
      }
   }

   const searchedOption = option => console.log(option)

   if (error) {
      logger(error)
      return <ErrorState />
   }

   if (orderLoading) return <Loader />

   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} style={{ overflowY: 'auto' }}>
               <SelectSupplierItemTunnel state={state} close={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <StyledWrapper>
            <Banner id="inventory-app-purchase-orders-item-top" />
            <Flex
               container
               alignItems="center"
               justifyContent="space-between"
               padding="16px 0"
            >
               <Text as="h1">{t(address.concat('purchase order'))}</Text>

               {state.status === 'UNPUBLISHED' ? (
                  <TextButton
                     type="solid"
                     onClick={() => saveStatus('PENDING')}
                  >
                     Publish
                  </TextButton>
               ) : (
                  <StatusSwitch
                     currentStatus={state.status}
                     onSave={saveStatus}
                  />
               )}
            </Flex>

            <Text as="title">{t(address.concat('supplier item'))}</Text>
            {state.supplierItem?.name ? (
               <>
                  {!editable ? (
                     <ItemCard
                        title={state.supplierItem.name}
                        onHand={state.supplierItem?.bulkItemAsShipped?.onHand}
                     />
                  ) : (
                     <ItemCard
                        title={state.supplierItem.name}
                        onHand={state.supplierItem?.bulkItemAsShipped?.onHand}
                        edit={() => openTunnel(1)}
                     />
                  )}
                  <Separator />

                  {state.status !== 'UNPUBLISHED' ? (
                     <Text as="title">
                        {state.orderQuantity} {state.unit}
                     </Text>
                  ) : (
                     <Flex
                        container
                        alignItems="flex-end"
                        margin="0px 0px 0px 16px"
                     >
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
                              value={orderQuantity.value}
                              placeholder={t(
                                 address.concat('enter order quantity')
                              )}
                              onChange={e => {
                                 setOrderQuantity({
                                    value: e.target.value,
                                    meta: { ...orderQuantity.meta },
                                 })
                              }}
                              onBlur={handleOnBlur}
                           />
                           {orderQuantity.meta.isTouched &&
                              !orderQuantity.meta.isValid && (
                                 <Form.Error>
                                    {orderQuantity.meta.errors[0]}
                                 </Form.Error>
                              )}
                        </Form.Group>

                        <Spacer xAxis size="16px" />

                        <Form.Group>
                           <Form.Label> Unit </Form.Label>
                           <Dropdown
                              type="single"
                              options={options}
                              searchedOption={searchedOption}
                              selectedOption={option =>
                                 updatePurchaseOrder({
                                    variables: {
                                       id: state.id,
                                       set: {
                                          unit: option.title,
                                       },
                                    },
                                 })
                              }
                              placeholder="type what you're looking for..."
                           />
                        </Form.Group>
                     </Flex>
                  )}
               </>
            ) : (
               <ButtonTile
                  noIcon
                  type="secondary"
                  text={t(address.concat('select supplier item'))}
                  onClick={() => openTunnel(1)}
                  style={{ margin: '20px 0' }}
               />
            )}
            <Banner id="inventory-app-purchase-orders-item-bottom" />
         </StyledWrapper>
      </>
   )
}
