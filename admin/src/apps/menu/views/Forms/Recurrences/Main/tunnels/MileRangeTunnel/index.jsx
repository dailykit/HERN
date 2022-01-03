import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { Flex, Form, Spacer, Text, TunnelHeader } from '@dailykit/ui'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../shared/utils'
import { RecurrenceContext } from '../../../../../../context/recurrence'
import { CREATE_MILE_RANGES } from '../../../../../../graphql'
import validator from '../../../../validators'
import { InputHeading, InputsNotes, TunnelBody } from '../styled'
import { Radio } from 'antd'


const MileRangeTunnel = ({ closeTunnel }) => {
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
   const [time, setTime] = React.useState({
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })
   const [isExcluded, setIsExcluded] = React.useState(false)

   // Distance type declearation
   const [valueDistanceType, setValueDistanceType] = React.useState('aerial');
   const onChangeDistanceType = e => {
      console.log('radio checked', e.target.value)
      setValueDistanceType(e.target.value)
   }
   // Mutation
   const [createMileRanges, { loading: inFlight }] = useMutation(
      CREATE_MILE_RANGES,
      {
         onCompleted: () => {
            toast.success('Mile range added!')
            closeTunnel(3)
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
      if (!from.value || !to.value || !time.value) {
         return toast.error('Invalid values!')
      }
      if (from.meta.isValid && to.meta.isValid && time.meta.isValid) {
         createMileRanges({
            variables: {
               objects: [
                  {
                     timeSlotId: recurrenceState.timeSlotId,
                     from: +from.value,
                     to: +to.value,
                     prepTime: type.includes('ONDEMAND') ? +time.value : null,
                     leadTime: type.includes('PREORDER') ? +time.value : null,
                     isExcluded: isExcluded,
                     distanceType: valueDistanceType
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
            title="Add Mile Range"
            right={{ action: save, title: inFlight ? 'Adding...' : 'Add' }}
            close={() => closeTunnel(3)}
         />
         <TunnelBody>
            <Form.Group>
               <Form.Toggle
                  name={`isExcluded-${recurrenceState.timeSlotId}`}
                  value={isExcluded}
                  onChange={() => setIsExcluded(!isExcluded)
                  }
               >
                  Exclude
               </Form.Toggle>
            </Form.Group>
            <InputsNotes>
               This will exclude all the things you have mentioned below
            </InputsNotes>
            <Spacer size="16px" />
            {/* <Text as="p">
               Enter Mile Range and{' '}
               {type.includes('PREORDER') ? 'Lead' : 'Prep'} Time:
            </Text>
            <Spacer size="16px" /> */}
            <InputHeading>{type.includes('PREORDER')
               ? 'Lead Time(minutes)*'
               : 'Prep Time(minutes)*'}</InputHeading>
            <Spacer size="4px" />
            <Form.Group>
               <Form.Label htmlFor="time" title="time">
                  Time
               </Form.Label>
               <Form.Number
                  id="time"
                  name="time"
                  onChange={e => setTime({ ...time, value: e.target.value })}
                  onBlur={() => {
                     const { isValid, errors } = validator.minutes(time.value)
                     setTime({
                        ...time,
                        meta: {
                           isTouched: true,
                           isValid,
                           errors,
                        },
                     })
                  }}
                  value={time.value}
                  placeholder="Enter minutes"
                  hasError={time.meta.isTouched && !time.meta.isValid}
                  style={{ width: "60%" }}
               />
               {time.meta.isTouched &&
                  !time.meta.isValid &&
                  time.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer size="16px" />

            <InputHeading>Miles Range</InputHeading>
            <Spacer size="4px" />
            <Flex container>
               <Form.Group>
                  <Form.Label htmlFor="from" title="from">
                     From*
                  </Form.Label>
                  <Form.Number
                     id="from"
                     name="from"
                     onChange={e => setFrom({ ...from, value: e.target.value })}
                     onBlur={() => {
                        const { isValid, errors } = validator.distance(
                           from.value
                        )
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
                     placeholder="Enter miles"
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
                  <Form.Number
                     id="to"
                     name="to"
                     onChange={e => setTo({ ...to, value: e.target.value })}
                     onBlur={() => {
                        const { isValid, errors } = validator.distance(to.value)
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
                     placeholder="Enter miles"
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

            <InputHeading>Distance Type</InputHeading>
            <Spacer size="4px" />
            <Radio.Group onChange={onChangeDistanceType} value={valueDistanceType}>
               <Radio value={'aerial'}>Aerial</Radio>
               <Radio value={'drivable'}>Drivable</Radio>
            </Radio.Group>
            <Spacer size="16px" />

         </TunnelBody>
      </>
   )
}

export default MileRangeTunnel

