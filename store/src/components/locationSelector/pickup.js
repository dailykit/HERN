import React, { useEffect, useState } from 'react'
import { Modal, Radio, Skeleton } from 'antd'
import classNames from 'classnames'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import { GoogleSuggestionsList, Loader } from '..'
import { GPSIcon, NotFound } from '../../assets/icons'
import { useTranslation } from '../../context'
import { useConfig } from '../../lib'
import {
   getStoresWithValidations,
   get_env,
   isClient,
   useScript,
} from '../../utils'
import { StoreList } from '../locationSelector/storeList'
import LocationSelectorConfig from '../locatoinSeletorConfig.json'
import { AddressInfo } from './addressInfo'

export const Pickup = props => {
   // user location need only for show distance from user location
   const { t } = useTranslation()
   // if there is no user location we will show all store which available for pickup
   const { pickupType: storePickupType, userAddress } =
      LocationSelectorConfig.informationVisibility.pickupSettings

   const availableStoreType =
      storePickupType.value.length > 0
         ? storePickupType.value.map(x => x.value)
         : storePickupType.default.map(x => x.value)

   const { setShowLocationSelectionPopup, settings } = props

   const { brand, orderTabs } = useConfig()

   const orderTabFulfillmentType = React.useMemo(
      () =>
         orderTabs
            ? orderTabs.map(eachTab => eachTab.orderFulfillmentTypeLabel)
            : null,
      [orderTabs]
   )
   const [pickupType, setPickupType] = useState(
      Boolean(availableStoreType.find(x => x === 'ONDEMAND'))
         ? 'ONDEMAND'
         : availableStoreType[0]
   )

   const pickupRadioOptions = React.useMemo(() => {
      let options = []
      if (
         orderTabFulfillmentType &&
         orderTabFulfillmentType.includes('ONDEMAND_PICKUP') &&
         Boolean(availableStoreType.find(x => x === 'ONDEMAND'))
      ) {
         options.push({
            label: <span>{t('Now')}</span>,
            value: 'ONDEMAND_PICKUP',
         })
      }
      if (
         orderTabFulfillmentType &&
         orderTabFulfillmentType.includes('PREORDER_PICKUP') &&
         Boolean(availableStoreType.find(x => x === 'PREORDER'))
      ) {
         options.push({
            label: <span>{t('Later')}</span>,
            value: 'PREORDER_PICKUP',
         })
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
      orderTabFulfillmentType.includes('ONDEMAND_PICKUP')
         ? 'ONDEMAND_PICKUP'
         : 'PREORDER_PICKUP'
   )
   const [isGetStoresLoading, setIsGetStoresLoading] = useState(true)
   const [stores, setStores] = useState(null)

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
            console.log('availableStoreInPickup', availableStore)
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
            const userLocationInfo = {
               latitude,
               longitude,
            }
            setUserCoordinate(prev => ({ ...prev, latitude, longitude }))
            // localStorage.setItem(
            //    'userLocation',
            //    JSON.stringify(userLocationInfo)
            // )
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
      if (userCoordinate.latitude && userCoordinate.longitude) {
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
                  address.line1 = formatted_address
                     .slice(0, formatted_address.length - 3)
                     .join(',')
                  address.line2 = ''
                  data.results[0].address_components.forEach(node => {
                     if (node.types.includes('sublocality_level_3')) {
                        address.line2 += `${node.long_name} `
                     }
                     if (node.types.includes('sublocality_level_2')) {
                        address.line2 += `${node.long_name} `
                     }
                     if (node.types.includes('sublocality_level_1')) {
                        address.line2 += `${node.long_name} `
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
                  setIsGetStoresLoading(true)
                  setAddress(prev => ({
                     ...prev,
                     mainText,
                     secondaryText,
                     ...address,
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
      const response = await fetch(
         `${SERVER_URL}/server/api/place/details/json?key=${
            isClient ? get_env('GOOGLE_API_KEY') : ''
         }&placeid=${input.place_id}&language=en`
      )

      const data = await response.json()
      // console.log('this is data', data)
      if (data.status === 'OK' && data.result) {
         const result = data.result
         const userCoordinate = {
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
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
            setUserCoordinate(prev => ({ ...prev, ...userCoordinate }))
            setIsGetStoresLoading(true)
            setAddress({ ...userCoordinate, address })
         } else {
            showWarningPopup()
         }

         // localStorage.setItem(
         //    'userLocation',
         //    JSON.stringify({ ...userLocation, address })
         // )
      }
   }
   const showWarningPopup = () => {
      Modal.warning({
         title: `Please select a precise location. Try typing a landmark near your house.`,
         maskClosable: true,
         centered: true,
      })
   }
   if (!orderTabFulfillmentType) {
      return <Loader inline />
   }
   return (
      <div className="hern-store-location__fulfillment-type-wrapper">
         <div
            className={classNames(
               'hern-store-location__preOrder-time-selection'
            )}
         >
            <Radio.Group
               options={pickupRadioOptions}
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
                  LocationSelectorConfig.informationVisibility.pickupSettings
                     .userAddressInput.value && (
                     <div
                        style={{
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'space-between',
                           position: 'relative',
                        }}
                     >
                        <div
                           style={{
                              width: '100%',
                           }}
                        >
                           <GooglePlacesAutocomplete
                              inputClassName="hern-store-location-selector-main__location-input"
                              onSelect={data => formatAddress(data)}
                              placeholder={
                                 LocationSelectorConfig.informationVisibility
                                    .pickupSettings.userAddressInputPlaceHolder
                                    .value || 'Enter your address'
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
                        </div>
                        <div
                           className="hern-store-location-selector-main__get-current-location"
                           onClick={locationByBrowser}
                        >
                           <GPSIcon />
                        </div>
                     </div>
                  )}

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
               {userAddress.value && <AddressInfo address={address} />}
            </div>
         ) : null}
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
            />
         )}
      </div>
   )
}
