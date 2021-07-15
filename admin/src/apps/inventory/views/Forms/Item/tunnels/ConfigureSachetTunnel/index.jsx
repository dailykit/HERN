import { useMutation, useSubscription } from '@apollo/react-hooks'
import { Flex, Form, Select, Spacer, TunnelHeader } from '@dailykit/ui'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { InlineLoader, Tooltip } from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils/errorLog'
import { TunnelContainer } from '../../../../../components'
import { SACHET_ITEMS_CREATE_ERROR } from '../../../../../constants/errorMessages'
import { CREATE_SACHET_ITEM } from '../../../../../graphql'
import { validators } from '../../../../../utils/validators'
import { StyledInputGroup } from '../styled'
import {
   DELETE_SACHET_ITEM_UNIT_CONVERSION,
   UPDATE_SACHET_ITEM,
} from '../../../../../graphql/mutations'
import { SACHET_ITEM_UNIT_CONVERSIONS } from '../../../../../graphql/subscriptions'
import { SupplierItemContext } from '../../../../../context/sachetItem'

const address = 'apps.inventory.views.forms.item.tunnels.configuresachettunnel.'

export default function ConfigureSachetTunnel({
   close,
   procId,
   unit,
   openLinkConversionTunnel,
}) {
   const { supplierState } = React.useContext(SupplierItemContext)
   const { t } = useTranslation()
   const [selectedConversions, setSelectedConversions] = useState([])

   const [par, setPar] = useState({
      value: '',
      meta: { isValid: false, isTouched: false, errors: [] },
   })
   const [maxInventoryLevel, setMaxInventoryLevel] = useState({
      value: '',
      meta: { isValid: false, isTouched: false, errors: [] },
   })

   const { loading: conversionsLoading, error } = useSubscription(
      SACHET_ITEM_UNIT_CONVERSIONS,
      {
         variables: {
            id: supplierState.sachetItemId,
         },
         onSubscriptionData: data => {
            const { sachetItem } = data.subscriptionData.data
            console.log({ sachetItem })
            if (sachetItem.sachetItemUnitConversions) {
               const updatedConversions = sachetItem.sachetItemUnitConversions.map(
                  ({ unitConversion: c, id }) => ({
                     title: `1 ${c.inputUnitName} = ${c.conversionFactor} ${c.outputUnitName}`,
                     id,
                  })
               )
               setSelectedConversions([...updatedConversions])
            }
         },
      }
   )
   if (error) console.log(error)

   const [updateSachetItem, { loading }] = useMutation(UPDATE_SACHET_ITEM, {
      onCompleted: () => {
         toast.success('Sachet item updated!')
         close(2)
         close(1)
      },
      onError: error => {
         logger(error)
         toast.error('Something went wrong!')
      },
   })

   const [removeLinkedConversion] = useMutation(
      DELETE_SACHET_ITEM_UNIT_CONVERSION,
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

   const checkValues = () => {
      if (!par.value || (!par.meta.isValid && par.meta.isTouched))
         return 'invalid par level value'
      if (
         !maxInventoryLevel.value ||
         (!maxInventoryLevel.meta.isValid && maxInventoryLevel.meta.isTouched)
      )
         return 'invalid max inventory level value'
      return true
   }

   const handleNext = () => {
      const checkIsValid = checkValues()
      if (!checkIsValid.length)
         updateSachetItem({
            variables: {
               id: supplierState.sachetItemId,
               _set: {
                  parLevel: par.value,
                  maxLevel: maxInventoryLevel.value,
               },
            },
         })
      else toast.error(checkIsValid)
   }

   return (
      <>
         <TunnelHeader
            title="Sachet Details"
            close={() => close(2)}
            right={{
               title: loading ? 'Saving...' : 'Save',
               action: handleNext,
            }}
            description="add sachet items"
            tooltip={
               <Tooltip identifier="supplier_item_form_add_sachet_items_tunnel" />
            }
         />
         <TunnelContainer>
            <Spacer size="16px" />
            <Select
               options={selectedConversions}
               addOption={() =>
                  openLinkConversionTunnel({
                     schema: 'inventory',
                     table: 'sachetItem',
                     entityId: supplierState.sachetItemId,
                  })
               }
               placeholder="Link Conversions"
               removeOption={option =>
                  removeLinkedConversion({
                     variables: { id: option.id },
                  })
               }
            />
            <Spacer size="16px" />

            <StyledInputGroup>
               <Form.Group>
                  <Form.Label title="parLevel" htmlFor="par">
                     <Flex container alignItems="center">
                        {t(address.concat('set par level'))} (packets)*
                        <Tooltip identifier="supplier_form_add_sachet_parLevel_formfield" />
                     </Flex>
                  </Form.Label>

                  <Form.Number
                     id="par"
                     name="par"
                     value={par.value}
                     placeholder={t(address.concat('set par level'))}
                     onChange={e =>
                        setPar({ value: e.target.value, meta: { ...par.meta } })
                     }
                     onBlur={e => {
                        const { errors, isValid } = validators.quantity(
                           e.target.value
                        )
                        setPar({
                           value: e.target.value,
                           meta: { isValid, errors, isTouched: true },
                        })
                     }}
                  />
                  {par.meta.isTouched && !par.meta.isValid && (
                     <Form.Error>{par.meta.errors[0]}</Form.Error>
                  )}
               </Form.Group>
               <Form.Group>
                  <Form.Label title="maxLevel" htmlFor="maxLevel">
                     <Flex container alignItems="center">
                        {t(address.concat('max inventory level'))}*
                        <Tooltip identifie="supplier_form_add_sachet_maxLevel_formfield" />
                     </Flex>
                  </Form.Label>
                  <Form.Number
                     id="maxLevel"
                     name="maxLevel"
                     placeholder={t(address.concat('max inventory level'))}
                     value={maxInventoryLevel.value}
                     onChange={e =>
                        setMaxInventoryLevel({
                           value: e.target.value,
                           meta: { ...maxInventoryLevel.meta },
                        })
                     }
                     onBlur={e => {
                        const { isValid, errors } = validators.quantity(
                           e.target.value
                        )
                        setMaxInventoryLevel({
                           value: e.target.value,
                           meta: { isValid, errors, isTouched: true },
                        })
                     }}
                  />
                  {maxInventoryLevel.meta.isTouched &&
                     !maxInventoryLevel.meta.isValid && (
                        <Form.Error>
                           {maxInventoryLevel.meta.errors[0]}
                        </Form.Error>
                     )}
               </Form.Group>
            </StyledInputGroup>
         </TunnelContainer>
      </>
   )
}
