import React, { useState, useEffect } from 'react'
import GoogleMapReact from 'google-map-react'
import { LocationMarker, CloseIcon, SearchIcon } from '../assets/icons'
import { CSSTransition } from 'react-transition-group'
import {
   get_env,
   getStoresWithValidations,
   isClient,
   LocationSelectorWrapper,
   useScript,
} from '../utils'
import { Form, Button, GoogleSuggestionsList, Tunnel } from '.'
import LocationSelectorConfig from './locatoinSeletorConfig.json'
import { useConfig } from '../lib'
import { useUser, useCart, useTranslation } from '../context'
import { useMutation } from '@apollo/react-hooks'
import { MUTATIONS } from '../graphql'
import { useToasts } from 'react-toast-notifications'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import { Modal, Skeleton } from 'antd'

const ReactPixel = isClient ? require('react-facebook-pixel').default : null

const RefineLocation = props => {
   // props
   const {
      fulfillmentType,
      onRefineLocationCloseIconClick,
      onRefineLocationComplete,
      showRefineLocation,
      setShowRefineLocation,
      showRightButton = false,
   } = props
   const { orderTabs, dispatch, brand } = useConfig()
   const { user } = useUser()
   const { storedCartId, methods } = useCart()
   const { addToast } = useToasts()
   const { t } = useTranslation()
   // component state
   const [centerCoordinate, setCenterCoordinate] = useState({})
   const [address, setAddress] = React.useState(props.address)
   const [isStoreAvailableOnAddress, setIsStoreAvailableOnAddress] =
      React.useState(true)
   const [additionalAddressInfo, setAdditionalAddressInfo] = useState({
      line1: '',
      landmark: '',
      label: '',
      notes: '',
   })
   const [selectedStore, setSelectedStore] = useState(null)
   const [isGetStoresLoading, setIsGetStoresLoading] = useState(true)
   const [showLocationSelectorPopup, setShowLocationSelectorPopup] =
      useState(false)
   const [showGooglePlacesAutocomplete, setShowGooglePlacesAutocomplete] =
      useState(false)
   const [defaultProps, setDefaultProps] = useState({
      center: {
         lat: +address.latitude,
         lng: +address.longitude,
      },
      zoom: 16,
   })
   const [runInitialMapChange, setRunInitialMapChange] = useState(false)
   // console.log('this is address', address)

   const [loaded, error] = useScript(
      isClient
         ? `https://maps.googleapis.com/maps/api/js?key=${get_env(
              'GOOGLE_API_KEY'
           )}&libraries=places`
         : ''
   )

   React.useEffect(() => {
      if (address?.line1) {
         setAdditionalAddressInfo(prev => ({
            ...prev,
            line1: address.line1 || '',
         }))
      }
   }, [address])

   const [createAddress] = useMutation(MUTATIONS.CUSTOMER.ADDRESS.CREATE, {
      onCompleted: () => {
         addToast(t('Address has been saved.'), {
            appearance: 'success',
         })
         // fb pixel custom event for adding a new address
         ReactPixel.trackCustom('addAddress', address)
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })

   // defaultProps for google map

   const onClickOnMap = () => {
      console.log('hello')
   }

   // handle submit and proceed
   const handleOnSubmit = () => {
      const selectedOrderTab = orderTabs.find(
         x => x.orderFulfillmentTypeLabel === fulfillmentType
      )
      // console.log('address', { ...address, ...additionalAddressInfo })
      const customerAddress = {
         line1: additionalAddressInfo?.line1 || '',
         line2: address.line2 || '',
         city: address.city,
         state: address.state,
         country: address.country,
         zipcode: address.zipcode,
         notes: additionalAddressInfo?.notes || '',
         label: additionalAddressInfo?.label || '',
         lat: address.latitude.toString(),
         lng: address.longitude.toString(),
         landmark: additionalAddressInfo?.landmark || '',
         searched: '',
      }
      if (user?.keycloakId) {
         createAddress({
            variables: {
               object: { ...customerAddress, keycloakId: user?.keycloakId },
            },
         })
      }
      const cartIdInLocal = localStorage.getItem('cart-id')
      if (cartIdInLocal || storedCartId) {
         const finalCartId = cartIdInLocal
            ? JSON.parse(cartIdInLocal)
            : storedCartId
         methods.cart.update({
            variables: {
               id: finalCartId,
               _set: {
                  address: customerAddress,
                  locationId: selectedStore.location.id,
                  orderTabId: selectedOrderTab.id,
                  fulfillmentInfo: null,
               },
            },
         })
      }
      dispatch({
         type: 'SET_LOCATION_ID',
         payload: selectedStore.location.id,
      })
      dispatch({
         type: 'SET_SELECTED_ORDER_TAB',
         payload: selectedOrderTab,
      })
      dispatch({
         type: 'SET_USER_LOCATION',
         payload: address,
      })
      dispatch({
         type: 'SET_STORE_STATUS',
         payload: {
            status: true,
            message: 'Store available on your location.',
            loading: false,
         },
      })
      localStorage.setItem('orderTab', JSON.stringify(fulfillmentType))
      if (
         localStorage.getItem('storeLocationId') &&
         JSON.parse(localStorage.getItem('storeLocationId')) !==
            selectedStore.location.id
      ) {
         const lastStoreLocationId = JSON.parse(
            localStorage.getItem('storeLocationId')
         )
         localStorage.setItem(
            'lastStoreLocationId',
            JSON.stringify(lastStoreLocationId)
         )
         dispatch({
            type: 'SET_LAST_LOCATION_ID',
            payload: lastStoreLocationId,
         })
      }
      localStorage.setItem(
         'storeLocationId',
         JSON.stringify(selectedStore.location.id)
      )
      localStorage.setItem(
         'userLocation',
         JSON.stringify({ ...address, ...additionalAddressInfo })
      )
      onRefineLocationComplete && onRefineLocationComplete()
      setShowRefineLocation(false)
   }

   const onChangeMap = ({ center, zoom, bounds, marginBounds }) => {
      // console.log('onChange', center, zoom, bounds, marginBounds)
      // console.log('thisIsCenter', center)
      if (!runInitialMapChange) {
         setRunInitialMapChange(true)
         return
      }
      setCenterCoordinate(prev => ({
         ...prev,
         latitude: center.lat.toString(),
         longitude: center.lng.toString(),
      }))
      fetch(
         `https://maps.googleapis.com/maps/api/geocode/json?latlng=${
            center.lat
         },${center.lng}&key=${get_env(
            'GOOGLE_API_KEY'
         )}&result_type=street_address|point_of_interest&location_type=ROOFTOP`
      )
         .then(res => res.json())
         .then(data => {
            if (data.status === 'OK' && data.results.length > 0) {
               setIsGetStoresLoading(true)
               const formatted_address =
                  data.results[0].formatted_address.split(',')
               const mainText = formatted_address
                  .slice(0, formatted_address.length - 3)
                  .join(',')
               const secondaryText = formatted_address
                  .slice(formatted_address.length - 3)
                  .join(',')
               const address = {}
               address.line1 = mainText
               address.line2 = ''
               data.results[0].address_components.forEach(node => {
                  if (node.types.includes('sublocality_level_3')) {
                     address.line2 += `${node.long_name || ''} `
                  }
                  if (node.types.includes('sublocality_level_2')) {
                     address.line2 += `${node.long_name || ''} `
                  }
                  if (node.types.includes('sublocality_level_1')) {
                     address.line2 += `${node.long_name || ''} `
                  }
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
                  mainText,
                  secondaryText,
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

   useEffect(() => {
      if (address && brand.id) {
         async function fetchStores() {
            const brandClone = { ...brand }
            const availableStore = await getStoresWithValidations({
               brand: brandClone,
               fulfillmentType,
               address,
               autoSelect: true,
            })
            if (availableStore.length === 0) {
               setIsStoreAvailableOnAddress(false)
               setSelectedStore(null)
            } else {
               setIsStoreAvailableOnAddress(true)
            }
            setSelectedStore(availableStore[0])
            setIsGetStoresLoading(false)
         }
         fetchStores()
      }
   }, [address, fulfillmentType, brand])

   const onRefineCloseClick = () => {
      onRefineLocationCloseIconClick && onRefineLocationCloseIconClick()
      setShowRefineLocation(false)
   }

   const onChangeClick = () => {
      setShowLocationSelectorPopup(true)
   }

   const SERVER_URL = React.useMemo(() => {
      const storeMode = process?.env?.NEXT_PUBLIC_MODE || 'production'
      if (isClient) {
         return {
            production: window.location.origin,
            'full-dev': 'http://localhost:4000',
            'store-dev': 'http://localhost:4000',
         }[storeMode]
      } else {
         return null
      }
   }, [isClient])

   const formatAddress = async input => {
      if (!isClient) return 'Runs only on client side.'
      // console.log('inputfn', input)

      const response = await fetch(
         `${SERVER_URL}/server/api/place/details/json?key=${
            isClient ? get_env('GOOGLE_API_KEY') : ''
         }&placeid=${input.place_id}&language=en`
      )
      const data = await response.json()
      // console.log('datain', data)
      if (data.status === 'OK' && data.result) {
         const result = data.result
         result.address_components.forEach(node => {
            if (node.types.includes('postal_code')) {
               address.zipcode = node.long_name
            }
         })
         if (address.zipcode) {
            setDefaultProps(prev => ({
               ...prev,
               center: {
                  lat: +result.geometry.location.lat.toString(),
                  lng: +result.geometry.location.lng.toString(),
               },
            }))
            setShowGooglePlacesAutocomplete(false)
         } else {
            Modal.warning({
               title: `Please select a precise location. Try typing a landmark near your house.`,
               maskClosable: true,
               centered: true,
            })
         }
      }
   }
   return (
      <div style={{ position: 'relative' }}>
         {/* <LocationSelectorWrapper
         showLocationSelectorPopup={showLocationSelectorPopup}
         setShowLocationSelectionPopup={setShowLocationSelectorPopup}
      /> */}

         <div>
            <div
               style={{
                  height: '200px',
                  width: '100%',
                  position: 'relative',
               }}
            >
               <UserLocationMarker />
               <GoogleMapReact
                  bootstrapURLKeys={{ key: get_env('GOOGLE_API_KEY') }}
                  defaultCenter={defaultProps.center}
                  center={defaultProps.center}
                  defaultZoom={defaultProps.zoom}
                  onClick={onClickOnMap}
                  onChildClick={(a, b, c, d) => {
                     console.log('childClick', a, b, c, d)
                  }}
                  onChange={onChangeMap}
                  options={{ gestureHandling: 'greedy' }}
               ></GoogleMapReact>
            </div>
         </div>
         <div
            style={{
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between',
            }}
         >
            {showGooglePlacesAutocomplete ? (
               <div style={{ width: '100%', padding: '14px' }}>
                  {loaded && !error && (
                     <GooglePlacesAutocomplete
                        inputClassName="hern-store-location-selector-main__location-input"
                        placeholder={
                           LocationSelectorConfig.informationVisibility
                              .deliverySettings.userAddressInputPlaceHolder
                              .value || 'Enter your delivery location'
                        }
                        renderSuggestions={(active, suggestions) => (
                           <GoogleSuggestionsList
                              suggestions={suggestions}
                              onSuggestionClick={formatAddress}
                           />
                        )}
                        loader={() => {
                           return (
                              <Skeleton.Input
                                 style={{ width: 100 }}
                                 active={true}
                                 size={'small'}
                                 loading={true}
                              />
                           )
                        }}
                     />
                  )}
               </div>
            ) : (
               <AddressInfo
                  address={address}
                  isStoreAvailableOnAddress={isStoreAvailableOnAddress}
               />
            )}
            {showGooglePlacesAutocomplete ? (
               <div
                  onClick={() => {
                     setShowGooglePlacesAutocomplete(false)
                  }}
                  className="hern-refine-location-search-close-icon hern-refine-location-close-icon"
                  style={{ padding: '5px' }}
               >
                  <CloseIcon color="#404040CC" stroke="currentColor" />
               </div>
            ) : (
               <div
                  onClick={() => {
                     setShowGooglePlacesAutocomplete(true)
                  }}
                  className="hern-refine-location-search-close-icon"
               >
                  <SearchIcon />
               </div>
            )}
         </div>
         <AddressForm
            isStoreAvailableOnAddress={isStoreAvailableOnAddress}
            additionalAddressInfo={additionalAddressInfo}
            setAdditionalAddressInfo={setAdditionalAddressInfo}
            handleOnSubmit={handleOnSubmit}
         />
         <Button
            size="sm"
            onClick={handleOnSubmit}
            className="hern-refine-location__save-proceed-btn"
            disabled={
               !isStoreAvailableOnAddress ||
               !additionalAddressInfo?.line1 ||
               isGetStoresLoading
            }
         >
            {isGetStoresLoading
               ? t('Searching store')
               : isStoreAvailableOnAddress
               ? t('Save & Proceed')
               : t('No store available')}
         </Button>
      </div>
   )
}

const UserLocationMarker = () => {
   return (
      <LocationMarker
         size={48}
         style={{
            position: 'absolute',
            top: 'calc(52.5% - 24px)',
            left: '49.5%',
            zIndex: '1000',
            transform: 'translate(-50%,-50%)',
         }}
      />
   )
}

const RefineLocationHeader = ({ onRefineCloseClick, onChangeClick }) => {
   const { t } = useTranslation()
   return (
      <div className="hern-store-location-selector-header">
         <div className="hern-store-location-selector-header-left">
            <CloseIcon
               size={16}
               color="#404040CC"
               stroke="currentColor"
               onClick={onRefineCloseClick}
            />
            <span>{t('Refine Your Location')}</span>
         </div>
      </div>
   )
}

const AddressForm = ({
   isStoreAvailableOnAddress,
   additionalAddressInfo,
   setAdditionalAddressInfo,
   handleOnSubmit,
}) => {
   const [addressWarnings, setAddressWarnings] = React.useState({
      line1: false,
   }) // to show warning for required field
   const [address] = React.useState({})
   const { t } = useTranslation()
   return (
      <div style={{ position: 'relative' }}>
         <div className="hern-refine-location__address-form">
            <Form.Field className="hern-refine-location__address-form-field">
               <Form.Label>
                  {t('Apartment/Building Info/Street info*')}{' '}
                  <span className="hern-address-warning">
                     {addressWarnings?.line1 ? 'fill this field' : null}
                  </span>
               </Form.Label>
               <Form.Text
                  className="hern-refine-location__address-input"
                  type="text"
                  placeholder="Enter apartment/building info/street info"
                  value={additionalAddressInfo?.line1 || ''}
                  onChange={e => {
                     // console.log('evalue', e.target.value)
                     if (!e.target.value) {
                        setAddressWarnings(prev => ({
                           ...prev,
                           line1: true,
                        }))
                     } else {
                        setAddressWarnings(prev => ({
                           ...prev,
                           line1: false,
                        }))
                     }
                     setAdditionalAddressInfo({
                        ...additionalAddressInfo,
                        line1: e.target.value,
                     })
                  }}
               />
            </Form.Field>
            <Form.Field className="hern-refine-location__address-form-field">
               <Form.Label>{t('Landmark')}</Form.Label>
               <Form.Text
                  className="hern-refine-location__address-input"
                  type="text"
                  value={additionalAddressInfo?.landmark || ''}
                  placeholder="Enter landmark"
                  onChange={e =>
                     setAdditionalAddressInfo({
                        ...additionalAddressInfo,
                        landmark: e.target.value,
                     })
                  }
               />
            </Form.Field>

            <Form.Field className="hern-refine-location__address-form-field">
               <Form.Label>{t('Label')}</Form.Label>
               <Form.Text
                  className="hern-refine-location__address-input"
                  type="text"
                  value={additionalAddressInfo?.label || ''}
                  placeholder="Enter label for this address"
                  onChange={e =>
                     setAdditionalAddressInfo({
                        ...additionalAddressInfo,
                        label: e.target.value,
                     })
                  }
               />
            </Form.Field>
            <Form.Field className="hern-refine-location__address-form-field">
               <Form.Label>{t('Dropoff Instructions')}</Form.Label>
               <Form.TextArea
                  className="hern-refine-location__address-text-area"
                  type="text"
                  value={additionalAddressInfo?.notes || ''}
                  placeholder="Enter dropoff instructions"
                  onChange={e =>
                     setAdditionalAddressInfo({
                        ...additionalAddressInfo,
                        notes: e.target.value,
                     })
                  }
               />
            </Form.Field>
         </div>
      </div>
   )
}

const AddressInfo = props => {
   const { address, isStoreAvailableOnAddress } = props
   return (
      <div className="hern-store-location-selector__user-address">
         <div className="hern-store-location-selector__user-address-info">
            <span className="hern-store-location-selector__user-address-info-text hern-store-location-selector__user-address-info-main-text">
               {address?.line1 || address.mainText}
            </span>
            <br />
            <span className="hern-store-location-selector__user-address-info-text hern-store-location-selector__user-address-info-secondary-text">
               {`${address?.city || ''} ${address?.country || ''}`}{' '}
               {address.zipcode}
            </span>
         </div>
      </div>
   )
}

export const RefineLocationPopup1 = props => {
   const { showRefineLocation } = props
   return (
      <CSSTransition
         in={showRefineLocation}
         timeout={100}
         unmountOnExit
         classNames="hern-store-refine-location__css-transition"
      >
         <RefineLocation {...props} />
      </CSSTransition>
   )
}
export const RefineLocationPopup = props => {
   const {
      showRefineLocation,
      onRefineLocationCloseIconClick,
      setShowRefineLocation,
   } = props
   const { t } = useTranslation()
   return (
      <Tunnel.Left
         in={showRefineLocation}
         title={<span>{t('Refine Location')}</span>}
         visible={showRefineLocation}
         onClose={() => {
            setShowRefineLocation(false)
            onRefineLocationCloseIconClick && onRefineLocationCloseIconClick()
         }}
         destroyOnClose={true}
      >
         <RefineLocation {...props} />
      </Tunnel.Left>
   )
}
