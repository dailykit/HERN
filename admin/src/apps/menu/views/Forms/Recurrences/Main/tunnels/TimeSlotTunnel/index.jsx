import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { ButtonGroup, ComboButton, Flex, Form, Spacer, Text, TunnelHeader } from '@dailykit/ui'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../shared/utils'
import { RecurrenceContext } from '../../../../../../context/recurrence'
import { CREATE_TIME_SLOTS } from '../../../../../../graphql'
import validator from '../../../../validators'
import { DaysButton, RecurrenceDays, TimeButton, TunnelBody } from '../styled'
import { PlusIcon } from '../../../../../../../../shared/assets/icons'
import { flatMap } from 'lodash'
import moment from 'moment'

const TimeSlotTunnel = ({ closeTunnel }) => {
   const { recurrenceState } = React.useContext(RecurrenceContext)
   const { type } = useParams()
   const [timeButton, setTimeButton] = React.useState(false)
   const [time, setTime] = React.useState({
      morning: false,
      noon: false,
      evening: false,
      night: false
   })

   const [from, setFrom] = React.useState({
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })
   const [timeSlot, setTimeSlot] = React.useState([{
      from: {
         value: '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
         to: {
            value: '',
            meta: {
               isTouched: false,
               isValid: true,
               errors: [],
            },
         }
      },
   }])
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

      if (time.morning) {
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
      }
      else if (advance.meta.isValid && from.meta.isValid && to.meta.isValid) {
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
      }
      else {
         toast.error('Invalid values!')
      }
   }
   //moment("1234", "hmm").format("HH:mm") === "12:34"

   return (
      <>
         <TunnelHeader
            title="Add Time Slot"
            right={{ action: save, title: inFlight ? 'Adding...' : 'Add' }}
            close={() => closeTunnel(2)}
         />
         <TunnelBody>
            <Text as="title">Select Time</Text>
            <Spacer size="16px" />
            <RecurrenceDays style={{ columnGap: "1em" }}>
               <TimeButton
                  value={time.morning}
                  onClick={() => (setTime({
                     ...time,
                     morning: !time.morning,
                     noon: false,
                     evening: false,
                     night: false
                  }), setTimeButton(false),
                     setFrom({
                        ...from,
                        value: moment("09:00:00", "HH:mm:ss").format("HH:mm:ss")
                     }),
                     setTo({
                        ...to,
                        value: moment("12:00:00", "HH:mm:ss").format("HH:mm:ss")
                     }))
                  }
               >
                  <span><div>Morning</div><div>(09:00AM-12:00AM)</div></span>
               </TimeButton>
               <TimeButton
                  value={time.noon}
                  onClick={() => (setTime({
                     ...time,
                     morning: false,
                     noon: !time.noon,
                     evening: false,
                     night: false
                  }), setTimeButton(false),
                     setFrom({
                        ...from,
                        value: moment("12:00:01", "HH:mm:ss").format("HH:mm:ss")
                     }),
                     setTo({
                        ...to,
                        value: moment("16:00:00", "HH:mm:ss").format("HH:mm:ss")
                     }))
                  }
               >
                  <span><div>Noon</div><div>(12:00PM-04:00PM)</div></span>
               </TimeButton>
               <TimeButton
                  value={time.evening}
                  onClick={() => (setTime({
                     ...time,
                     morning: false,
                     noon: false,
                     evening: !time.evening,
                     night: false
                  }), setTimeButton(false),
                     setFrom({
                        ...from,
                        value: moment("16:00:01", "HH:mm:ss").format("HH:mm:ss")
                     }),
                     setTo({
                        ...to,
                        value: moment("19:00:00", "HH:mm:ss").format("HH:mm:ss")
                     }))
                  }
               >
                  <span><div>Evening</div><div>(04:00PM-07:00PM)</div></span>
               </TimeButton>
               <TimeButton
                  value={time.night}
                  onClick={() => (setTime({
                     ...time,
                     morning: false,
                     noon: false,
                     evening: false,
                     night: !time.night
                  }), setTimeButton(false),
                     setFrom({
                        ...from,
                        value: moment("19:00:01", "HH:mm:ss").format("HH:mm:ss")
                     }),
                     setTo({
                        ...to,
                        value: moment("22:00:00", "HH:mm:ss").format("HH:mm:ss")
                     }))
                  }
               >
                  <span><div>Night</div><div>(07:00PM-10:00PM)</div></span>
               </TimeButton>
            </RecurrenceDays>
            <Spacer size="16px" />
            {
               !timeButton && (
                  <ButtonGroup>
                     <ComboButton
                        type="ghost"
                        size="sm"
                        onClick={() => (
                           (time.morning === false && time.noon === false && time.evening === false && time.night === false)
                              ? setTimeButton(!timeButton) : alert("Unselect Selected Time"))}
                     >
                        <PlusIcon color='#367BF5' /> Choose specific time slot
                     </ComboButton>
                  </ButtonGroup>
               )
            }
            {
               !time.morning && !time.noon && !time.evening && !time.night && timeButton && (
                  <>
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
                              {`${type.includes('ONDEMAND') ? 'Prep' : 'Lead'
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
                  </>

               )
            }
         </TunnelBody>
      </>
   )
}

export default TimeSlotTunnel
