import { useMutation } from '@apollo/react-hooks'
import { Flex, Form, Spacer, Text, TunnelHeader } from '@dailykit/ui'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { Banner, Tooltip } from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { GENERAL_ERROR_MESSAGE } from '../../../../../constants/errorMessages'
import { useTabs } from '../../../../../../../shared/providers'
import { UPDATE_PACKAGING } from '../../../../../graphql'
import { validators } from '../../../../../utils/validators'
import { StyledInputGroup } from '../../../Item/tunnels/styled'
import { TunnelWrapper } from '../../../utils/TunnelWrapper'

export default function ItemInformationTunnel({ close, state, next }) {
   const { setTabTitle } = useTabs()

   const [itemName, setItemName] = useState({
      value: state.packagingName || '',
      meta: {
         isValid: state.packagingName ? true : false,
         errors: [],
         isTouched: false,
      },
   })
   const [itemSku, setItemSku] = useState({
      value: state.packagingSku || '',
      meta: {
         isValid: state.packagingSku ? true : false,
         isTouched: false,
         errors: [],
      },
   })

   const [itemWidth, setItemWidth] = useState({
      value: state.width || '',
      meta: {
         isValid: state.width?.toString() ? true : false,
         isTouched: false,
         errors: [],
      },
   })
   const [itemHeight, setItemHeight] = useState({
      value: state.height || '',
      meta: {
         isValid: state.height?.toString() ? true : false,
         isTouched: false,
         errors: [],
      },
   })
   const [itemLength, setItemLength] = useState({
      value: state.length || '',
      meta: {
         isValid: state.length?.toString() ? true : false,
         isTouched: false,
         errors: [],
      },
   })

   const [itemPar, setItemPar] = useState({
      value: state.parLevel || '',
      meta: {
         isValid: state.parLevel?.toString() ? true : false,
         isTouched: false,
         errors: [],
      },
   })
   const [itemMaxValue, setItemMaxValue] = useState({
      value: state.maxLevel || '',
      meta: {
         isValid: state.maxLevel?.toString() ? true : false,
         isTouched: false,
         errors: [],
      },
   })

   const [updatePackaging, { loading }] = useMutation(UPDATE_PACKAGING, {
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
         close(1)
      },
      onCompleted: () => {
         toast.success('Information Added')
         setTabTitle(itemName.value)
         close(1)
         next(2)
      },
   })

   const validateObject = () => {
      if (!itemName.meta.isValid)
         return { message: 'packaging name is required', required: true }
      if (!itemSku.meta.isValid)
         return { message: 'packaging sku is required', required: true }
      if (!itemMaxValue.meta.isValid)
         return {
            message: 'invalid max. inventory level value',
            required: true,
         }
      if (!itemPar.meta.isValid)
         return { message: 'invalid par level value', required: true }

      if (itemLength.meta.isTouched && !itemLength.meta.isValid)
         return { message: 'length is invalid', required: false }
      if (itemWidth.meta.isTouched && !itemWidth.meta.isValid)
         return { message: 'width is invalid', required: false }
      if (itemHeight.meta.isTouched && !itemHeight.meta.isValid)
         return { message: 'height is invalid', required: false }

      return true
   }

   const handleNext = () => {
      const validationData = validateObject()

      if (typeof validateObject === 'boolean' || !validationData.required)
         updatePackaging({
            variables: {
               id: state.id,
               object: {
                  name: itemName.value,
                  packagingSku: itemSku.value,
                  width: itemWidth.meta.isValid ? +itemWidth.value : null,
                  height: itemHeight.meta.isValid ? +itemHeight.value : null,
                  length: itemLength.meta.isValid ? +itemLength.value : null,
                  parLevel: +itemPar.value,
                  maxLevel: +itemMaxValue.value,
                  LWHUnit: 'mm',
               },
            },
         })
      else {
         toast.error(validationData.message)
      }
   }

   return (
      <>
         <TunnelHeader
            title="Item Information"
            close={() => close(1)}
            right={{ title: 'Next', action: handleNext, isLoading: loading }}
            description="Add packaging related information"
            tooltip={
               <Tooltip identifier="packaging-form_item-information_tunnel" />
            }
         />
         <Spacer size="16px" />
         <Banner id="inventory-app-packaging-form-item-information-tunnel-top" />
         <TunnelWrapper>
            <StyledInputGroup>
               <Form.Group>
                  <Form.Label htmlFor="packagingName" title="packagingName">
                     Item name*
                  </Form.Label>
                  <Form.Text
                     id="packagingName"
                     placeholder="Item name"
                     name="packagingName"
                     value={itemName.value}
                     onChange={e =>
                        setItemName({
                           value: e.target.value,
                           meta: { ...itemName.meta },
                        })
                     }
                     onBlur={e => {
                        const { value } = e.target
                        const { isValid, errors } = validators.name(
                           value,
                           'packaging name'
                        )
                        setItemName({
                           value,
                           meta: { isValid, errors, isTouched: true },
                        })
                     }}
                     hasError={itemName.meta.isTouched && itemName.meta.isValid}
                  />
                  {itemName.meta.isTouched && !itemName.meta.isValid && (
                     <Form.Error>{itemName.meta.errors[0]}</Form.Error>
                  )}
               </Form.Group>
               <Form.Group>
                  <Form.Label htmlFor="itemSKU" title="itemSKU">
                     Item SKU*
                  </Form.Label>
                  <Form.Text
                     id="itemSKU"
                     placeholder="Item SKU"
                     name="itemSKU"
                     value={itemSku.value}
                     onChange={e =>
                        setItemSku({
                           value: e.target.value,
                           meta: { ...itemSku.meta },
                        })
                     }
                     onBlur={e => {
                        const { value } = e.target
                        const { isValid, errors } = validators.name(
                           value,
                           'sku'
                        )
                        setItemSku({
                           value,
                           meta: { isValid, errors, isTouched: true },
                        })
                     }}
                     hasError={itemSku.meta.isTouched && itemSku.meta.isValid}
                  />
                  {itemSku.meta.isTouched && !itemSku.meta.isValid && (
                     <Form.Error>{itemSku.meta.errors[0]}</Form.Error>
                  )}
               </Form.Group>
            </StyledInputGroup>

            <Spacer size="16px" />

            <Text as="title">Dimensions (in mm)</Text>
            <Flex
               style={{
                  display: 'grid',
                  columnGap: '32px',
                  gridTemplateColumns: 'repeat(3, 1fr)',
               }}
            >
               <Form.Group>
                  <Form.Label htmlFor="width" title="width">
                     width
                  </Form.Label>
                  <Form.Number
                     id="width"
                     placeholder="width"
                     name="width"
                     value={itemWidth.value}
                     onChange={e =>
                        setItemWidth({
                           value: e.target.value,
                           meta: { ...itemWidth.meta },
                        })
                     }
                     onBlur={e => {
                        const { value } = e.target
                        const { isValid, errors } = validators.quantity(value)
                        setItemWidth({
                           value,
                           meta: { isValid, errors, isTouched: true },
                        })
                     }}
                     hasError={
                        itemWidth.meta.isTouched && itemWidth.meta.isValid
                     }
                  />
                  {itemWidth.meta.isTouched && !itemWidth.meta.isValid && (
                     <Form.Error>{itemWidth.meta.errors[0]}</Form.Error>
                  )}
               </Form.Group>
               <Form.Group>
                  <Form.Label htmlFor="length" title="length">
                     length
                  </Form.Label>
                  <Form.Number
                     id="length"
                     placeholder="length"
                     name="length"
                     value={itemLength.value}
                     onChange={e =>
                        setItemLength({
                           value: e.target.value,
                           meta: { ...itemLength.meta },
                        })
                     }
                     onBlur={e => {
                        const { value } = e.target
                        const { isValid, errors } = validators.quantity(value)
                        setItemLength({
                           value,
                           meta: { isValid, errors, isTouched: true },
                        })
                     }}
                     hasError={
                        itemLength.meta.isTouched && itemLength.meta.isValid
                     }
                  />
                  {itemLength.meta.isTouched && !itemLength.meta.isValid && (
                     <Form.Error>{itemLength.meta.errors[0]}</Form.Error>
                  )}
               </Form.Group>
               <Form.Group>
                  <Form.Label htmlFor="height" title="height">
                     height
                  </Form.Label>
                  <Form.Number
                     id="height"
                     placeholder="height"
                     name="height"
                     value={itemHeight.value}
                     onChange={e =>
                        setItemHeight({
                           value: e.target.value,
                           meta: { ...itemHeight.meta },
                        })
                     }
                     onBlur={e => {
                        const { value } = e.target
                        const { isValid, errors } = validators.quantity(value)
                        setItemHeight({
                           value,
                           meta: { isValid, errors, isTouched: true },
                        })
                     }}
                     hasError={
                        itemHeight.meta.isTouched && itemHeight.meta.isValid
                     }
                  />
                  {itemHeight.meta.isTouched && !itemHeight.meta.isValid && (
                     <Form.Error>{itemHeight.meta.errors[0]}</Form.Error>
                  )}
               </Form.Group>
            </Flex>

            <Spacer size="16px" />

            <StyledInputGroup>
               <Form.Group>
                  <Form.Label htmlFor="par" title="par">
                     Set Par Level*
                  </Form.Label>
                  <Form.Number
                     id="par"
                     placeholder="Set Par Level"
                     name="par"
                     value={itemPar.value}
                     onChange={e =>
                        setItemPar({
                           value: e.target.value,
                           meta: { ...itemPar.meta },
                        })
                     }
                     onBlur={e => {
                        const { value } = e.target
                        const { isValid, errors } = validators.quantity(value)
                        setItemPar({
                           value,
                           meta: { isValid, errors, isTouched: true },
                        })
                     }}
                     hasError={itemPar.meta.isTouched && !itemPar.meta.isValid}
                  />
                  {itemPar.meta.isTouched && !itemPar.meta.isValid && (
                     <Form.Error>{itemPar.meta.errors[0]}</Form.Error>
                  )}
               </Form.Group>
               <Form.Group>
                  <Form.Label htmlFor="maxLevel" title="maxLevel">
                     Maximum Inventory Value*
                  </Form.Label>
                  <Form.Number
                     id="maxLevel"
                     placeholder="Maximum Inventory Value"
                     name="maxLevel"
                     value={itemMaxValue.value}
                     onChange={e =>
                        setItemMaxValue({
                           value: e.target.value,
                           meta: { ...itemMaxValue.meta },
                        })
                     }
                     onBlur={e => {
                        const { value } = e.target
                        const { isValid, errors } = validators.quantity(value)
                        setItemMaxValue({
                           value,
                           meta: { isValid, errors, isTouched: true },
                        })
                     }}
                     hasError={
                        itemMaxValue.meta.isTouched &&
                        !itemMaxValue.meta.isValid
                     }
                  />
                  {itemMaxValue.meta.isTouched &&
                     !itemMaxValue.meta.isValid && (
                        <Form.Error>{itemMaxValue.meta.errors[0]}</Form.Error>
                     )}
               </Form.Group>
            </StyledInputGroup>
         </TunnelWrapper>
         <Banner id="inventory-app-packaging-form-item-information-tunnel-bottom" />
      </>
   )
}
