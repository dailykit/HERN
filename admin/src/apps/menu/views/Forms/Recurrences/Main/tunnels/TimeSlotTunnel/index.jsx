import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { Flex, Form, Spacer, Text, TunnelHeader } from '@dailykit/ui'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../shared/utils'
import { RecurrenceContext } from '../../../../../../context/recurrence'
import { CREATE_TIME_SLOTS } from '../../../../../../graphql'
import validator from '../../../../validators'
import { TunnelBody } from '../styled'

const TimeSlotTunnel = ({ closeTunnel }) => {
   const { recurrenceState } = React.useContext(RecurrenceContext)
   const { type } = useParams()
   const [from, setFrom] = React.useState({
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })
   const [to, setTo] = React.useState({
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })
   const [advance, setAdvance] = React.useState({
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })

   // Mutation
   const [createTimeSlots, { loading: inFlight }] = useMutation(
      CREATE_TIME_SLOTS,
      {
         onCompleted: () => {
            toast.success('Time slot added!')
            closeTunnel(2)
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   // Handlers
   const save = () => {
      if (inFlight) return
      if (
         !from.value ||
         !to.value ||
         (!advance.value && type.includes('PICKUP'))
      ) {
         return toast.error('Invalid values!')
      }
      if (advance.meta.isValid && from.meta.isValid && to.meta.isValid) {
         createTimeSlots({
            variables: {
               objects: [
                  {
                     recurrenceId: recurrenceState.recurrenceId,
                     from: from.value,
                     to: to.value,
                     pickUpLeadTime:
                        type === 'PREORDER_PICKUP' ? +advance.value : null,
                     pickUpPrepTime:
                        type === 'ONDEMAND_PICKUP' ? +advance.value : null,
                  },
               ],
            },
         })
      } else {
         toast.error('Invalid values!')
      }
   }

   return (
      <>
         <TunnelHeader
            title="Add Time Slot"
            right={{ action: save, title: inFlight ? 'Adding...' : 'Add' }}
            close={() => closeTunnel(2)}
         />
         <TunnelBody>
            <Text as="p">Enter time slot:</Text>
            <Spacer size="16px" />
            <Flex container>
               <Form.Group>
                  <Form.Label htmlFor="from" title="from">
                     From*
                  </Form.Label>
                  <Form.Time
                     id="from"
                     name="from"
                     onChange={e => setFrom({ ...from, value: e.target.value })}
                     onBlur={() => {
                        const { isValid, errors } = validator.time(from.value)
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
                     To*
                  </Form.Label>
                  <Form.Time
                     id="to"
                     name="to"
                     onChange={e => setTo({ ...to, value: e.target.value })}
                     onBlur={() => {
                        const { isValid, errors } = validator.time(to.value)
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
            {type.includes('PICKUP') && (
               <Form.Group>
                  <Form.Label htmlFor="advance" title="advance">
                     {`${
                        type.includes('ONDEMAND') ? 'Prep' : 'Lead'
                     } Time(minutes)*`}
                  </Form.Label>
                  <Form.Number
                     id="advance"
                     name="advance"
                     onChange={e =>
                        setAdvance({ ...advance, value: e.target.value })
                     }
                     onBlur={() => {
                        const { isValid, errors } = validator.minutes(
                           advance.value
                        )
                        setAdvance({
                           ...advance,
                           meta: {
                              isTouched: true,
                              isValid,
                              errors,
                           },
                        })
                     }}
                     value={advance.value}
                     placeholder="Enter minutes"
                     hasError={advance.meta.isTouched && !advance.meta.isValid}
                  />
                  {advance.meta.isTouched &&
                     !advance.meta.isValid &&
                     advance.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>
            )}
         </TunnelBody>
      </>
   )
}

export default TimeSlotTunnel
