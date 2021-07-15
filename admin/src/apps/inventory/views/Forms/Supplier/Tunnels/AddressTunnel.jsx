import { useMutation } from '@apollo/react-hooks'
import { Flex, Form, Spacer, TunnelHeader } from '@dailykit/ui'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { Tooltip, Banner } from '../../../../../../shared/components'
import { logger } from '../../../../../../shared/utils'
import { TunnelContainer } from '../../../../components'
import { GENERAL_ERROR_MESSAGE } from '../../../../constants/errorMessages'
import { SUPPLIER_ADDRESS_UPDATED } from '../../../../constants/successMessages'
import { UPDATE_SUPPLIER } from '../../../../graphql'
import { validators } from '../../../../utils/validators'

const address = 'apps.inventory.views.forms.supplier.tunnels.'

export default function AddressTunnel({ close, formState }) {
   const { t } = useTranslation()
   const addressState = formState.address || {}

   const [address1, setAddress1] = useState({
      value: addressState.address1 || '',
      meta: {
         isValid: addressState.address1?.length ? true : false,
         isTouched: false,
         errors: [],
      },
   })
   const [address2, setAddress2] = useState({
      value: addressState.address2 || '',
      meta: {
         isValid: addressState.address2?.length ? true : false,
         errors: [],
         isTouched: false,
      },
   })
   const [city, setCity] = useState({
      value: addressState.city || '',
      meta: {
         isTouched: false,
         errors: [],
         isValid: addressState.city?.length ? true : false,
      },
   })
   const [zip, setZip] = useState({
      value: addressState.zip || '',
      meta: {
         isTouched: false,
         isValid: addressState.zip ? true : false,
         errors: [],
      },
   })
   const [instructions, setInstructions] = useState({
      value: addressState.instructions || '',
      meta: {
         isTouched: false,
         isValid: addressState.instructions?.length ? true : false,
         errors: [],
      },
   })

   const [updateSupplier, { loading }] = useMutation(UPDATE_SUPPLIER, {
      onCompleted: () => {
         toast.info(SUPPLIER_ADDRESS_UPDATED)
         close(1)
      },
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
         close(1)
      },
   })

   const validateForm = () => {
      if (!address1.value || !address1.meta.isValid)
         return 'Address line 1 is required'
      if (!city.value || !city.meta.isValid) return 'city is required'
      if (!zip.meta.isValid) return 'invalid zip code'
      return true
   }

   const handleNext = () => {
      const checkValues = validateForm()

      if (!checkValues.length) {
         const pushableAddress = {
            address1: address1.value.toString().trim(),
            address2: address2.value.toString().trim(),
            city: city.value.toString().trim(),
            zip: zip.value,
            instructions: instructions.value.toString().trim(),
         }

         updateSupplier({
            variables: {
               id: formState.id,
               object: {
                  address: pushableAddress,
               },
            },
         })
      } else {
         toast.error(checkValues)
      }
   }

   return (
      <>
         <TunnelHeader
            title={t(address.concat('add address'))}
            close={() => close(1)}
            right={{
               title: loading ? 'Saving...' : 'Save',
               action: handleNext,
            }}
            tooltip={
               <Tooltip identifier="suppliers_form_view_address_tunnel_header" />
            }
            description={`Add address for ${formState.name}`}
         />
         <Banner id="inventory-apps-suppliers-address-tunnel-top" />
         <TunnelContainer>
            <>
               <Spacer size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="address1" title="address1">
                     {t(address.concat('address line 1'))}*
                  </Form.Label>
                  <Form.Text
                     id="address1"
                     name="address1"
                     value={address1.value}
                     onChange={e => {
                        setAddress1({
                           value: e.target.value,
                           meta: { ...address1.meta },
                        })
                     }}
                     onBlur={e => {
                        const { isValid, errors } = validators.name(
                           e.target.value,
                           'Address line 1'
                        )

                        setAddress1({
                           value: e.target.value,
                           meta: { isValid, errors, isTouched: true },
                        })
                     }}
                  />
                  {address1.meta.isTouched && !address1.meta.isValid && (
                     <Form.Error>{address1.meta.errors[0]}</Form.Error>
                  )}
               </Form.Group>
               <Spacer size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="address2" title="address2">
                     {t(address.concat('address line 2'))}
                  </Form.Label>
                  <Form.Text
                     id="address2"
                     name="address2"
                     value={address2.value}
                     onChange={e => {
                        setAddress2({
                           value: e.target.value,
                           meta: { ...address2.meta },
                        })
                     }}
                  />
               </Form.Group>
               <Spacer size="16px" />
               <Flex container>
                  <Form.Group>
                     <Form.Label htmlFor="city" title="city">
                        {t(address.concat('city'))}*
                     </Form.Label>

                     <Form.Text
                        id="city"
                        name="city"
                        value={city.value}
                        onChange={e =>
                           setCity({
                              value: e.target.value,
                              meta: { ...city.meta },
                           })
                        }
                        onBlur={e => {
                           const { isValid, errors } = validators.name(
                              e.target.value,
                              'city'
                           )

                           setCity({
                              value: e.target.value,
                              meta: { isValid, errors, isTouched: true },
                           })
                        }}
                     />
                     {city.meta.isTouched && !city.meta.isValid && (
                        <Form.Error>{city.meta.errors[0]}</Form.Error>
                     )}
                  </Form.Group>
                  <Spacer xAxis size="8px" />
                  <Form.Group>
                     <Form.Label htmlFor="zip" title="zip">
                        {t(address.concat('zip code'))}*
                     </Form.Label>

                     <Form.Number
                        id="zip"
                        name="zip"
                        value={zip.value}
                        onChange={e =>
                           setZip({
                              value: e.target.value,
                              meta: { ...zip.meta },
                           })
                        }
                        onBlur={e => {
                           const { isValid, errors } = validators.quantity(
                              e.target.value
                           )

                           setZip({
                              value: e.target.value,
                              meta: { isValid, errors, isTouched: true },
                           })
                        }}
                     />
                     {zip.meta.isTouched && !zip.meta.isValid && (
                        <Form.Error>{zip.meta.errors[0]}</Form.Error>
                     )}
                  </Form.Group>
               </Flex>
               <Spacer size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="instructions" title="instructions">
                     <Flex container alignItems="center">
                        {t(address.concat('special instructions'))}
                        <Tooltip identifier="supplier_form_address_tunnel_special_instructions_form" />
                     </Flex>
                  </Form.Label>
                  <Form.TextArea
                     id="instructions"
                     name="instructions"
                     value={instructions.value}
                     onChange={e =>
                        setInstructions({
                           value: e.target.value,
                           meta: { ...instructions.meta },
                        })
                     }
                  />
               </Form.Group>
            </>
         </TunnelContainer>
         <Banner id="inventory-apps-suppliers-address-tunnel-bottom" />
      </>
   )
}
