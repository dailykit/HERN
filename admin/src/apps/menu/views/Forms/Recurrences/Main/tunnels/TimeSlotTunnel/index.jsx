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
   const fulfillmentType = ['PICKUP','DINEIN']

   const [timeSlotTunnel, setTimeSlotTunnel] = React.useState([{
      from: {
         value: '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      },
      to: {
         value: '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      },
      rangeChoice: {
         morning: false,
         noon: false,
         evening: false,
         night: false
      },
      timeButton: false,
   }])
   const [advance, setAdvance] = React.useState({
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })
   const [slotInterval, setSlotInterval] = React.useState({
      value: '00:15',
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

   // OnClick
   const onClick = (e, i) => {
      const updatedTunnel = timeSlotTunnel
      const { id } = e.target
      if (id === `morning-${i}`) {
         updatedTunnel[i].from.value = moment("09:00:00", "HH:mm:ss").format("HH:mm:ss")
         updatedTunnel[i].to.value = moment("12:00:00", "HH:mm:ss").format("HH:mm:ss")
         updatedTunnel[i].rangeChoice.morning = !updatedTunnel[i].rangeChoice.morning
         updatedTunnel[i].rangeChoice.noon = false
         updatedTunnel[i].rangeChoice.evening = false
         updatedTunnel[i].rangeChoice.night = false

         updatedTunnel[i].timeButton = false

         setTimeSlotTunnel([...updatedTunnel])
      }
      if (id === `noon-${i}`) {
         updatedTunnel[i].from.value = moment("12:00:01", "HH:mm:ss").format("HH:mm:ss")
         updatedTunnel[i].to.value = moment("16:00:00", "HH:mm:ss").format("HH:mm:ss")
         updatedTunnel[i].rangeChoice.morning = false
         updatedTunnel[i].rangeChoice.noon = !updatedTunnel[i].rangeChoice.noon
         updatedTunnel[i].rangeChoice.evening = false
         updatedTunnel[i].rangeChoice.night = false
         updatedTunnel[i].timeButton = false

         setTimeSlotTunnel([...updatedTunnel])
      }
      if (id === `evening-${i}`) {
         updatedTunnel[i].from.value = moment("16:00:01", "HH:mm:ss").format("HH:mm:ss")
         updatedTunnel[i].to.value = moment("19:00:00", "HH:mm:ss").format("HH:mm:ss")
         updatedTunnel[i].rangeChoice.morning = false
         updatedTunnel[i].rangeChoice.noon = false
         updatedTunnel[i].rangeChoice.evening = !updatedTunnel[i].rangeChoice.evening
         updatedTunnel[i].rangeChoice.night = false
         updatedTunnel[i].timeButton = false

         setTimeSlotTunnel([...updatedTunnel])
      }
      if (id === `night-${i}`) {
         updatedTunnel[i].from.value = moment("19:00:01", "HH:mm:ss").format("HH:mm:ss")
         updatedTunnel[i].to.value = moment("22:00:00", "HH:mm:ss").format("HH:mm:ss")
         updatedTunnel[i].rangeChoice.morning = false
         updatedTunnel[i].rangeChoice.noon = false
         updatedTunnel[i].rangeChoice.evening = false
         updatedTunnel[i].rangeChoice.night = !updatedTunnel[i].rangeChoice.night
         updatedTunnel[i].timeButton = false

         setTimeSlotTunnel([...updatedTunnel])
      }
      if (id === `timeButton-${i}`) {
         if (!updatedTunnel[i].rangeChoice.morning &&
            !updatedTunnel[i].rangeChoice.noon &&
            !updatedTunnel[i].rangeChoice.evening &&
            !updatedTunnel[i].rangeChoice.night) {
            updatedTunnel[i].timeButton = !updatedTunnel[i].timeButton
            setTimeSlotTunnel([...updatedTunnel])
         } else {
            alert(`Unselect Selected ${i + 1}th Time Range`)
         }
      }
   }

   // OnChange
   const onChange = (e, i) => {
      const updatedTunnel = timeSlotTunnel
      const { name, value } = e.target
      if (name === `from-${i}`) {
         const updatedFrom = updatedTunnel[i].from
         updatedFrom.value = value
         setTimeSlotTunnel([...updatedTunnel])
      }
      if (name === `to-${i}`) {
         const updatedTo = updatedTunnel[i].to
         updatedTo.value = value
         setTimeSlotTunnel([...updatedTunnel])
      }
   }
   console.log({ timeSlotTunnel })

   //OnBlur
   const onBlur = (e, i) => {
      const { name, value } = e.target
      const updatedTunnel = timeSlotTunnel
      if (name === `from-${i}`) {
         const fromValue = updatedTunnel[i].from.value
         updatedTunnel[i].from.meta.isTouched = true
         updatedTunnel[i].from.meta.errors =
            validator.time(fromValue).errors
         updatedTunnel[i].from.meta.isValid =
            validator.time(fromValue).isValid
         setTimeSlotTunnel([...updatedTunnel])
      }
      if (name === `to-${i}`) {
         const toValue = updatedTunnel[i].to.value
         updatedTunnel[i].to.meta.isTouched = true
         updatedTunnel[i].to.meta.errors =
            validator.time(toValue).errors
         updatedTunnel[i].to.meta.isValid =
            validator.time(toValue).isValid
         setTimeSlotTunnel([...updatedTunnel])
      }
   }

   // Handlers
   const save = () => {
      if (inFlight) return
      // if (
      //    !timeSlotTunnel.from.value ||
      //    !timeSlotTunnel.to.value ||
      //    (!advance.value && type.includes('PICKUP'))
      // ) {
      //    return toast.error('Invalid values!')
      // }
      let timeSlotTunnelValid
      timeSlotTunnel.map(each => {
         timeSlotTunnelValid = each.from.meta.isValid && each.to.meta.isValid
         return timeSlotTunnelValid
      })
      console.log({ timeSlotTunnelValid })
      // if (advance.meta.isValid && timeSlotTunnel.from.meta.isValid && timeSlotTunnel.to.meta.isValid) 
      if (timeSlotTunnelValid) {
         const objects = timeSlotTunnel.map((each) => ({
            recurrenceId: recurrenceState.recurrenceId,
            from: each.from.value,
            to: each.to.value,
            pickUpLeadTime:
               type === 'PREORDER_PICKUP' ? +advance.value : null,
            pickUpPrepTime:
               type === 'ONDEMAND_PICKUP' ? +advance.value : null,
            dineInLeadTime:
               type === 'PREORDER_DINEIN' ? +advance.value : null,
            dineInPrepTime:
               type === 'ONDEMAND_DINEIN' ? +advance.value : null,
            slotInterval: slotInterval?.value || 15,
         })
         )
         createTimeSlots({
            variables: {
               objects,
            },
         })
      }
      else {
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
            <Text as="title">Select Time</Text>
            <Spacer size="16px" />
            {
               timeSlotTunnel.map(((tunnelSlot, i) => (
                  <>
                     <RecurrenceDays style={{ columnGap: "1em" }}>
                        <TimeButton
                           id={`morning-${i}`}
                           value={tunnelSlot.rangeChoice.morning}
                           onClick={e => onClick(e, i)}
                        >
                           Morning <br />(09:00AM-12:00AM)
                        </TimeButton>
                        <TimeButton
                           id={`noon-${i}`}
                           value={tunnelSlot.rangeChoice.noon}
                           onClick={e => onClick(e, i)}
                        >
                           Noon <br />(12:00PM-04:00PM)
                        </TimeButton>
                        <TimeButton
                           id={`evening-${i}`}
                           value={tunnelSlot.rangeChoice.evening}
                           onClick={e => onClick(e, i)}
                        >
                           Evening<br /> (04:00PM-07:00PM)
                        </TimeButton>
                        <TimeButton
                           id={`night-${i}`}
                           value={tunnelSlot.rangeChoice.night}
                           onClick={e => onClick(e, i)}
                        >
                           Night<br /> (07:00PM-10:00PM)
                        </TimeButton>
                     </RecurrenceDays>
                     <Spacer size="16px" />
                     {
                        !tunnelSlot.timeButton && (
                           <ButtonGroup>
                              <ComboButton
                                 id={`timeButton-${i}`}
                                 type="ghost"
                                 size="sm"
                                 onClick={e => onClick(e, i)}
                              >
                                 <PlusIcon color='#367BF5' /> Choose specific time slot
                              </ComboButton>
                           </ButtonGroup>
                        )
                     }
                     {
                        !tunnelSlot.rangeChoice.morning &&
                        !tunnelSlot.rangeChoice.noon &&
                        !tunnelSlot.rangeChoice.evening &&
                        !tunnelSlot.rangeChoice.night &&
                        tunnelSlot.timeButton && (
                           <>
                              <Flex container>
                                 <Form.Group>
                                    <Form.Label htmlFor={`from-${i}`} title={`From ${i + 1}`}>
                                       From*
                                    </Form.Label>
                                    <Form.Time
                                       id={`from-${i}`}
                                       name={`from-${i}`}
                                       onChange={e => onChange(e, i)}
                                       onBlur={e => onBlur(e, i, `from-${i}`)}
                                       value={tunnelSlot.from.value}
                                       hasError={tunnelSlot.from.meta.isTouched && !tunnelSlot.from.meta.isValid}
                                    />
                                    {tunnelSlot.from.meta.isTouched &&
                                       !tunnelSlot.from.meta.isValid &&
                                       tunnelSlot.from.meta.errors.map((error, index) => (
                                          <Form.Error key={index}>{error}</Form.Error>
                                       ))}
                                 </Form.Group>
                                 <Spacer xAxis size="16px" />
                                 <Form.Group>
                                    <Form.Label htmlFor={`to-${i}`} title={`To ${i + 1}`}>
                                       To*
                                    </Form.Label>
                                    <Form.Time
                                       id={`to-${i}`}
                                       name={`to-${i}`}
                                       onChange={e => onChange(e, i)}
                                       onBlur={e => onBlur(e, i, `to-${i}`)}
                                       value={tunnelSlot.to.value}
                                       hasError={tunnelSlot.to.meta.isTouched && !tunnelSlot.to.meta.isValid}
                                    />
                                    {tunnelSlot.to.meta.isTouched &&
                                       !tunnelSlot.to.meta.isValid &&
                                       tunnelSlot.to.meta.errors.map((error, index) => (
                                          <Form.Error key={index}>{error}</Form.Error>
                                       ))}
                                 </Form.Group>
                              </Flex>
                              <Spacer size="16px" />
                              {fulfillmentType.some(el => type.includes(el)) && (
                                 <Form.Group>
                                    <Form.Label htmlFor={`advance-${i}`} title={`Advance ${i}`}>
                                       {`${type.includes('ONDEMAND') ? 'Prep' : 'Lead'
                                          } Time(minutes)*`}
                                    </Form.Label>
                                    <Form.Number
                                       id={`advance-${i}`}
                                       name={`advance-${i}`}
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
                              <Spacer size="16px" />
                                 <Form.Group>
                                    <Form.Label htmlFor={`slotInterval-${i}`} title={`SlotInterval ${i}`}>
                                       Slot Interval (HH:MM)
                                    </Form.Label>
                                    <Form.Time
                                       id={`slotInterval-${i}`}
                                       name={`slotInterval-${i}`}
                                       onChange={e =>
                                          setSlotInterval({ ...slotInterval, value: e.target.value })
                                       }
                                       onBlur={() => {
                                          const { isValid, errors } = validator.time(
                                             slotInterval.value
                                          )
                                          setSlotInterval({
                                             ...slotInterval,
                                             meta: {
                                                isTouched: true,
                                                isValid,
                                                errors,
                                             },
                                          })
                                       }}
                                       value={slotInterval.value}
                                       // placeholder="Enter minutes"
                                       hasError={slotInterval.meta.isTouched && !slotInterval.meta.isValid}
                                    />
                                    {slotInterval.meta.isTouched &&
                                       !slotInterval.meta.isValid &&
                                       slotInterval.meta.errors.map((error, index) => (
                                          <Form.Error key={index}>{error}</Form.Error>
                                       ))}
                                 </Form.Group>
                              
                           </>

                        )
                     }
                  </>
               )))
            }
            <Spacer size="16px" />
            <ButtonGroup>
               <ComboButton
                  type="ghost"
                  size="sm"
                  onClick={() =>
                     setTimeSlotTunnel([
                        ...timeSlotTunnel,
                        {
                           from: {
                              value: "",
                              meta: {
                                 isTouched: false,
                                 isValid: true,
                                 errors: [],
                              }
                           },
                           to: {
                              value: '',
                              meta: {
                                 isTouched: false,
                                 isValid: true,
                                 errors: [],
                              },
                           },
                           rangeChoice: {
                              morning: false,
                              noon: false,
                              evening: false,
                              night: false
                           },
                           timeButton: false
                        }
                     ])
                  }
               >
                  <PlusIcon color='#367BF5' /> Add more Time Slot
               </ComboButton>
            </ButtonGroup>
         </TunnelBody>
      </>
   )
}

export default TimeSlotTunnel
