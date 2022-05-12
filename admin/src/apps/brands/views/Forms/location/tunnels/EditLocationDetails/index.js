import { useMutation } from '@apollo/react-hooks'
import { CloseIconv2, Flex, Form, Spacer, TunnelHeader } from '@dailykit/ui'
import GoogleMapReact from 'google-map-react'
import React from 'react'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import { toast } from 'react-toastify'
import {
   LocationMarkerIcon,
   SearchIcon,
} from '../../../../../../../shared/assets/icons'
import { get_env, logger, useScript } from '../../../../../../../shared/utils'
import { LOCATIONS } from '../../../../../graphql'
import validator from '../../../../validator'
import { StyledContainer } from './styled'

const EditLocationDetails = ({ state, locationId, close, closeTunnel }) => {
   // console.log('state', state)

   const [location, setLocation] = React.useState({
      lat: {
         value: state.lat || '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      },
      lng: {
         value: state.lng || '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      },
      label: {
         value: state.label || '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      },
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
      zipcode: {
         value: state.zipcode || '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      },
      showGooglePlacesAutocompleteInside: false,
   })
   //mutation
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
   console.log('location', location)

   // map declaration
   const [address, setAddress] = React.useState({
      city: '',
      country: '',
      latitude: 0,
      line1: '',
      line2: '',
      longitude: 0,
      mainText: '',
      secondaryText: '',
      zipcode: '',
   })

   React.useEffect(() => {
      if (location.lat.value && location.lng.value) {
         // making initial locationSelector of this instance disable
         setLocation({
            ...location,
            ['showGooglePlacesAutocompleteOutside']: false,
         })

         //fetching the details of location address when map is moved
         fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${
               location.lat.value
            },${location.lng.value}&key=${get_env('REACT_APP_MAPS_API_KEY')}`
         )
            .then(res => res.json())
            .then(data => {
               console.log('fetchData', data)
               if (data.status === 'OK' && data.results.length > 0) {
                  const formatted_address =
                     data.results[0].formatted_address.split(',')
                  address.line1 = formatted_address.slice(0, 2).join(',')
                  address.line2 = formatted_address
                     .slice(2, formatted_address.length - 3)
                     .join(',')
                  address.mainText = formatted_address
                     .slice(0, formatted_address.length - 3)
                     .join(',')
                  address.secondaryText = formatted_address
                     .slice(formatted_address.length - 3)
                     .join(',')
                  data.results[0].address_components.forEach(node => {
                     if (node.types.includes('locality')) {
                        address.city = node.long_name
                     }
                     if (node.types.includes('administrative_area_level_1')) {
                        address.state = node.long_name
                     }
                     if (node.types.includes('country')) {
                        address.country = node.long_name
                     }
                     if (node.types.includes('postal_code')) {
                        address.zipcode = node.long_name
                     }
                  })

                  setAddress(prev => ({
                     ...address,
                     latitude: location.lat.value,
                     longitude: location.lng.value,
                  }))
               }
            })
            .catch(e => {
               console.log('error', e)
            })
      }
   }, [location.lat.value, location.lng.value])

   const UserLocationMarker = () => {
      return (
         <LocationMarkerIcon
            size={48}
            style={{
               position: 'absolute',
               top: 'calc(52.5% - 24px)',
               left: '50%',
               zIndex: '1000',
               transform: 'translate(-50%,-50%)',
            }}
         />
      )
   }
   const [loaded, error] = useScript(
      `https://maps.googleapis.com/maps/api/js?key=${get_env(
         'REACT_APP_MAPS_API_KEY'
      )}&libraries=places`
   )
   const defaultProps = React.useMemo(
      () => ({
         center: {
            lat: parseFloat(location.lat.value),
            lng: parseFloat(location.lng.value),
         },
         zoom: 16,
      }),
      [location]
   )

   const onChangeMap = ({ center, zoom, bounds, marginBounds }) => {
      fetch(
         `https://maps.googleapis.com/maps/api/geocode/json?latlng=${
            center.lat
         },${center.lng}&key=${get_env('REACT_APP_MAPS_API_KEY')}`
      )
         .then(res => res.json())
         .then(data => {
            // console.log('InitialfetchData', data)
            if (data.status === 'OK' && data.results.length > 0) {
               const formatted_address =
                  data.results[0].formatted_address.split(',')
               address.line1 = formatted_address.slice(0, 2).join(',')
               address.line2 = formatted_address
                  .slice(2, formatted_address.length - 3)
                  .join(',')
               address.mainText = formatted_address
                  .slice(0, formatted_address.length - 3)
                  .join(',')
               address.secondaryText = formatted_address
                  .slice(formatted_address.length - 3)
                  .join(',')
               data.results[0].address_components.forEach(node => {
                  if (node.types.includes('locality')) {
                     address.city = node.long_name
                  }
                  if (node.types.includes('administrative_area_level_1')) {
                     address.state = node.long_name
                  }
                  if (node.types.includes('country')) {
                     address.country = node.long_name
                  }
                  if (node.types.includes('postal_code')) {
                     address.zipcode = node.long_name
                  }
               })
               // console.log('finalfetchData', address)

               setAddress(prev => ({
                  ...address,
                  latitude: center.lat,
                  longitude: center.lng,
               }))
            }
         })
         .catch(e => {
            console.log('error', e)
         })
   }
   // console.log('address', address)
   const onClickOnMap = () => {
      console.log('hello')
   }
   //location selector declaration
   const formatAddress = async input => {
      const response = await fetch(
         `https://maps.googleapis.com/maps/api/geocode/json?key=${get_env(
            'REACT_APP_MAPS_API_KEY'
         )}&address=${encodeURIComponent(input.value.description)}`
      )
      const data = await response.json()
      if (data.status === 'OK' && data.results.length > 0) {
         const [result] = data.results
         const userCoordinate = {
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
         }
         setLocation({
            ...location,
            lat: {
               ...location.lat,
               value: userCoordinate.latitude,
            },
            lng: {
               ...location.lng,
               value: userCoordinate.longitude,
            },
            showGooglePlacesAutocompleteInside: false,
         })
      }
   }
   const handleShowAutoGoogleSelect = () => {
      setLocation({
         ...location,
         showGooglePlacesAutocompleteInside:
            !location.showGooglePlacesAutocompleteInside,
      })
   }
   const Save = () => {
      updateLocation({
         variables: {
            id: state.id,
            _set: {
               label: location.label.value,
               locationAddress: {
                  line1: location.line1.value,
                  line2: location.line2.value,
                  locationCoordinates: {
                     latitude: location.lat.value,
                     longitude: location.lng.value,
                  },
               },
               lat: String(location.lat.value),
               lng: String(location.lng.value),
               city: location.city.value,
               state: location.state.value,
               country: location.country.value,
               zipcode: location.zipcode.value,
            },
         },
      })
      {
         closeTunnel ? closeTunnel(3) : close(1)
      }
   }
   return (
      <>
         <TunnelHeader
            title="Edit Store Location"
            right={{
               title: 'Save',
               action: Save,
            }}
            close={() => {
               {
                  closeTunnel ? closeTunnel(3) : close(1)
               }
            }}
            nextAction="Done"
         />

         <StyledContainer>
            <div
               style={{
                  height: '300px',
                  width: '100%',
                  position: 'relative',
               }}
            >
               <UserLocationMarker />
               <GoogleMapReact
                  bootstrapURLKeys={{
                     key: get_env('REACT_APP_MAPS_API_KEY'),
                  }}
                  defaultCenter={defaultProps.center}
                  center={defaultProps.center}
                  defaultZoom={defaultProps.zoom}
                  zoom={defaultProps.zoom}
                  onClick={onClickOnMap}
                  onChange={onChangeMap}
                  options={{ gestureHandling: 'greedy' }}
               ></GoogleMapReact>
            </div>

            {loaded && !error && (
               <div
                  style={{
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'space-between',
                     gap: '1rem',
                     padding: '0.5em 0',
                  }}
               >
                  {location.showGooglePlacesAutocompleteInside ? (
                     <div style={{ width: '100%' }}>
                        <GooglePlacesAutocomplete
                           selectProps={{
                              placeholder: 'Enter Your Store Location',
                              onChange: input => formatAddress(input),
                           }}
                        />
                     </div>
                  ) : (
                     <AddressInfo address={address} />
                  )}
                  {location.showGooglePlacesAutocompleteInside ? (
                     <div
                        onClick={handleShowAutoGoogleSelect}
                        style={{
                           display: 'flex',
                           alignItems: 'center',
                        }}
                        title="Click to exit from search box"
                     >
                        <CloseIconv2 color="#404040CC" stroke="currentColor" />
                     </div>
                  ) : (
                     <div
                        onClick={handleShowAutoGoogleSelect}
                        title="Click to select google search box"
                     >
                        <SearchIcon />
                     </div>
                  )}
               </div>
            )}
            <LocationForm
               address={address}
               location={location}
               setLocation={setLocation}
            />
         </StyledContainer>
      </>
   )
}

export default EditLocationDetails

const LocationForm = props => {
   const { address, location, setLocation } = props

   React.useEffect(() => {
      setLocation({
         ...location,
         ['line1']: {
            ...location['line1'],
            value: address.line1,
            meta: {
               ...location['line1']['meta'],
               isTouched: true,
            },
         },
         ['line2']: {
            ...location['line2'],
            value: address.line2,
            meta: {
               ...location['line2']['meta'],
               isTouched: true,
            },
         },
         ['city']: {
            ...location['city'],
            value: address.city,
            meta: {
               ...location['city']['meta'],
               isTouched: true,
            },
         },
         ['state']: {
            ...location['state'],
            value: address.state,
            meta: {
               ...location['state']['meta'],
               isTouched: true,
            },
         },
         ['country']: {
            ...location['country'],
            value: address.country,
            meta: {
               ...location['country']['meta'],
               isTouched: true,
            },
         },
         ['zipcode']: {
            ...location['zipcode'],
            value: address.zipcode,
            meta: {
               ...location['zipcode']['meta'],
               isTouched: true,
            },
         },
         ['lat']: {
            ...location['lat'],
            value: address.latitude,
            meta: {
               ...location['lat']['meta'],
               isTouched: true,
            },
         },
         ['lng']: {
            ...location['lng'],
            value: address.longitude,
            meta: {
               ...location['lng']['meta'],
               isTouched: true,
            },
         },
      })
   }, [address])
   const onChange = (field, value) => {
      setLocation({
         ...location,
         [field]: {
            ...location[field],
            value,
         },
      })
   }
   const onBlur = field => {
      const { isValid, errors } = validator.text(location[field].value)
      setLocation({
         ...location,
         [field]: {
            ...location[field],
            meta: {
               isTouched: true,
               isValid,
               errors,
            },
         },
      })
   }
   return (
      <>
         <Flex
            style={{
               border: '2px solid #ffffff',
               boxShadow: '0px 1px 8px rgb(0 0 0 / 10%)',
               padding: '16px',
            }}
         >
            <Form.Group>
               <Form.Label htmlFor={`label`} title={`Label`}>
                  Label
               </Form.Label>
               <Form.Text
                  id={`location`}
                  name={`location`}
                  value={location.label.value}
                  placeholder="Enter Label"
                  onChange={e => onChange('label', e.target.value)}
                  onBlur={() => onBlur('label')}
                  hasError={
                     !location.label.meta.isValid &&
                     location.label.meta.isTouched
                  }
               />
               {location.label.meta.isTouched &&
                  !location.label.meta.isValid &&
                  location.label.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer yAxis size="16px" />
            <Form.Group>
               <Form.Label htmlFor={`locationLine1`} title={`Location`}>
                  Address Line 1
               </Form.Label>
               <Form.Text
                  id={`location`}
                  name={`location`}
                  value={location.line1.value}
                  placeholder="Enter Address"
                  onChange={e => onChange('line1', e.target.value)}
                  onBlur={() => onBlur('line1')}
                  hasError={
                     !location.line1.meta.isValid &&
                     location.line1.meta.isTouched
                  }
               />
               {location.line1.meta.isTouched &&
                  !location.line1.meta.isValid &&
                  location.line1.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer yAxis size="16px" />
            <Form.Group>
               <Form.Label htmlFor={`locationLine2`} title={`Location`}>
                  Address Line 2
               </Form.Label>
               <Form.Text
                  id={`location`}
                  name={`location`}
                  value={location.line2.value}
                  placeholder="Enter Address"
                  onChange={e => onChange('line2', e.target.value)}
                  onBlur={() => onBlur('line2')}
                  hasError={
                     !location.line2.meta.isValid &&
                     location.line2.meta.isTouched
                  }
               />
               {location.line2.meta.isTouched &&
                  !location.line2.meta.isValid &&
                  location.line2.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer yaxis size="16px" />
            <Form.Group>
               <Form.Label htmlFor={`city`} title={`City`}>
                  City
               </Form.Label>
               <Form.Text
                  id={`city`}
                  name={`city`}
                  value={location.city.value}
                  placeholder="Enter City"
                  onChange={e => onChange('city', e.target.value)}
                  onBlur={() => onBlur('city')}
                  hasError={
                     !location.city.meta.isValid && location.city.meta.isTouched
                  }
               />
               {location.city.meta.isTouched &&
                  !location.city.meta.isValid &&
                  location.city.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer yaxis size="16px" />
            <Form.Group>
               <Form.Label htmlFor={`state`} title={`State`}>
                  State
               </Form.Label>
               <Form.Text
                  id={`state`}
                  name={`state`}
                  value={location.state.value}
                  placeholder="Enter State"
                  onChange={e => onChange('state', e.target.value)}
                  onBlur={() => onBlur('state')}
                  hasError={
                     !location.state.meta.isValid &&
                     location.state.meta.isTouched
                  }
               />
               {location.state.meta.isTouched &&
                  !location.state.meta.isValid &&
                  location.state.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer yaxis size="16px" />
            <Form.Group>
               <Form.Label htmlFor={`country`} title={`Country`}>
                  Country
               </Form.Label>
               <Form.Text
                  id={`country`}
                  name={`country`}
                  value={location.country.value}
                  placeholder="Enter Country"
                  onChange={e => onChange('country', e.target.value)}
                  onBlur={() => onBlur('country')}
                  hasError={
                     !location.country.meta.isValid &&
                     location.country.meta.isTouched
                  }
               />
               {location.country.meta.isTouched &&
                  !location.country.meta.isValid &&
                  location.country.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer yaxis size="16px" />
            <Form.Group>
               <Form.Label htmlFor={`zipcode`} title={`Zipcode`}>
                  Zipcode
               </Form.Label>
               <Form.Text
                  id={`zipcode`}
                  name={`zipcode`}
                  value={location.zipcode.value}
                  placeholder="Enter Zipcode"
                  onChange={e => onChange('zipcode', e.target.value)}
                  onBlur={() => onBlur('zipcode')}
                  hasError={
                     !location.zipcode.meta.isValid &&
                     location.zipcode.meta.isTouched
                  }
               />
               {location.zipcode.meta.isTouched &&
                  !location.zipcode.meta.isValid &&
                  location.zipcode.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
         </Flex>
         <Spacer yAxis size="16px" />
      </>
   )
}
const AddressInfo = props => {
   const { address } = props
   return (
      <div
         style={{
            fontFamily: 'Roboto',
            fontStyle: 'normal',
            fontWeight: '500',
            fontSize: '15px',
         }}
      >
         <span>{address.mainText}</span>
         <br />
         <span>
            {address.secondaryText} {address.zipcode}
         </span>
      </div>
   )
}
