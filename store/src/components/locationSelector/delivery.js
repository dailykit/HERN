import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import { Radio, Modal } from 'antd'
import { useConfig } from '../../lib'
import { get_env, useScript, isClient } from '../../utils'
import { getStoresWithValidations } from '../../utils'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import LocationSelectorConfig from '../locatoinSeletorConfig.json'
import { StoreList } from '../locationSelector/storeList'
import { GPSIcon, NotFound } from '../../assets/icons'
import { Loader } from '..'
import { AddressInfo } from './addressInfo'

// delivery section
export const Delivery = props => {
   const { deliveryType: storeDeliveryType } =
      LocationSelectorConfig.informationVisibility.deliverySettings

   const availableStoreType =
      storeDeliveryType.value.length > 0
         ? storeDeliveryType.value.map(x => x.value)
         : storeDeliveryType.default.map(x => x.value)

   const { setShowLocationSelectionPopup, settings } = props

   const { orderTabs, brand } = useConfig()

   const orderTabFulfillmentType = React.useMemo(
      () =>
         orderTabs
            ? orderTabs.map(eachTab => eachTab.orderFulfillmentTypeLabel)
            : null,
      [orderTabs]
   )

   const deliveryRadioOptions = React.useMemo(() => {
      let options = []
      if (
         orderTabFulfillmentType &&
         orderTabFulfillmentType.includes('ONDEMAND_DELIVERY') &&
         Boolean(availableStoreType.find(x => x === 'ONDEMAND'))
      ) {
         options.push({ label: 'Now', value: 'ONDEMAND_DELIVERY' })
      }
      if (
         orderTabFulfillmentType &&
         orderTabFulfillmentType.includes('PREORDER_DELIVERY') &&
         Boolean(availableStoreType.find(x => x === 'PREORDER'))
      ) {
         options.push({ label: 'Later', value: 'PREORDER_DELIVERY' })
      }

      return options
   }, [orderTabFulfillmentType, availableStoreType])

   const [userCoordinate, setUserCoordinate] = useState({
      latitude: null,
      longitude: null,
   })
   const [locationSearching, setLocationSearching] = useState({
      error: false,
      loading: false,
      errorType: '',
   })
   const [address, setAddress] = useState(null)
   const [fulfillmentType, setFulfillmentType] = useState(
      orderTabFulfillmentType.includes('ONDEMAND_DELIVERY')
         ? 'ONDEMAND_DELIVERY'
         : 'PREORDER_DELIVERY'
   )
   const [showRefineLocation, setShowRefineLocation] = useState(false)
   const [isGetStoresLoading, setIsGetStoresLoading] = useState(true)
   const [stores, setStores] = useState(null)

   useEffect(() => {
      if (address && brand.id) {
         async function fetchStores() {
            const brandClone = { ...brand }
            const availableStore = await getStoresWithValidations(
               brandClone,
               fulfillmentType,
               address,
               true
            )
            setStores(availableStore)
            setIsGetStoresLoading(false)
         }
         fetchStores()
      }
   }, [address, fulfillmentType, brand])

   // location by browser
   const locationByBrowser = () => {
      // if no location already exist in local and if browser not support geolocation api
      setLocationSearching(prev => ({
         ...prev,
         loading: !prev.loading,
         error: false,
      }))
      const geolocation = isClient ? window.navigator.geolocation : false

      if (geolocation) {
         const success = position => {
            const latitude = position.coords.latitude
            const longitude = position.coords.longitude
            setUserCoordinate(prev => ({ ...prev, latitude, longitude }))
         }
         const error = () => {
            setLocationSearching(prev => ({
               ...prev,
               loading: !prev.loading,
               error: true,
               errorType: 'blockByBrowser',
            }))
         }
         geolocation.getCurrentPosition(success, error)
      }
   }

   // get address by coordinates
   useEffect(() => {
      if (
         userCoordinate.latitude &&
         userCoordinate.longitude &&
         locationSearching.loading
      ) {
         fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${
               userCoordinate.latitude
            },${userCoordinate.longitude}&key=${get_env('GOOGLE_API_KEY')}`
         )
            .then(res => res.json())
            .then(data => {
               if (data.status === 'OK' && data.results.length > 0) {
                  const formatted_address =
                     data.results[0].formatted_address.split(',')
                  const mainText = formatted_address
                     .slice(0, formatted_address.length - 3)
                     .join(',')
                  const secondaryText = formatted_address
                     .slice(formatted_address.length - 3)
                     .join(',')
                  const address = {}
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
                  setIsGetStoresLoading(true)
                  setAddress(prev => ({
                     ...prev,
                     mainText,
                     secondaryText,
                     ...address,
                     latitude: userCoordinate.latitude,
                     longitude: userCoordinate.longitude,
                  }))

                  setLocationSearching(prev => ({
                     ...prev,
                     loading: false,
                  }))
               }
            })
            .catch(e => {
               console.log('error', e)
               setLocationSearching(prev => ({
                  ...prev,
                  loading: false,
                  error: true,
                  errorType: 'fetchAddress',
               }))
            })
      }
   }, [userCoordinate])

   const [loaded, error] = useScript(
      isClient
         ? `https://maps.googleapis.com/maps/api/js?key=${get_env(
              'GOOGLE_API_KEY'
           )}&libraries=places`
         : ''
   )
   const formatAddress = async input => {
      if (!isClient) return 'Runs only on client side.'
      const response = await fetch(
         `https://maps.googleapis.com/maps/api/geocode/json?key=${
            isClient ? get_env('GOOGLE_API_KEY') : ''
         }&address=${encodeURIComponent(input.description)}`
      )
      const data = await response.json()
      if (data.status === 'OK' && data.results.length > 0) {
         const [result] = data.results
         const userLocation = {
            latitude: result.geometry.location.lat.toString(),
            longitude: result.geometry.location.lng.toString(),
         }
         const address = {
            mainText: input.structured_formatting.main_text,
            secondaryText: input.structured_formatting.secondary_text,
         }
         result.address_components.forEach(node => {
            if (node.types.includes('street_number')) {
               address.line2 = `${node.long_name} `
            }
            if (node.types.includes('route')) {
               address.line2 += node.long_name
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
         if (address.zipcode) {
            setUserCoordinate(prev => ({ ...prev, ...userLocation }))
            setIsGetStoresLoading(true)
            setAddress({ ...userLocation, ...address })
         } else {
            showWarningPopup()
         }
      }
   }
   const showWarningPopup = () => {
      Modal.warning({
         title: `Please select a precise location. Try typing a landmark near your house.`,
         maskClosable: true,
         centered: true,
      })
   }
   console.log('availableStores', stores)
   if (!orderTabFulfillmentType) {
      return <Loader inline />
   }

   return (
      <div className="hern-store-location__fulfillment-type-wrapper">
         {/* get location */}
         <div
            className={classNames(
               'hern-store-location__preOrder-time-selection'
            )}
         >
            <Radio.Group
               options={deliveryRadioOptions}
               onChange={e => {
                  setFulfillmentType(e.target.value)
                  setIsGetStoresLoading(true)
               }}
               value={fulfillmentType}
            />
         </div>
         <div className="hern-store-location-selector-main">
            <div className="hern-store-location-selector-main__location-field">
               {loaded &&
                  !error &&
                  LocationSelectorConfig.informationVisibility.deliverySettings
                     .userAddressInput.value && (
                     <GooglePlacesAutocomplete
                        inputClassName="hern-store-location-selector-main__location-input"
                        onSelect={data => formatAddress(data)}
                        placeholder={
                           LocationSelectorConfig.informationVisibility
                              .deliverySettings.userAddressInputPlaceHolder
                              .value || 'Enter your delivery location'
                        }
                     />
                  )}

               <div
                  className="hern-store-location-selector-main__get-current-location"
                  onClick={locationByBrowser}
               >
                  <GPSIcon />
                  <span>Get Current Location</span>
               </div>
               {/* <RefineLocation /> */}
               {locationSearching.error &&
                  locationSearching.errorType === 'blockByBrowser' && (
                     <span className="hern-store-location-selector-main__get-current-location-error-message">
                        You have blocked this site from tracking your location.
                        To use this, change your location settings in browser.
                     </span>
                  )}
            </div>
         </div>

         {locationSearching.loading ? (
            <p style={{ padding: '1em' }}>Getting your location...</p>
         ) : locationSearching.error ? (
            <p style={{ padding: '1em', fontWeight: 'bold' }}>
               Unable to find location
            </p>
         ) : address ? (
            <div className="hern-store-location-selector__user-location">
               {LocationSelectorConfig.informationVisibility.deliverySettings
                  .userAddress.value && <AddressInfo address={address} />}
            </div>
         ) : null}

         {/* Footer */}
         {!address ? null : isGetStoresLoading ? (
            <div
               style={{
                  padding: '1em',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
               }}
            >
               <img
                  src="/assets/gifs/findingLocation.gif"
                  width={72}
                  height={72}
               />
               <span>Finding nearest store location to you</span>
            </div>
         ) : stores?.length == 0 ? (
            <div
               style={{
                  padding: '0 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
               }}
            >
               <NotFound style={{ margin: '10px 0' }} />
               <span
                  style={{
                     fontWeight: 'bold',
                     color: 'rgba(64, 64, 64, 0.8)',
                     fontStyle: 'italic',
                     lineHeight: '26px',
                  }}
               >
                  No store available on this location.{' '}
               </span>
            </div>
         ) : isGetStoresLoading ? (
            <div
               style={{
                  padding: '1em',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
               }}
            >
               <img
                  src="/assets/gifs/findingLocation.gif"
                  width={72}
                  height={72}
               />
               <span>Finding nearest store location to you</span>
            </div>
         ) : (
            <StoreList
               setShowLocationSelectionPopup={setShowLocationSelectionPopup}
               settings={settings}
               stores={stores}
               fulfillmentType={fulfillmentType}
               storeDistanceValidation={true}
               address={address}
               setShowRefineLocation={setShowRefineLocation}
               showRefineLocation={showRefineLocation}
            />
         )}
      </div>
   )
}

// user's address
