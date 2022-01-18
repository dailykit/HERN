import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import {
   ButtonGroup, Flex, Form, Spacer, IconButton,
   TextButton, TunnelHeader
} from '@dailykit/ui'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../shared/utils'
import { RecurrenceContext } from '../../../../../../context/recurrence'
import { CREATE_MILE_RANGES } from '../../../../../../graphql'
import validator from '../../../../validators'
import { InputHeading, InputsNotes, StyledGeoBoundary, TunnelBody } from '../styled'
import { Radio } from 'antd'
import { parseInt, zip } from 'lodash'
import { DeleteIcon } from '../../../../../../../../shared/assets/icons'


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

   // Zipcodes declarations
   const [zipcodes, setZipcodes] = React.useState({
      value: "",
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })
   const [initialZipcodes, setInitialZipcodes] = React.useState({
      value: "",
   })

   // goe boundary Co-ordinates
   const geoBoundaryInstance = {
      latitude: {
         value: '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      },
      longitude: {
         value: '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      }
   }
   const [geoBoundary, setGeoBoundary] = React.useState([
      geoBoundaryInstance,
      geoBoundaryInstance,
      geoBoundaryInstance
   ])
   const addField = () => {
      // console.log('added')
      if (geoBoundary.every(object => object.latitude.value.trim().length && object.longitude.value.trim().length)) {
         setGeoBoundary([
            ...geoBoundary,
            geoBoundaryInstance
         ])
      } else {
         toast.error("Mandatory Co-ordinates are empty!")
      }
   }
   const removeField = index => {
      const newGeoBoundary = geoBoundary
      if (newGeoBoundary.length > 3) {
         newGeoBoundary.splice(index, 1)
         setGeoBoundary([...newGeoBoundary])
      } else {
         toast.error("Geo-Boundary Co-ordinates should atleast be 3 !")
      }

   }
   const handleGeoBoundaryChange = (field, value, index) => {  //serving, value, i
      const newGeoBoundary = [...geoBoundary]
      console.log(newGeoBoundary)
      newGeoBoundary[index] = {
         ...newGeoBoundary[index],
         [field]: {
            ...newGeoBoundary[index][field],
            value,
         },
      }
      setGeoBoundary([...newGeoBoundary])
   }
   const handleGeoBoundaryFocus = (field, index) => {
      const newGeoBoundary = [...geoBoundary]
      newGeoBoundary[index] = {
         ...newGeoBoundary[index],
         [field]: {
            ...newGeoBoundary[index][field],
            meta: {
               isTouched: true,
               isValid: true,
               errors: [],
            },
         },
      }
      setGeoBoundary([...newGeoBoundary])
      console.log(newGeoBoundary)
   }
   const validate = (field, index) => {
      const { isValid, errors } = validator[field](geoBoundary[index][field].value)
      const newGeoBoundary = geoBoundary
      newGeoBoundary[index] = {
         ...geoBoundary[index],
         [field]: {
            ...geoBoundary[index][field],
            meta: {
               isTouched: false,
               isValid,
               errors,
            },
         },
      }
      setGeoBoundary([...newGeoBoundary])
   }
   const geoBoundaryNotMandatory = geoBoundary.every(object =>     //checking every co-ordinate must be empty or having string with 0 length
      !object.latitude.value.trim().length && !object.longitude.value.trim().length)

   const geoBoundaryValidation = geoBoundary.every(object =>
      object.latitude.value.trim().length && object.longitude.value.trim().length)

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
   // console.log("zipcodes", initialZipcodes, zipcodes)
   // console.log("geoBoundary", geoBoundary);
   // Handlers
   const save = () => {
      console.log({ geoBoundaryNotMandatory });
      if (inFlight) return
      if (!from.value || !to.value || !time.value) {
         return toast.error('Invalid values!')
      }
      if (from.meta.isValid && to.meta.isValid && time.meta.isValid) {
         if (geoBoundaryValidation) {
            const coordinates = geoBoundary.map(each => ({
               latitude: parseInt(each.latitude.value),
               longitude: parseInt(each.longitude.value)
            }))
            console.log("coordinate", coordinates);
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
                        distanceType: valueDistanceType,
                        zipcodes: zipcodes.value ? { zipcodes: zipcodes.value } : null,
                        geoBoundary: { geoBoundaries: coordinates }
                     },
                  ],
               },
            })
         }
         else if (geoBoundaryNotMandatory) {
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
                        distanceType: valueDistanceType,
                        zipcodes: zipcodes.value ? { zipcodes: zipcodes.value } : null,
                     },
                  ],
               },
            })
         }
         else {
            toast.error("Empty Geo-cordinates or Fill atleast 3 co-ordinates")
         }
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
            <InputHeading title='Time require for preparation'>{type.includes('PREORDER')
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

            <InputHeading title='Distance between brand to destination for delivery' >Miles Range*</InputHeading>
            <Spacer size="4px" />
            <Flex container>
               <Form.Group>
                  <Form.Label htmlFor="from" title="from">
                     From
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
               <Spacer xAxis size="4em" />
               <Form.Group>
                  <Form.Label htmlFor="to" title="to">
                     To
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

            <InputHeading title='Distance type form brand to destination' >Distance Type</InputHeading>
            <Spacer size="4px" />
            <Radio.Group onChange={onChangeDistanceType} value={valueDistanceType}>
               <Radio value={'aerial'}>Aerial</Radio>
               <Radio value={'drivable'}>Drivable</Radio>
            </Radio.Group>
            <Spacer size="16px" />

            <InputHeading title="Enter Zipcodes for this mile range" >Zipcodes</InputHeading>
            <Spacer size="4px" />
            <Form.Group>
               <Form.Text
                  id="zipcodes"
                  name="zipcodes"
                  value={initialZipcodes.value}
                  placeholder="Enter zipcodes"
                  onChange={e => setInitialZipcodes({
                     ...initialZipcodes,
                     value: e.target.value
                  })}
                  onBlur={() => {
                     const { isValid, errors, zipCodeValue } = validator.zipCode(initialZipcodes.value)
                     setZipcodes({
                        ...zipcodes,
                        value: zipCodeValue,
                        meta: {
                           isTouched: true,
                           isValid,
                           errors,
                        },
                     })
                  }}
                  hasError={zipcodes.meta.isTouched && !zipcodes.meta.isValid}
               />
               {zipcodes.meta.isTouched &&
                  !zipcodes.meta.isValid &&
                  zipcodes.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <InputsNotes>
               Enter comma to separate zipcodes
            </InputsNotes>
            <Spacer size="16px" />

            <InputHeading title='Geo-Boundary Co-ordinates for mapping area' >Geo-Boundary</InputHeading>
            {geoBoundary.map((eachGeoBoundary, i) => (
               <>
                  <Spacer size="4px" />
                  <StyledGeoBoundary>
                     <Form.Group>
                        <Form.Label htmlFor={`latitude-${i}`} title={`Latitude Co-ordinate ${i + 1}`}>
                           Latitude
                        </Form.Label>
                        <Form.Number
                           id={`latitude-${i}`}
                           name={`latitude-${i}`}
                           value={eachGeoBoundary.latitude.value}
                           onChange={e => handleGeoBoundaryChange(
                              "latitude",
                              e.target.value,
                              i
                           )}
                           onFocus={() => {
                              handleGeoBoundaryFocus('latitude', i)
                           }}
                           onBlur={() => validate('latitude', i)}
                           placeholder="Enter Latitude"
                           hasError={
                              eachGeoBoundary.latitude.meta.isTouched &&
                              !eachGeoBoundary.latitude.meta.isValid
                           }
                        />
                        {!eachGeoBoundary.latitude.meta.isTouched &&
                           !eachGeoBoundary.latitude.meta.isValid &&
                           eachGeoBoundary.latitude.meta.errors.map(
                              (error, index) => (
                                 <Form.Error key={index}>
                                    {error}
                                 </Form.Error>
                              )
                           )}
                     </Form.Group>
                     <Spacer size="4em" xAxis />
                     <Form.Group>
                        <Form.Label htmlFor={`longitude-${i}`} title={`Longitude Co-ordinate ${i + 1}`}>
                           Longitude
                        </Form.Label>
                        <Form.Number
                           id={`longitude-${i}`}
                           name={`longitude-${i}`}
                           value={eachGeoBoundary.longitude.value}
                           onChange={e => handleGeoBoundaryChange(
                              "longitude",
                              e.target.value,
                              i
                           )}
                           onFocus={() => {
                              handleGeoBoundaryFocus('longitude', i)
                           }}
                           onBlur={() => validate('longitude', i)}
                           placeholder="Enter Longitude"
                           hasError={
                              eachGeoBoundary.longitude.meta.isTouched &&
                              !eachGeoBoundary.longitude.meta.isValid
                           }
                        />
                        {!eachGeoBoundary.longitude.meta.isTouched &&
                           !eachGeoBoundary.longitude.meta.isValid &&
                           eachGeoBoundary.longitude.meta.errors.map(
                              (error, index) => (
                                 <Form.Error key={index}>
                                    {error}
                                 </Form.Error>
                              )
                           )}
                     </Form.Group>
                     <IconButton
                        type="ghost"
                        title="Delete this Co-ordinate"
                        onClick={() => removeField(i)}
                     >
                        <DeleteIcon color="#FF5A52" />
                     </IconButton>
                  </StyledGeoBoundary>
               </>

            ))}
            <Spacer size="16px" />
            <ButtonGroup>
               <TextButton
                  title="Add Extra Co-ordinate"
                  type='ghost'
                  size='sm'
                  onClick={addField}>
                  + Add More
               </TextButton>
            </ButtonGroup>

         </TunnelBody>
      </>
   )
}

export default MileRangeTunnel

