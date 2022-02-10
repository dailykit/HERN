import { useMutation } from '@apollo/react-hooks'
import {
   ButtonGroup,
   ButtonTile,
   ComboButton,
   Flex,
   Form,
   IconButton,
   Spacer,
   TunnelHeader,
} from '@dailykit/ui'
import React from 'react'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import { toast } from 'react-toastify'
import { LOCATIONS } from '../../../../apps/brands/graphql'
import { DeleteIcon, LocationMarkerIcon, PlusIcon } from '../../../assets/icons'
import { Banner } from '../../../components'
import { useTabs } from '../../../providers'
import { get_env, useScript } from '../../../utils'
import validator from '../../validator'
import { CSSTransition } from 'react-transition-group'
import GoogleMapReact from 'google-map-react'
import { StyledContainer, StyledMapLocator } from './styled'

const CreateBrandLocation = ({ closeTunnel }) => {
   const { addTab, tab } = useTabs()
   const [click, setClick] = React.useState(null)

   const locationInstance = {
      label: {
         value: '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      },
      line1: {
         value: '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      },
      line2: {
         value: '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      },
      city: {
         value: '',
      },
      state: {
         value: '',
      },
      country: {
         value: '',
      },
      zipcode: {
         value: '',
      },
   }
   const [location, setLocation] = React.useState([locationInstance])

   //mutation
   const [createLocation, { loading }] = useMutation(LOCATIONS.CREATE, {
      onCompleted: input => {
         {
            if (click === 'SaveAndOpen') {
               input.insert_brands_location.returning.map(separateTab => {
                  addTab(
                     separateTab.label,
                     `/brands/locations/${separateTab.id}`
                  )
               })
            }
         }
         console.log('The input contains:', input)
         setLocation([locationInstance])
         toast.success('Successfully created the Location!')
         closeTunnel(1)
      },
      onError: () =>
         toast.success('Failed to create the Location, please try again!'),
   })

   const createLocationHandler = () => {
      try {
         const objects = location.filter(Boolean).map(eachLocation => ({
            label: `${eachLocation.label.value}`,
            locationAddress: {
               line1: `${eachLocation.line1.value}`,
               line2: `${eachLocation.line2.value}`,
            },
            city: eachLocation.city.value,
            state: eachLocation.state.value,
            country: eachLocation.country.value,
            zipcode: eachLocation.zipcode.value,
         }))
         if (!objects.length) {
            throw Error('Nothing to add!')
         }
         createLocation({
            variables: {
               objects,
            },
         })
      } catch (error) {
         toast.error(error.message)
      }
   }

   const save = type => {
      setClick(type)
      let locationValid = location.every(
         object =>
            object.label.meta.isValid &&
            object.line1.meta.isValid &&
            object.line2.meta.isValid
      )
      let locationTouch = location.every(
         object =>
            object.label.meta.isTouched &&
            object.line1.meta.isTouched &&
            object.line2.meta.isTouched
      )
      // console.log('saveLocation', location)
      // console.log('verification', locationValid, locationTouch)
      if (locationValid && locationTouch) {
         return createLocationHandler()
      }
      return toast.error('All fields must be filled!')
   }
   const close = () => {
      closeTunnel(1)
   }
   return (
      <>
         <TunnelHeader
            title="Add Location"
            right={{
               action: () => {
                  save('save')
               },
               title: loading && click === 'save' ? 'Saving...' : 'Save',
            }}
            extraButtons={[
               {
                  action: () => {
                     save('SaveAndOpen')
                  },
                  title:
                     loading && click === 'SaveAndOpen'
                        ? 'Saving...'
                        : 'Save & Open',
               },
            ]}
            close={close}
         />
         <Banner id="brand-app-location-create-location-tunnel-top" />
         <StyledContainer>
            {location.map((eachLocation, i) => (
               <>
                  <LocationSelector
                     i={i}
                     eachLocation={eachLocation}
                     location={location}
                     setLocation={setLocation}
                  />
               </>
            ))}
            <ButtonGroup>
               <ComboButton
                  type="ghost"
                  size="sm"
                  onClick={() => setLocation([...location, locationInstance])}
                  title="Click to add new location"
               >
                  <PlusIcon color="#367BF5" /> Add New Location
               </ComboButton>
            </ButtonGroup>
         </StyledContainer>
         <Spacer xAxis size="24px" />
         <Banner id="brand-app-location-create-location-tunnel-bottom" />
      </>
   )
}

export default CreateBrandLocation

const LocationSelector = props => {
   const { i, eachLocation, location, setLocation } = props
   const [address, setAddress] = React.useState(null)
   const [loaded, error] = useScript(
      `https://maps.googleapis.com/maps/api/js?key=${get_env(
         'REACT_APP_MAPS_API_KEY'
      )}&libraries=places`
   )

   const formatAddress = async input => {
      console.log('inputfn', input)

      const response = await fetch(
         `https://maps.googleapis.com/maps/api/geocode/json?key=${get_env(
            'REACT_APP_MAPS_API_KEY'
         )}&address=${encodeURIComponent(input.value.description)}`
      )
      const data = await response.json()
      console.log('data', data)
      if (data.status === 'OK' && data.results.length > 0) {
         const [result] = data.results
         const userCoordinate = {
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
         }
         console.log('userCoordinate', userCoordinate)
         setAddress(userCoordinate)
      }
   }
   React.useEffect(() => {
      const newLocation = [...location]
      newLocation[i] = {
         ...newLocation[i],
         address,
      }
      setLocation([...newLocation])
   }, [address])
   // console.log('address', address)
   return (
      <>
         {loaded && !error && (
            <>
               <Flex>
                  <GooglePlacesAutocomplete
                     selectProps={{
                        placeholder: 'Enter Your Store Location',
                        onChange: input => formatAddress(input),
                     }}
                     width={'100%'}
                  />
               </Flex>
               {location[i].address && (
                  <>
                     <RefineLocationPopup
                        geoCoordinates={address}
                        i={i}
                        eachLocation={eachLocation}
                        location={location}
                        setLocation={setLocation}
                     />
                  </>
               )}
            </>
         )}
      </>
   )
}
const RefineLocationPopup = props => {
   return (
      <CSSTransition
         in={true}
         timeout={100}
         unmountOnExit
         classNames="hern-store-refine-location__css-transition"
      >
         <BrandLocationMap {...props} />
      </CSSTransition>
   )
}
const BrandLocationMap = props => {
   const { geoCoordinates, i, location, eachLocation, setLocation } = props
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
      if (eachLocation.address.latitude && eachLocation.address.longitude) {
         // console.log('geo', eachLocation.address)

         fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${
               eachLocation.address.latitude
            },${eachLocation.address.longitude}&key=${get_env(
               'REACT_APP_MAPS_API_KEY'
            )}`
         )
            .then(res => res.json())
            .then(data => {
               // console.log('fetchData', data)
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
                  // console.log('fetchData', address)

                  setAddress(prev => ({
                     ...address,
                     latitude: eachLocation.address.latitude,
                     longitude: eachLocation.address.longitude,
                  }))
               }
            })
            .catch(e => {
               console.log('error', e)
            })
      }
   }, [eachLocation.address])
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
   const defaultProps = {
      center: {
         lat: eachLocation.address.latitude,
         lng: eachLocation.address.longitude,
      },
      zoom: 16,
   }
   // console.log('default', defaultProps)

   const onChangeMap = ({ center, zoom, bounds, marginBounds }) => {
      // console.log('onChange', center, zoom, bounds, marginBounds)
      // console.log('thisIsCenter', center)
      // console.log('api', get_env('REACT_APP_MAPS_API_KEY'))

      fetch(
         `https://maps.googleapis.com/maps/api/geocode/json?latlng=${
            center.lat
         },${center.lng}&key=${get_env('REACT_APP_MAPS_API_KEY')}`
      )
         .then(res => res.json())
         .then(data => {
            console.log('InitialfetchData', data)
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
               console.log('finalfetchData', address)

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

   return (
      <>
         <div>
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
                  onClick={onClickOnMap}
                  onChange={onChangeMap}
                  options={{ gestureHandling: 'greedy' }}
               ></GoogleMapReact>
            </div>
            <AddressInfo address={address} />
            <LocationForm
               address={address}
               i={i}
               eachLocation={eachLocation}
               location={location}
               setLocation={setLocation}
            />
         </div>
      </>
   )
}
const LocationForm = props => {
   const { address, i, eachLocation, location, setLocation } = props
   const removeField = index => {
      const newLocation = location
      if (newLocation.length > 1) {
         newLocation.splice(index, 1)
         setLocation([...newLocation])
      } else {
         toast.error('Location should atleast be 1 !')
      }
   }
   React.useEffect(() => {
      const newLocation = [...location]
      newLocation[i] = {
         ...newLocation[i],
         ['line1']: {
            ...newLocation[i]['line1'],
            value: address.line1,
            meta: {
               ...newLocation[i]['line1']['meta'],
               isTouched: true,
            },
         },
         ['line2']: {
            ...newLocation[i]['line2'],
            value: address.line2,
            meta: {
               ...newLocation[i]['line2']['meta'],
               isTouched: true,
            },
         },
         ['city']: {
            ...newLocation[i]['city'],
            value: address.city,
         },
         ['state']: {
            ...newLocation[i]['state'],
            value: address.state,
         },
         ['country']: {
            ...newLocation[i]['country'],
            value: address.country,
         },
         ['zipcode']: {
            ...newLocation[i]['country'],
            value: address.zipcode,
         },
      }
      setLocation([...newLocation])
   }, [address])
   const onChange = (field, value, index) => {
      //serving, value, i
      const newLocation = [...location]
      console.log(newLocation)
      newLocation[index] = {
         ...newLocation[index],
         [field]: {
            ...newLocation[index][field],
            value,
         },
      }
      setLocation([...newLocation])
   }
   const onBlur = (field, index) => {
      const { isValid, errors } = validator.text(location[index][field].value)
      const newLocation = [...location]
      newLocation[index] = {
         ...newLocation[index],
         [field]: {
            ...newLocation[index][field],
            meta: {
               isTouched: true,
               isValid,
               errors,
            },
         },
      }
      setLocation([...newLocation])
      console.log(newLocation)
   }
   // console.log('location', location)
   return (
      <>
         <Flex
            key={i}
            style={{
               border: '2px solid #ffffff',
               boxShadow: '0px 1px 8px rgb(0 0 0 / 10%)',
               padding: '16px',
            }}
         >
            <Form.Group>
               <Flex
                  container
                  style={{
                     alignItems: 'center',
                     justifyContent: 'space-between',
                  }}
               >
                  <Form.Label
                     htmlFor={`locationLabel-${i}`}
                     title={`Location ${i + 1}`}
                  >
                     Label
                  </Form.Label>
                  <IconButton
                     type="ghost"
                     title="Delete this Location"
                     onClick={() => removeField(i)}
                     style={{
                        width: '30px',
                        height: '20px',
                        marginBottom: '4px',
                     }}
                  >
                     <DeleteIcon color="#FF5A52" />
                  </IconButton>
               </Flex>
               <Form.Text
                  id={`location-${i}`}
                  name={`location-${i}`}
                  value={eachLocation.label.value}
                  placeholder="Enter Label"
                  onChange={e => onChange('label', e.target.value, i)}
                  onBlur={() => onBlur('label', i)}
                  hasError={
                     !eachLocation.label.meta.isValid &&
                     eachLocation.label.meta.isTouched
                  }
               />
               {eachLocation.label.meta.isTouched &&
                  !eachLocation.label.meta.isValid &&
                  eachLocation.label.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer yAxis size="16px" />
            <Form.Group>
               <Form.Label
                  htmlFor={`locationLine1-${i}`}
                  title={`Location ${i + 1}`}
               >
                  Address Line 1
               </Form.Label>
               <Form.Text
                  id={`location-${i}`}
                  name={`location-${i}`}
                  value={eachLocation.line1.value}
                  placeholder="Enter Address"
                  onChange={e => onChange('line1', e.target.value, i)}
                  onBlur={() => onBlur('line1', i)}
                  hasError={
                     !eachLocation.line1.meta.isValid &&
                     eachLocation.line1.meta.isTouched
                  }
               />
               {eachLocation.line1.meta.isTouched &&
                  !eachLocation.line1.meta.isValid &&
                  eachLocation.line1.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer yAxis size="16px" />
            <Form.Group>
               <Form.Label
                  htmlFor={`locationLine2-${i}`}
                  title={`Location ${i + 1}`}
               >
                  Address Line 2
               </Form.Label>
               <Form.Text
                  id={`location-${i}`}
                  name={`location-${i}`}
                  value={eachLocation.line2.value}
                  placeholder="Enter Address"
                  onChange={e => onChange('line2', e.target.value, i)}
                  onBlur={() => onBlur('line2', i)}
                  hasError={
                     !eachLocation.line2.meta.isValid &&
                     eachLocation.line2.meta.isTouched
                  }
               />
               {eachLocation.line2.meta.isTouched &&
                  !eachLocation.line2.meta.isValid &&
                  eachLocation.line2.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer yAxis size="16px" />
            <Form.Group>
               <Form.Label
                  htmlFor={`locationCity-${i}`}
                  title={`Location ${i + 1}`}
               >
                  City
               </Form.Label>
               <Form.Text
                  id={`location-${i}`}
                  name={`location-${i}`}
                  value={eachLocation.city.value}
               />
            </Form.Group>
            <Spacer yAxis size="16px" />
            <Form.Group>
               <Form.Label
                  htmlFor={`locationState-${i}`}
                  title={`Location ${i + 1}`}
               >
                  State
               </Form.Label>
               <Form.Text
                  id={`location-${i}`}
                  name={`location-${i}`}
                  value={eachLocation.state.value}
               />
            </Form.Group>
            <Spacer yAxis size="16px" />
            <Form.Group>
               <Form.Label
                  htmlFor={`locationCountry-${i}`}
                  title={`Location ${i + 1}`}
               >
                  Country
               </Form.Label>
               <Form.Text
                  id={`location-${i}`}
                  name={`location-${i}`}
                  value={eachLocation.country.value}
               />
            </Form.Group>
         </Flex>
         <Spacer yAxis size="16px" />
      </>
   )
}
const AddressInfo = props => {
   const { address } = props
   return (
      <div className="hern-store-location-selector__user-address">
         <div className="hern-store-location-selector__user-address-info">
            <span className="hern-store-location-selector__user-address-info-text hern-store-location-selector__user-address-info-main-text">
               {address.mainText}
            </span>
            <br />
            <span className="hern-store-location-selector__user-address-info-text hern-store-location-selector__user-address-info-secondary-text">
               {address.secondaryText} {address.zipcode}
            </span>
         </div>
      </div>
   )
}
