import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   ButtonTile,
   Flex,
   Form,
   Select,
   Spacer,
   TunnelHeader,
   useTunnel,
} from '@dailykit/ui'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
   Banner,
   InlineLoader,
   Tooltip,
} from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { ERROR_UPDATING_ITEM_INFORMATION } from '../../../../../constants/errorMessages'
import { useTabs } from '../../../../../../../shared/providers'
import {
   UNITS_SUBSCRIPTION,
   UPDATE_SUPPLIER_ITEM,
} from '../../../../../graphql'
import { validators } from '../../../../../utils/validators'
import { Highlight, StyledInputGroup, TunnelBody } from '../styled'
import { DELETE_SUPPLIER_ITEM_UNIT_CONVERSION } from '../../../../../graphql/mutations'

const address = 'apps.inventory.views.forms.item.tunnels.info.'

export default function InfoTunnel({ close, formState }) {
   const { t } = useTranslation()
   const { setTabTitle } = useTabs()
   const [units, setUnits] = useState([])

   const [itemName, setItemName] = useState({
      value: formState.name || '',
      meta: { isValid: !!formState.name, isTouched: false, errors: [] },
   })
   const [sku, setSku] = useState({
      value: formState.sku || '',
      meta: { isValid: !!formState.sku, isTouched: false, errors: [] },
   })
   const [unitSize, setUnitSize] = useState({
      value: formState.unitSize || '',
      meta: { isValid: !!formState.unitSize, isTouched: false, errors: [] },
   })
   const [unit, setUnit] = useState({
      value: formState.unit,
      meta: { isValid: !!formState.unit, errors: [] },
   })
   const [unitPrice, setUnitPrice] = useState({
      value:
         (formState.prices?.length && formState.prices[0].unitPrice.value) ||
         '',
      meta: {
         isValid: !!(
            formState.prices?.length && formState.prices[0].unitPrice.value
         ),
         isTouched: false,
         errors: [],
      },
   })
   const [leadTime, setLeadTime] = useState({
      value: formState.leadTime?.value || '',
      meta: {
         isTouched: false,
         isValid: !!formState.leadTime?.value,
         errors: [],
      },
   })
   const [leadTimeUnit, setLeadTimeUnit] = useState({
      value: formState.leadTime?.unit || '',
      meta: { isValid: !!formState.leadTime?.unit, errors: [] },
   })

   const { loading: unitsLoading } = useSubscription(UNITS_SUBSCRIPTION, {
      onSubscriptionData: input => {
         const data = input.subscriptionData.data.units
         setUnits(data)
      },
   })

   const [updateSupplierItem, { loading }] = useMutation(UPDATE_SUPPLIER_ITEM, {
      onCompleted: input => {
         const newName = input.updateSupplierItem.returning[0].name
         close()
         setTabTitle(newName)
         toast.info('Item information updated')
      },
      onError: error => {
         logger(error)
         toast.error(ERROR_UPDATING_ITEM_INFORMATION)
         close()
      },
   })

   const [removeLinkedConversion] = useMutation(
      DELETE_SUPPLIER_ITEM_UNIT_CONVERSION,
      {
         onCompleted: () => {
            toast.success('Conversion removed!')
         },
         onError: error => {
            logger(error)
            toast.error('Something went wrong!')
         },
      }
   )

   const isObjectValid = () => {
      if (!itemName.value || !itemName.meta.isValid) return 'invalid item name'
      if (!sku.value || !sku.meta.isValid) return 'invalid sku'
      if (!unitSize.value || !unitSize.meta.isValid)
         return 'invalid unit quantity'
      if (!unit.value) return 'unit is required'
      if (!unitPrice.value || !unitPrice.meta.isValid)
         return 'invalid unit price'
      if (!leadTime.value || !leadTime.meta.isValid) return 'invalid lead time'
      if (!leadTimeUnit.value || leadTimeUnit.value === ' ')
         return 'lead time unit is required'

      return true
   }

   const handleSave = () => {
      const isValid = isObjectValid()
      if (!isValid.length) {
         updateSupplierItem({
            variables: {
               id: formState.id,
               object: {
                  name: itemName.value,
                  sku: sku.value,
                  unitSize: unitSize.value,
                  unit: unit.value,
                  prices: [
                     { unitPrice: { unit: '$', value: unitPrice.value } },
                  ],
                  leadTime: { unit: leadTimeUnit.value, value: leadTime.value },
               },
            },
         })
      } else {
         toast.error(isValid)
      }
   }

   const handleValidation = (e, placeholder) => {
      switch (placeholder) {
         case 'item name':
            const { isValid, errors } = validators.name(
               e.target.value,
               placeholder
            )
            if (!isValid) {
               setItemName({
                  value: formState.itemName,
                  meta: { isValid, errors, isTouched: true },
               })
            } else {
               setItemName({
                  value: e.target.value,
                  meta: { isValid, errors, isTouched: true },
               })
            }
            break
         case 'sku':
            const { isValid: validSku, errors: skuErrors } = validators.name(
               e.target.value,
               placeholder
            )
            setSku({
               ...sku,
               meta: {
                  ...sku.meta,
                  isValid: validSku,
                  errors: skuErrors,
                  isTouched: true,
               },
            })
            break
         case 'unit quantity':
            const { errors: unitSizeErrors, isValid: isUnitSizeValid } =
               validators.quantity(e.target.value)
            setUnitSize({
               ...unitSize,
               meta: {
                  errors: unitSizeErrors,
                  isValid: isUnitSizeValid,
                  isTouched: true,
               },
            })
            break
         case 'unit price':
            const { isValid: isUnitPriceValid, errors: unitPriceErrors } =
               validators.quantity(e.target.value)
            setUnitPrice({
               ...unitPrice,
               meta: {
                  isTouched: true,
                  isValid: isUnitPriceValid,
                  errors: unitPriceErrors,
               },
            })
            break
         case 'lead time':
            const { isValid: isLeadTimeValid, errors: leadTimeErrors } =
               validators.quantity(e.target.value)
            setLeadTime({
               ...leadTime,
               meta: {
                  isValid: isLeadTimeValid,
                  errors: leadTimeErrors,
                  isTouched: true,
               },
            })
            break
         default:
            return
      }
   }

   if (unitsLoading) return <InlineLoader />

   return (
      <>
         <TunnelHeader
            title={t(address.concat('item information'))}
            close={close}
            right={{
               title: loading ? 'Saving...' : 'Save',
               action: handleSave,
            }}
            description="update supplier item information"
            tooltip={
               <Tooltip identifier="supplier_item_form_item_information_tunnel" />
            }
         />
         <TunnelBody>
            <Banner id="inventory-app-items-item-information-tunnel-top" />
            <Flex margin="0 0 32px 0">
               <StyledInputGroup>
                  <Form.Group>
                     <Form.Label title="title" htmlFor="title">
                        <Flex container alignItems="center">
                           {t(address.concat('item name'))}*
                           <Tooltip identifier="supplieritem_form_itemname_formfield" />
                        </Flex>
                     </Form.Label>
                     <Form.Text
                        id="title"
                        name="title"
                        placeholder="Supplier Item Name..."
                        value={itemName.value}
                        onChange={e =>
                           setItemName({
                              value: e.target.value,
                              meta: { ...itemName.meta },
                           })
                        }
                        hasError={
                           itemName.meta.isTouched && !itemName.meta.isValid
                        }
                        onBlur={e => handleValidation(e, 'item name')}
                     />
                     {itemName.meta.isTouched && !itemName.meta.isValid && (
                        <Form.Error>{itemName.meta.errors[0]}</Form.Error>
                     )}
                  </Form.Group>
                  <Form.Group>
                     <Form.Label title="itemSku" htmlFor="sku">
                        <Flex container alignItems="center">
                           {t(address.concat('item sku'))}*
                           <Tooltip identifier="supplieritem_form_item_sku_form_field" />
                        </Flex>
                     </Form.Label>
                     <Form.Text
                        id="sku"
                        name="sku"
                        placeholder="item sku..."
                        value={sku.value}
                        onChange={e =>
                           setSku({
                              value: e.target.value,
                              meta: { ...sku.meta },
                           })
                        }
                        onBlur={e => handleValidation(e, 'sku')}
                        hasError={sku.meta.isTouched && !sku.meta.isValid}
                     />
                     {sku.meta.isTouched && !sku.meta.isValid && (
                        <Form.Error>{sku.meta.errors[0]}</Form.Error>
                     )}
                  </Form.Group>
               </StyledInputGroup>
            </Flex>
            <Flex margin="0 0 32px 0">
               <Highlight>
                  <StyledInputGroup>
                     <Form.Group>
                        <Form.Label title="unitQuantity" htmlFor="unitQuantity">
                           <Flex container alignItems="center">
                              {t(address.concat('unit qty'))}*
                              <Tooltip identifier="supplieritem_form_unitquantity" />
                           </Flex>
                        </Form.Label>
                        <Form.TextSelect>
                           <Form.Number
                              id="unitQuantity"
                              name="unitQuantity"
                              placeholder="Unit Quantity..."
                              value={unitSize.value}
                              onChange={e =>
                                 setUnitSize({
                                    value: e.target.value,
                                    meta: { ...unitSize.meta },
                                 })
                              }
                              onBlur={e => handleValidation(e, 'unit quantity')}
                              hasError={
                                 unitSize.meta.isTouched &&
                                 !unitSize.meta.isValid
                              }
                           />
                           <Form.Select
                              id="unit"
                              name="unit"
                              options={[
                                 { id: 0, title: 'Select Unit', value: ' ' },
                                 ...units,
                              ]}
                              value={unit.value}
                              onChange={e =>
                                 setUnit({
                                    value: e.target.value,
                                    meta: { ...unit.meta },
                                 })
                              }
                           />
                        </Form.TextSelect>
                        {unitSize.meta.isTouched && !unitSize.meta.isValid && (
                           <Form.Error>{unitSize.meta.errors[0]}</Form.Error>
                        )}
                        {unit.meta.isTouched && !unit.meta.isValid && (
                           <Form.Error>{unit.meta.errors[0]}</Form.Error>
                        )}
                        <Spacer size="16px" />
                     </Form.Group>
                     <Form.Group>
                        <Form.Label title="unit price" htmlFor="unitPrice">
                           <Flex container alignItems="center">
                              {t(address.concat('unit price'))} (in{' '}
                              {window._env_.REACT_APP_CURRENCY})*
                              <Tooltip identifier="supplieritem_form_item_unit_pric_form_field" />
                           </Flex>
                        </Form.Label>
                        <Form.Number
                           id="unitPrice"
                           name="Unit Price"
                           placeholder="Unit Price..."
                           value={unitPrice.value}
                           onChange={e =>
                              setUnitPrice({
                                 value: e.target.value,
                                 meta: { ...unitPrice.meta },
                              })
                           }
                           onBlur={e => handleValidation(e, 'unit price')}
                           hasError={
                              unitPrice.meta.isTouched &&
                              !unitPrice.meta.isValid
                           }
                        />
                        {unitPrice.meta.isTouched &&
                           !unitPrice.meta.isValid && (
                              <Form.Error>
                                 {unitPrice.meta.errors[0]}
                              </Form.Error>
                           )}
                     </Form.Group>
                  </StyledInputGroup>
               </Highlight>
            </Flex>
            <Flex margin="0 0 32px 0">
               <StyledInputGroup>
                  <Highlight>
                     <Form.Group>
                        <Form.Label title="Lead Time" htmlFor="leadTime">
                           <Flex container alignItems="center">
                              {t(address.concat('lead time'))}*
                              <Tooltip identifier="supplieritem_form_leadtime" />
                           </Flex>
                        </Form.Label>
                        <Form.TextSelect>
                           <Form.Number
                              id="leadTime"
                              name="Lead Time"
                              placeholder="Lead Time..."
                              value={leadTime.value}
                              onChange={e =>
                                 setLeadTime({
                                    value: e.target.value,
                                    meta: { ...leadTime.meta },
                                 })
                              }
                              onBlur={e => handleValidation(e, 'lead time')}
                              hasError={
                                 leadTime.meta.isTouched &&
                                 !leadTime.meta.isValid
                              }
                           />
                           <Form.Select
                              id="leadTimeUnit"
                              name="leadTimeUnit"
                              value={leadTimeUnit.value}
                              options={[
                                 { id: 0, title: 'Select Unit', value: ' ' },
                                 { id: 1, title: t(address.concat('days')) },
                                 { id: 2, title: t(address.concat('weeks')) },
                              ]}
                              onChange={e =>
                                 setLeadTimeUnit({
                                    value: e.target.value,
                                    meta: { ...leadTimeUnit.meta },
                                 })
                              }
                           />
                        </Form.TextSelect>
                        {leadTime.meta.isTouched && !leadTime.meta.isValid && (
                           <Form.Error>{leadTime.meta.errors[0]}</Form.Error>
                        )}
                        {leadTimeUnit.meta.isTouched &&
                           !leadTimeUnit.meta.isValid && (
                              <Form.Error>
                                 {leadTimeUnit.meta.errors[0]}
                              </Form.Error>
                           )}
                     </Form.Group>
                  </Highlight>
               </StyledInputGroup>
            </Flex>
            <Banner id="inventory-app-items-item-information-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}
