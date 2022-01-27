import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import {
   Flex,
   Form,
   HelperText,
   Spacer,
   Text,
   TunnelHeader,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../shared/utils'
import { RecurrenceContext } from '../../../../../../context/recurrence'
import { CREATE_CHARGES, UPDATE_CHARGE } from '../../../../../../graphql'
import validator from '../../../../validators'
import { InputHeading, InputsNotes, TunnelBody } from '../styled'

const ChargesTunnel = ({ closeTunnel }) => {
   const { recurrenceState } = React.useContext(RecurrenceContext)
   const [busy, setBusy] = React.useState(false)
   const [from, setFrom] = React.useState({
      value: recurrenceState?.charge?.orderValueFrom || '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })
   const [to, setTo] = React.useState({
      value: recurrenceState?.charge?.orderValueUpto || '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })
   const [charge, setCharge] = React.useState({
      value: recurrenceState?.charge?.charge || '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })
   const [auto] = React.useState(
      recurrenceState?.charge?.autoDeliverySelection || false
   )

   // Mutation
   const [createCharges] = useMutation(CREATE_CHARGES, {
      onCompleted: () => {
         toast.success('Charge added!')
         closeTunnel(4)
      },
      onError: error => {
         setBusy(false)
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const [updateCharge] = useMutation(UPDATE_CHARGE, {
      onCompleted: () => {
         toast.success('Charge Updated!')
         closeTunnel(4)
      },
      onError: error => {
         setBusy(false)
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   // Handlers
   const save = () => {
      if (busy) return
      setBusy(true)
      if (!from.value || !to.value || !charge.value) {
         setBusy(false)
         return toast.error('Invalid values!')
      }
      if (from.meta.isValid && to.meta.isValid && charge.meta.isValid) {
         if (recurrenceState.charge) {
            updateCharge({
               variables: {
                  id: recurrenceState.charge.id,
                  set: {
                     orderValueFrom: +from.value,
                     orderValueUpto: +to.value,
                     charge: +charge.value,
                  },
               },
            })
         } else {
            createCharges({
               variables: {
                  objects: {
                     mileRangeId: recurrenceState.mileRangeId,
                     orderValueFrom: +from.value,
                     orderValueUpto: +to.value,
                     charge: +charge.value,
                  },
               },
            })
         }
      } else {
         setBusy(false)
         toast.error('Invalid values!')
      }
   }

   return (
      <>
         <TunnelHeader
            title={`${recurrenceState.charge ? 'Update' : 'Add'
               } Delivery Charges`}
            right={{
               action: save,
               title: busy
                  ? `${recurrenceState.charge ? 'Sav' : 'Add'}ing...`
                  : `${recurrenceState.charge ? 'Save' : 'Add'}`,
            }}
            close={() => closeTunnel(4)}
         />
         <TunnelBody>
            <InputHeading
               style={{ fontSize: "16px" }}
            >Enter Order Value Range and Charges</InputHeading>
            <Spacer size="10px" />
            <Flex container>
               <Form.Group>
                  <Form.Label htmlFor="from" title="from">
                     <InputHeading>From*</InputHeading>
                  </Form.Label>
                  <Form.Number
                     id="from"
                     name="from"
                     onChange={e => setFrom({ ...from, value: e.target.value })}
                     onBlur={() => {
                        const { isValid, errors } = validator.charge(from.value)
                        setFrom({
                           ...from,
                           meta: {
                              isTouched: true,
                              isValid,
                              errors,
                           },
                        })
                     }}
                     value={from.value}
                     placeholder="Enter order value"
                     hasError={from.meta.isTouched && !from.meta.isValid}
                  />
                  {from.meta.isTouched &&
                     !from.meta.isValid &&
                     from.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>
               <Spacer xAxis size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="to" title="to">
                     <InputHeading>To*</InputHeading>
                  </Form.Label>
                  <Form.Number
                     id="to"
                     name="to"
                     onChange={e => setTo({ ...to, value: e.target.value })}
                     onBlur={() => {
                        const { isValid, errors } = validator.charge(to.value)
                        setTo({
                           ...to,
                           meta: {
                              isTouched: true,
                              isValid,
                              errors,
                           },
                        })
                     }}
                     value={to.value}
                     placeholder="Enter order value"
                     hasError={to.meta.isTouched && !to.meta.isValid}
                  />
                  {to.meta.isTouched &&
                     !to.meta.isValid &&
                     to.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>
            </Flex>
            <Spacer size="16px" />
            <Form.Group>
               <Form.Label htmlFor="charge" title="charge">
                  <InputHeading>Charge*</InputHeading>
               </Form.Label>
               <Form.Number
                  id="charge"
                  name="charge"
                  onChange={e =>
                     setCharge({ ...charge, value: e.target.value })
                  }
                  onBlur={() => {
                     const { isValid, errors } = validator.charge(charge.value)
                     setCharge({
                        ...charge,
                        meta: {
                           isTouched: true,
                           isValid,
                           errors,
                        },
                     })
                  }}
                  value={charge.value}
                  placeholder="Enter charge"
                  hasError={charge.meta.isTouched && !charge.meta.isValid}
               />
               {charge.meta.isTouched &&
                  !charge.meta.isValid &&
                  charge.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer size="16px" />
            <section>
               <Form.Toggle name="auto" value={auto} onChange={() => { }}>
                  <InputHeading> Handle delivery automatically?</InputHeading>
               </Form.Toggle>
               <InputsNotes>Coming Soon!</InputsNotes>
            </section>
         </TunnelBody>
      </>
   )
}

export default ChargesTunnel
