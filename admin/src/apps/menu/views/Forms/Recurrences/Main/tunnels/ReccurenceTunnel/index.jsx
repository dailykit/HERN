import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { ButtonGroup, ComboButton, Flex, Form, Spacer, Text, TextButton, TunnelHeader } from '@dailykit/ui'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import RRule, { Weekday } from 'rrule'
import { logger } from '../../../../../../../../shared/utils'
import { CREATE_RECURRENCE } from '../../../../../../graphql'
import { DaysButton, RecurrenceDays, TunnelBody } from '../styled'
import { PlusIcon } from '../../../../../../../../shared/assets/icons'

const ReccurenceTunnel = ({ closeTunnel }) => {
   const { type } = useParams()
   const [days, setDays] = React.useState([])
   const [daysButton, setDaysButton] = React.useState(false)
   const [packDays, setPackDays] = React.useState({
      daily: false,
      weekdays: false,
      weekends: false
   })
   // Mutation
   const [createRecurrence, { loading: inFlight }] = useMutation(
      CREATE_RECURRENCE,
      {
         onCompleted: () => {
            toast.success('Recurrence added!')
            closeTunnel(1)
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
      let rrule = ''
      if (packDays.daily) {
         rrule = new RRule({
            freq: RRule.DAILY,
         })
      }
      else if (packDays.weekdays) {
         rrule = new RRule({
            freq: RRule.WEEKLY,
            byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR]
         })
      }
      else if (packDays.weekends) {
         rrule = new RRule({
            freq: RRule.WEEKLY,
            byweekday: [RRule.SA, RRule.SU]
         })
      }
      else {
         rrule = new RRule({
            freq: RRule.WEEKLY,
            byweekday: days,
         })
      }
      createRecurrence({
         variables: {
            object: {
               rrule: rrule.toString(),
               type,
            },
         },
      })
   }

   const toggleDay = day => {
      const val = days.includes(day)
      if (val) {
         setDays(days.filter(el => el !== day))
      } else {
         setDays([...days, day])
      }
   }

   return (
      <>
         <TunnelHeader
            title="Add Reccurence"
            right={{ action: save, title: inFlight ? 'Adding...' : 'Add' }}
            close={() => closeTunnel(1)}
         />
         <TunnelBody>
            <Text as="title">Select days </Text>
            <Spacer size="16px" />
            <RecurrenceDays>
               <DaysButton
                  value={packDays.daily}
                  onClick={() => (setPackDays({
                     ...packDays,
                     daily: !packDays.daily,
                     weekdays: false,
                     weekends: false
                  }), setDaysButton(false))}
               >
                  <span>Everyday</span>
               </DaysButton>
               <DaysButton
                  value={packDays.weekdays}
                  onClick={() => (setPackDays({
                     ...packDays,
                     daily: false,
                     weekdays: !packDays.weekdays,
                     weekends: false
                  }), setDaysButton(false))}               >
                  <span>WeekDays</span>
               </DaysButton>
               <DaysButton
                  value={packDays.weekends}
                  onClick={() => (setPackDays({
                     ...packDays,
                     daily: false,
                     weekdays: false,
                     weekends: !packDays.weekends
                  }), setDaysButton(false))}                       >
                  <span>WeekEnds</span>
               </DaysButton>
            </RecurrenceDays>
            <Spacer size="16px" />
            {
               !daysButton && (
                  <ButtonGroup>
                     <ComboButton
                        type="ghost"
                        size="sm"
                        onClick={() => ((packDays.daily === false && packDays.weekdays === false && packDays.weekends === false)
                           ? setDaysButton(!daysButton) : alert("Unselect selected Days"))}
                     >
                        <PlusIcon color='#367BF5' /> Choose specific days
                     </ComboButton>
                  </ButtonGroup>
               )
            }
            {!packDays.daily && !packDays.weekends && !packDays.weekdays && daysButton
               && (
                  <>
                     <Text as="subtitle">Choose specific days</Text>
                     <Spacer size="8px" />
                     <Flex container>
                        <Form.Checkbox
                           name="MO"
                           value={days.includes(RRule.MO)}
                           onChange={() => toggleDay(RRule.MO)}
                           color={"367BF5"}
                        >
                           Monday
                        </Form.Checkbox>
                        <Spacer xAxis size="16px" />
                        <Form.Checkbox
                           name="TU"
                           value={days.includes(RRule.TU)}
                           onChange={() => toggleDay(RRule.TU)}
                        >
                           Tuesday
                        </Form.Checkbox>
                        <Spacer xAxis size="16px" />
                        <Form.Checkbox
                           name="WE"
                           value={days.includes(RRule.WE)}
                           onChange={() => toggleDay(RRule.WE)}
                        >
                           Wednesday
                        </Form.Checkbox>
                        <Spacer xAxis size="16px" />
                        <Form.Checkbox
                           name="TH"
                           value={days.includes(RRule.TH)}
                           onChange={() => toggleDay(RRule.TH)}
                        >
                           Thursday
                        </Form.Checkbox>
                        <Spacer xAxis size="16px" />
                        <Form.Checkbox
                           name="FR"
                           value={days.includes(RRule.FR)}
                           onChange={() => toggleDay(RRule.FR)}
                        >
                           Friday
                        </Form.Checkbox>
                        <Spacer xAxis size="16px" />
                        <Form.Checkbox
                           name="SA"
                           value={days.includes(RRule.SA)}
                           onChange={() => toggleDay(RRule.SA)}
                        >
                           Saturday
                        </Form.Checkbox>
                        <Spacer xAxis size="16px" />
                        <Form.Checkbox
                           name="SU"
                           value={days.includes(RRule.SU)}
                           onChange={() => toggleDay(RRule.SU)}
                        >
                           Sunday
                        </Form.Checkbox>
                     </Flex>
                  </>
               )}
         </TunnelBody>
      </>
   )
}

export default ReccurenceTunnel
