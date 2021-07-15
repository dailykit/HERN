import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import ReactRRule from '../../../../../../../shared/components/ReactRRule'
import { toast } from 'react-toastify'
import { TextButton, Flex, Form, Spacer } from '@dailykit/ui'

import { CollectionBrands } from '../'

import { UPDATE_COLLECTION } from '../../../../../graphql'

import { logger } from '../../../../../../../shared/utils'
import { ErrorBoundary, Tooltip } from '../../../../../../../shared/components'
import validator from '../../../validators'

const Availability = ({ state }) => {
   const [rrule, setRrule] = React.useState(state.rrule)
   const [startTime, setStartTime] = React.useState({
      value: state.startTime,
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })
   const [endTime, setEndTime] = React.useState({
      value: state.endTime,
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })

   const save = () => {
      if (inFlight) return
      if (startTime.meta.isValid && endTime.meta.isValid) {
         updateCollection({
            variables: {
               id: state.id,
               set: {
                  rrule,
                  startTime: startTime.value,
                  endTime: endTime.value,
               },
            },
         })
      } else {
         toast.error('Invalid inputs!')
      }
   }

   const [updateCollection, { loading: inFlight }] = useMutation(
      UPDATE_COLLECTION,
      {
         onCompleted: () => {
            toast.success('Availability updated!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   return (
      <ErrorBoundary rootRoute="/apps/menu">
         <Flex container alignItems="start" justifyContent="space-between">
            <Flex>
               {/* <Flex container alignItems="start">
                  <Form.Group>
                     <Form.Label htmlFor="start" title="start">
                        <Flex container alignItems="center">
                           Start Time
                           <Tooltip identifier="collection_availability_start_time" />
                        </Flex>
                     </Form.Label>
                     <Form.Time
                        id="start"
                        name="start"
                        onChange={e =>
                           setStartTime({ ...startTime, value: e.target.value })
                        }
                        onBlur={() => {
                           const { isValid, errors } = validator.time(
                              startTime.value
                           )
                           setStartTime({
                              ...startTime,
                              meta: {
                                 isTouched: true,
                                 isValid,
                                 errors,
                              },
                           })
                        }}
                        value={startTime.value}
                        hasError={
                           startTime.meta.isTouched && !startTime.meta.isValid
                        }
                     />
                     {startTime.meta.isTouched &&
                        !startTime.meta.isValid &&
                        startTime.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Spacer xAxis size="16px" />
                  <Form.Group>
                     <Form.Label htmlFor="end" title="end">
                        <Flex container alignItems="center">
                           End Time
                           <Tooltip identifier="collection_availability_end_time" />
                        </Flex>
                     </Form.Label>
                     <Form.Time
                        id="end"
                        name="end"
                        onChange={e =>
                           setEndTime({ ...endTime, value: e.target.value })
                        }
                        value={endTime.value}
                        onBlur={() => {
                           const { isValid, errors } = validator.time(
                              endTime.value
                           )
                           setEndTime({
                              ...endTime,
                              meta: {
                                 isTouched: true,
                                 isValid,
                                 errors,
                              },
                           })
                        }}
                        hasError={
                           endTime.meta.isTouched && !endTime.meta.isValid
                        }
                     />
                     {endTime.meta.isTouched &&
                        !endTime.meta.isValid &&
                        endTime.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
               </Flex>
               <Spacer size="16px" /> */}
               <ReactRRule
                  value={rrule}
                  onChange={val => setRrule(val.psqlObject)}
               />
            </Flex>
            <TextButton type="solid" onClick={save}>
               {inFlight ? 'Saving...' : 'Save'}
            </TextButton>
         </Flex>
         <Spacer size="32px" />
         <CollectionBrands state={state} />
      </ErrorBoundary>
   )
}

export default Availability
