import React, { useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { Flex, Form, TunnelHeader } from '@dailykit/ui'
import { toast } from 'react-toastify'
import { Banner, Tooltip } from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { SACHET_ITEMS_CREATE_ERROR } from '../../../../../constants/errorMessages'
import { CREATE_SACHET_ITEM } from '../../../../../graphql'
import { validators } from '../../../../../utils/validators'
import { SupplierItemContext } from '../../../../../context/sachetItem'

const CreateSachetTunnel = ({ close, open, procId, unit }) => {
   const { supplierDispatch } = React.useContext(SupplierItemContext)

   const [quantity, setQuantity] = useState({
      value: '',
      meta: { isValid: false, isTouched: false, errors: [] },
   })

   const [creatSachetItem, { loading }] = useMutation(CREATE_SACHET_ITEM, {
      onCompleted: data => {
         if (data?.createSachetItem?.returning?.length) {
            supplierDispatch({
               type: 'SACHET_ITEM_ID',
               payload: data.createSachetItem.returning[0].id,
            })
            open(2)
            toast.info('Sachet added!')
         }
      },
      onError: error => {
         close(1)
         logger(error)
         toast.error(SACHET_ITEMS_CREATE_ERROR)
      },
   })

   const checkValues = () => {
      if (
         !quantity.value ||
         (!quantity.meta.isValid && quantity.meta.isTouched)
      )
         return 'invalid quantity'
      return true
   }

   const handleNext = () => {
      const checkIsValid = checkValues()
      if (!checkIsValid.length)
         creatSachetItem({
            variables: {
               unitSize: quantity.value,
               bulkItemId: procId,
               unit,
            },
         })
      else toast.error(checkIsValid)
   }

   return (
      <>
         <TunnelHeader
            title="Create Sachet"
            close={() => close(1)}
            tooltip={
               <Tooltip identifier="supplier_item_create_sachet_tunnel" />
            }
            right={{
               title: 'Create',
               action: handleNext,
            }}
         />
         <Banner id="inventory-app-items-supplier-item-create-sachet-tunnel-top" />
         <Flex padding="16px">
            <Form.Group>
               <Form.Label htmlFor="quantity" title="sachetQuantity">
                  <Flex container alignItems="center">
                     Sachet Quantity (in {unit})*
                     <Tooltip identifier="supplier_form_add_sachet_quantity_formfield" />
                  </Flex>
               </Form.Label>
               <Form.Number
                  id="quantity"
                  name="quantity"
                  value={quantity.value}
                  placeholder={`Sachet Quantity (in ${unit})`}
                  onChange={e =>
                     setQuantity({
                        value: e.target.value,
                        meta: { ...quantity.meta },
                     })
                  }
                  onBlur={e => {
                     const { isValid, errors } = validators.quantity(
                        e.target.value
                     )

                     setQuantity({
                        value: e.target.value,
                        meta: { isValid, errors, isTouched: true },
                     })
                  }}
               />
               {quantity.meta.isTouched && !quantity.meta.isValid && (
                  <Form.Error>{quantity.meta.errors[0]}</Form.Error>
               )}
            </Form.Group>
         </Flex>
         <Banner id="inventory-app-items-supplier-item-create-sachet-tunnel-bottom" />
      </>
   )
}

export default CreateSachetTunnel
