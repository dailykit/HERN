import { useMutation } from '@apollo/react-hooks'
import { Flex, Form, Spacer } from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../shared/utils'
import { LOCATIONS } from '../../../../../graphql'
import validatorFunc from '../../../../validator'
import { StyledContainer, StyledGroup, StyledInputText } from './styled'

export const Address = ({ state, locationId }) => {
   console.log('locationData', state)

   const [locationDetails, setLocationDetails] = React.useState({
      line1: {
         value: state.locationAddress?.line1 || '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      },
      line2: {
         value: state.locationAddress?.line2 || '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      },
      city: {
         value: state.city || '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      },
      zipcode: {
         value: state.zipcode || '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      },
      state: {
         value: state.state || '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      },
      country: {
         value: state.country || '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      },
   })
   console.log('locationDetails', locationDetails)

   const [updateLocation] = useMutation(LOCATIONS.UPDATE, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log('error', error)
         logger(error)
      },
   })
   const onChange = (field, value) => {
      setLocationDetails({
         ...locationDetails,
         [field]: {
            ...locationDetails[field],
            value,
         },
      })
   }
   const onBlur = field => {
      switch (field) {
         case 'line1': {
            const { isValid, errors } = validatorFunc.address(
               locationDetails[field].value
            )
            if (isValid) {
               updateLocation({
                  variables: {
                     id: locationId,
                     _set: {
                        locationAddress: {
                           line1: locationDetails[field].value,
                           line2: locationDetails.line2.value,
                        },
                     },
                  },
               })
            }
            setLocationDetails({
               ...locationDetails,
               [field]: {
                  ...locationDetails[field],
                  meta: {
                     isTouched: true,
                     isValid,
                     errors,
                  },
               },
            })
            return
         }
         case 'line2': {
            const { isValid, errors } = validatorFunc.address(
               locationDetails[field].value
            )
            if (isValid) {
               updateLocation({
                  variables: {
                     id: locationId,
                     _set: {
                        locationAddress: {
                           line1: locationDetails.line1.value,
                           line2: locationDetails[field].value,
                        },
                     },
                  },
               })
            }
            setLocationDetails({
               ...locationDetails,
               [field]: {
                  ...locationDetails[field],
                  meta: {
                     isTouched: true,
                     isValid,
                     errors,
                  },
               },
            })
            return
         }
         case 'city': {
            const { isValid, errors } = validatorFunc.address(
               locationDetails[field].value
            )
            if (isValid) {
               updateLocation({
                  variables: {
                     id: locationId,
                     _set: {
                        city: locationDetails[field].value,
                     },
                  },
               })
            }
            setLocationDetails({
               ...locationDetails,
               [field]: {
                  ...locationDetails[field],
                  meta: {
                     isTouched: true,
                     isValid,
                     errors,
                  },
               },
            })
            return
         }
         case 'zipcode': {
            const { isValid, errors } = validatorFunc.address(
               locationDetails[field].value
            )
            if (isValid) {
               updateLocation({
                  variables: {
                     id: locationId,
                     _set: {
                        zipcode: locationDetails[field].value,
                     },
                  },
               })
            }
            setLocationDetails({
               ...locationDetails,
               [field]: {
                  ...locationDetails[field],
                  meta: {
                     isTouched: true,
                     isValid,
                     errors,
                  },
               },
            })
            return
         }
         case 'state': {
            const { isValid, errors } = validatorFunc.address(
               locationDetails[field].value
            )
            if (isValid) {
               updateLocation({
                  variables: {
                     id: locationId,
                     _set: {
                        state: locationDetails[field].value,
                     },
                  },
               })
            }
            setLocationDetails({
               ...locationDetails,
               [field]: {
                  ...locationDetails[field],
                  meta: {
                     isTouched: true,
                     isValid,
                     errors,
                  },
               },
            })
            return
         }
         case 'country': {
            const { isValid, errors } = validatorFunc.address(
               locationDetails[field].value
            )
            if (isValid) {
               updateLocation({
                  variables: {
                     id: locationId,
                     _set: {
                        country: locationDetails[field].value,
                     },
                  },
               })
            }
            setLocationDetails({
               ...locationDetails,
               [field]: {
                  ...locationDetails[field],
                  meta: {
                     isTouched: true,
                     isValid,
                     errors,
                  },
               },
            })
            return
         }
      }
   }
   return (
      <>
         <StyledContainer>
            <Spacer yaxis size="24px" />
            <Form.Group>
               <StyledGroup>
                  <Form.Label
                     htmlFor={`locationLine1`}
                     title={`Address Line 1`}
                  >
                     <StyledInputText>Address Line 1 :</StyledInputText>
                  </Form.Label>
                  <Form.Text
                     id={`locationLine1`}
                     name={`locationLine1`}
                     value={locationDetails.line1.value}
                     placeholder="Enter Address"
                     onChange={e => onChange('line1', e.target.value)}
                     onBlur={() => onBlur('line1')}
                     hasError={
                        !locationDetails.line1.meta.isValid &&
                        locationDetails.line1.meta.isTouched
                     }
                  />
                  {locationDetails.line1.meta.isTouched &&
                     !locationDetails.line1.meta.isValid &&
                     locationDetails.line1.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </StyledGroup>
            </Form.Group>
            <Spacer yaxis size="24px" />
            <Form.Group>
               <StyledGroup>
                  <Form.Label
                     htmlFor={`locationLine2`}
                     title={`Address Line 2`}
                  >
                     <StyledInputText>Address Line 1 :</StyledInputText>
                  </Form.Label>
                  <Form.Text
                     id={`locationLine2`}
                     name={`locationLine2`}
                     value={locationDetails.line2.value}
                     placeholder="Enter Address"
                     onChange={e => onChange('line2', e.target.value)}
                     onBlur={() => onBlur('line2')}
                     hasError={
                        !locationDetails.line2.meta.isValid &&
                        locationDetails.line2.meta.isTouched
                     }
                  />
                  {locationDetails.line2.meta.isTouched &&
                     !locationDetails.line2.meta.isValid &&
                     locationDetails.line2.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </StyledGroup>
            </Form.Group>
            <Spacer yaxis size="24px" />
            <Form.Group>
               <StyledGroup>
                  <Form.Label htmlFor={`city`} title={`City`}>
                     <StyledInputText>City :</StyledInputText>
                  </Form.Label>
                  <Form.Text
                     id={`city`}
                     name={`city`}
                     value={locationDetails.city.value}
                     placeholder="Enter City"
                     onChange={e => onChange('city', e.target.value)}
                     onBlur={() => onBlur('city')}
                     hasError={
                        !locationDetails.city.meta.isValid &&
                        locationDetails.city.meta.isTouched
                     }
                  />
                  {locationDetails.city.meta.isTouched &&
                     !locationDetails.city.meta.isValid &&
                     locationDetails.city.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </StyledGroup>
            </Form.Group>
            <Spacer yaxis size="24px" />
            <Form.Group>
               <StyledGroup>
                  <Form.Label htmlFor={`zipcode`} title={`Zipcode`}>
                     <StyledInputText>Zipcode :</StyledInputText>
                  </Form.Label>
                  <Form.Text
                     id={`zipcode`}
                     name={`zipcode`}
                     value={locationDetails.zipcode.value}
                     placeholder="Enter Zipcode"
                     onChange={e => onChange('zipcode', e.target.value)}
                     onBlur={() => onBlur('zipcode')}
                     hasError={
                        !locationDetails.zipcode.meta.isValid &&
                        locationDetails.zipcode.meta.isTouched
                     }
                  />
                  {locationDetails.zipcode.meta.isTouched &&
                     !locationDetails.zipcode.meta.isValid &&
                     locationDetails.zipcode.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </StyledGroup>
            </Form.Group>
            <Spacer yaxis size="24px" />
            <Form.Group>
               <StyledGroup>
                  <Form.Label htmlFor={`state`} title={`State`}>
                     <StyledInputText>State :</StyledInputText>
                  </Form.Label>
                  <Form.Text
                     id={`state`}
                     name={`state`}
                     value={locationDetails.state.value}
                     placeholder="Enter State"
                     onChange={e => onChange('state', e.target.value)}
                     onBlur={() => onBlur('state')}
                     hasError={
                        !locationDetails.state.meta.isValid &&
                        locationDetails.state.meta.isTouched
                     }
                  />
                  {locationDetails.state.meta.isTouched &&
                     !locationDetails.state.meta.isValid &&
                     locationDetails.state.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </StyledGroup>
            </Form.Group>
            <Spacer yaxis size="24px" />
            <Form.Group>
               <StyledGroup>
                  <Form.Label htmlFor={`country`} title={`Country`}>
                     <StyledInputText>Country :</StyledInputText>
                  </Form.Label>
                  <Form.Text
                     id={`country`}
                     name={`country`}
                     value={locationDetails.country.value}
                     placeholder="Enter Country"
                     onChange={e => onChange('country', e.target.value)}
                     onBlur={() => onBlur('country')}
                     hasError={
                        !locationDetails.country.meta.isValid &&
                        locationDetails.country.meta.isTouched
                     }
                  />
                  {locationDetails.country.meta.isTouched &&
                     !locationDetails.country.meta.isValid &&
                     locationDetails.country.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </StyledGroup>
            </Form.Group>
         </StyledContainer>
      </>
   )
}
