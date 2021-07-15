import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { Flex, Form, Spacer, Text, TunnelHeader } from '@dailykit/ui'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import RRule from 'rrule'
import { logger } from '../../../../../../../../shared/utils'
import { CREATE_RECURRENCE } from '../../../../../../graphql'
import { TunnelBody } from '../styled'

const ReccurenceTunnel = ({ closeTunnel }) => {
   const { type } = useParams()
   const [daily, setDaily] = React.useState(false)
   const [days, setDays] = React.useState([])

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
      if (daily) {
         rrule = new RRule({
            freq: RRule.DAILY,
         })
      } else {
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
            <Text as="p">Select the days: </Text>
            <Spacer size="16px" />
            <Form.Checkbox
               name="daily"
               value={daily}
               onChange={() => setDaily(!daily)}
            >
               Daily
            </Form.Checkbox>
            <Spacer size="16px" />
            {!daily && (
               <>
                  <Text as="subtitle">Or select specific days:</Text>
                  <Spacer size="8px" />
                  <Flex container>
                     <Form.Checkbox
                        name="MO"
                        value={days.includes(RRule.MO)}
                        onChange={() => toggleDay(RRule.MO)}
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
