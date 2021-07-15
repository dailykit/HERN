// TODO: HTMLSelect
import { useMutation } from '@apollo/react-hooks'
import { Form, Spacer, TunnelHeader } from '@dailykit/ui'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { Banner, Tooltip } from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { GENERAL_ERROR_MESSAGE } from '../../../../../constants/errorMessages'
import { UPDATE_PACKAGING } from '../../../../../graphql'
import { validators } from '../../../../../utils/validators'
import { StyledInputGroup } from '../../../Item/tunnels/styled'
import { TunnelWrapper } from '../../../utils/TunnelWrapper'

export default function MoreItemInfoTunnel({ close, state }) {
   const [unitQuantity, setUnitQuantity] = useState({
      value: state.unitQuantity || '',
      meta: {
         isValid: state.unitQuantity?.toString() ? true : false,
         isTouched: false,
         errors: [],
      },
   })
   const [unitPrice, setUnitPrice] = useState({
      value: state.unitPrice || '',
      meta: {
         isValid: state.unitPrice?.toString() ? true : false,
         isTouched: false,
         errors: [],
      },
   })
   const [caseQuantity, setCaseQuantity] = useState({
      value: state.caseQuantity || '',
      meta: {
         isValid: state.caseQuantity?.toString() ? true : false,
         isTouched: false,
         errors: [],
      },
   })
   const [minOrderValue, setMinOrderValue] = useState({
      value: state.minOrderValue || '',
      meta: {
         isValid: state.minOrderValue?.toString() ? true : false,
         isTouched: false,
         errors: [],
      },
   })
   const [leadTime, setLeadTime] = useState({
      value: state.leadTime?.value || '',
      meta: {
         isValid: state.leadTime?.value?.toString() ? true : false,
         isTouched: false,
         errors: [],
      },
   })
   const [leadTimeUnit, setLeadTimeUnit] = useState({
      value: state.leadTime?.unit || 'hours',
      meta: {
         isValid: state.leadtime?.unit ? true : false,
         isTouched: false,
         errors: [],
      },
   })

   const [updatePackaging, { loading }] = useMutation(UPDATE_PACKAGING, {
      onCompleted: () => {
         close(2)
         toast.info('updated successfully!')
      },
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
         close(2)
      },
   })

   const handleNext = () => {
      updatePackaging({
         variables: {
            id: state.id,
            object: {
               unitPrice: unitPrice.meta.isValid ? +unitPrice.value : null,
               unitQuantity: unitQuantity.meta.isValid
                  ? +unitQuantity.value
                  : null,
               caseQuantity: caseQuantity.meta.isValid
                  ? +caseQuantity.value
                  : null,
               minOrderValue: minOrderValue.meta.isValid
                  ? +minOrderValue.value
                  : null,
               leadTime: {
                  unit: leadTimeUnit.value,
                  value: leadTime.meta.isValid ? leadTime.value : null,
               },
            },
         },
      })
   }

   return (
      <>
         <TunnelHeader
            title="More Item Information"
            close={() => close(2)}
            right={{ title: 'Save', action: handleNext, isLoading: loading }}
            description="Add packaging related information"
            tooltip={
               <Tooltip identifier="packaging-form_more_item_information-tunnel" />
            }
         />
         <Spacer size="16px" />
         <Banner id="inventory-app-packaging-form-more-information-tunnel-top" />
         <TunnelWrapper>
            <StyledInputGroup>
               <Form.Group>
                  <Form.Label htmlFor="unitQty" title="unitQuantity">
                     Unit qty (in pieces)
                  </Form.Label>
                  <Form.Number
                     id="unitQty"
                     placeholder="Unit qty (in pieces)"
                     name="unitQty"
                     value={unitQuantity.value}
                     onChange={e =>
                        setUnitQuantity({
                           value: e.target.value,
                           meta: { ...unitQuantity.meta },
                        })
                     }
                     onBlur={e => {
                        const { value } = e.target
                        const { isValid, errors } = validators.quantity(value)
                        setUnitQuantity({
                           value,
                           meta: { isValid, errors, isTouched: true },
                        })
                     }}
                  />
                  {unitQuantity.meta.isTouched &&
                     !unitQuantity.meta.isValid && (
                        <Form.Error>{unitQuantity.meta.errors[0]}</Form.Error>
                     )}
               </Form.Group>
               <Form.Group>
                  <Form.Label htmlFor="unitPrice" title="unitPrice">
                     Unit Price (in {window._env_.REACT_APP_CURRENCY})
                  </Form.Label>
                  <Form.Number
                     id="unitPrice"
                     placeholder="Unit Price"
                     name="unitPrice"
                     value={unitPrice.value}
                     onChange={e =>
                        setUnitPrice({
                           value: e.target.value,
                           meta: { ...unitPrice.meta },
                        })
                     }
                     onBlur={e => {
                        const { value } = e.target
                        const { isValid, errors } = validators.quantity(value)
                        setUnitPrice({
                           value,
                           meta: { isValid, errors, isTouched: true },
                        })
                     }}
                  />
                  {unitPrice.meta.isTouched && !unitPrice.meta.isValid && (
                     <Form.Error>{unitPrice.meta.errors[0]}</Form.Error>
                  )}
               </Form.Group>
            </StyledInputGroup>

            <Spacer size="16px" />

            <StyledInputGroup>
               <Form.Group>
                  <Form.Label htmlFor="caseQty" title="caseQty">
                     Case qty (in pieces)
                  </Form.Label>
                  <Form.Number
                     id="caseQty"
                     placeholder="Case qty (in pieces)"
                     name="caseQty"
                     value={caseQuantity.value}
                     onChange={e =>
                        setCaseQuantity({
                           value: e.target.value,
                           meta: { ...caseQuantity.meta },
                        })
                     }
                     onBlur={e => {
                        const { value } = e.target
                        const { isValid, errors } = validators.quantity(value)
                        setCaseQuantity({
                           value,
                           meta: { isValid, errors, isTouched: true },
                        })
                     }}
                  />
                  {caseQuantity.meta.isTouched &&
                     !caseQuantity.meta.isValid && (
                        <Form.Error>{caseQuantity.meta.errors[0]}</Form.Error>
                     )}
               </Form.Group>

               <Form.Group>
                  <Form.Label htmlFor="minOrderValue" title="minOrderValue">
                     Min. value order (in case)
                  </Form.Label>
                  <Form.Number
                     id="minOrderValue"
                     placeholder="Min. value order (in case)"
                     name="minOrderValue"
                     value={minOrderValue.value}
                     onChange={e =>
                        setMinOrderValue({
                           value: e.target.value,
                           meta: { ...minOrderValue.meta },
                        })
                     }
                     onBlur={e => {
                        const { value } = e.target
                        const { isValid, errors } = validators.quantity(value)
                        setMinOrderValue({
                           value,
                           meta: { isValid, errors, isTouched: true },
                        })
                     }}
                  />
                  {unitPrice.meta.isTouched && !unitPrice.meta.isValid && (
                     <Form.Error>{unitPrice.meta.errors[0]}</Form.Error>
                  )}
               </Form.Group>
            </StyledInputGroup>

            <Spacer size="16px" />
            <StyledInputGroup>
               <Form.Group>
                  <Form.Label htmlFor="leadTime" title="leadTime">
                     Lead time
                  </Form.Label>

                  <Form.TextSelect>
                     <Form.Number
                        id="leadTime"
                        placeholder="Lead time"
                        name="leadTime"
                        value={leadTime.value}
                        onChange={e =>
                           setLeadTime({
                              value: e.target.value,
                              meta: { ...leadTime.meta },
                           })
                        }
                        onBlur={e => {
                           const { value } = e.target
                           const { isValid, errors } = validators.quantity(
                              value
                           )
                           setLeadTime({
                              value,
                              meta: { errors, isValid, isTouched: true },
                           })
                        }}
                     />

                     <Form.Select
                        id="unit"
                        name="unit"
                        value={leadTimeUnit.value}
                        onChange={e =>
                           setLeadTimeUnit({
                              value: e.target.value,
                              meta: { ...leadTimeUnit.meta },
                           })
                        }
                        options={[
                           { id: 0, title: 'Select Unit', value: ' ' },
                           { id: 1, title: 'days' },
                           { id: 2, title: 'hours' },
                        ]}
                     />
                  </Form.TextSelect>
                  {leadTime.meta.isTouched && !leadTime.meta.isValid && (
                     <Form.Error>{leadTime.meta.errors[0]}</Form.Error>
                  )}
               </Form.Group>
            </StyledInputGroup>
         </TunnelWrapper>
         <Banner id="inventory-app-packaging-form-more-information-tunnel-bottom" />
      </>
   )
}
