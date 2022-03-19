import React, { useState } from 'react'
import { useEffect } from 'react'
import { useToasts } from 'react-toast-notifications'
import { useConfig } from '../../lib'
import { get_env, isClient } from '../../utils'
import classNames from 'classnames'

import LocationSelectorConfig from '../locatoinSeletorConfig.json'
import { DistanceIcon, RadioIcon, StoreIcon } from '../../assets/icons'
import { RefineLocationPopup } from '../refineLocation'
import { MUTATIONS } from '../../graphql'
import { useMutation } from '@apollo/react-hooks'
import { useCart, useTranslation, useUser } from '../../context'
const ReactPixel = isClient ? require('react-facebook-pixel').default : null

// render all available stores
export const StoreList = props => {
   const {
      setShowLocationSelectionPopup,
      settings,
      stores,
      fulfillmentType,
      storeDistanceValidation = false,
      address,
      setShowRefineLocation,
      showRefineLocation = false,
      setAddress,
      setIsUserExistingAddressSelected,
      isUserExistingAddressSelected,
   } = props
   // console.log('settings', settings)
   const { dispatch, orderTabs } = useConfig()
   const { addToast } = useToasts()
   const { t } = useTranslation()
   const { methods, storedCartId } = useCart()
   const { user } = useUser()

   const {
      showAerialDistance,
      showStoreAddress,
      showLocationLabel,
      cardSelectionStyle,
      selectionButtonLabel,
   } = LocationSelectorConfig.informationVisibility.deliveryLocationCard
   const { showStoresOnMap, disabledLocationDisplayStyle } =
      LocationSelectorConfig.informationVisibility.deliverySettings

   const [selectedStore, setSelectedStore] = useState(null)
   const [showStoreOnMap, setShowStoreOnMap] = useState(false)
   const [status, setStatus] = useState('loading')

   const selectedOrderTab = React.useMemo(() => {
      return orderTabs.find(
         x => x.orderFulfillmentTypeLabel === fulfillmentType
      )
   }, [orderTabs])

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

   useEffect(() => {
      const firstStoreOfSortedBrandLocation = stores.filter(
         eachStore => eachStore['fulfillmentStatus'].status
      )[0]
      if (
         firstStoreOfSortedBrandLocation &&
         LocationSelectorConfig.informationVisibility.deliverySettings
            .storeLocationSelectionMethod.value.value === 'auto'
      ) {
         if (
            (fulfillmentType === 'ONDEMAND_DELIVERY' ||
               fulfillmentType === 'PREORDER_DELIVERY') &&
            !isUserExistingAddressSelected
         ) {
            setShowRefineLocation(true)
            return
         }
         if (
            (fulfillmentType === 'ONDEMAND_DELIVERY' ||
               fulfillmentType === 'PREORDER_DELIVERY') &&
            isUserExistingAddressSelected
         ) {
            const customerAddress = {
               line1: address.line1,
               line2: address.line2,
               city: address.city,
               state: address.state,
               country: address.country,
               zipcode: address.zipcode,
               notes: address.notes,
               label: address.label,
               lat: address.latitude?.toString(),
               lng: address.longitude?.toString(),
               landmark: address.landmark,
               searched: '',
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
                        locationId: firstStoreOfSortedBrandLocation.location.id,
                        orderTabId: selectedOrderTab.id,
                     },
                  },
               })
            }
            dispatch({
               type: 'SET_LOCATION_ID',
               payload: firstStoreOfSortedBrandLocation.location.id,
            })
            dispatch({
               type: 'SET_SELECTED_ORDER_TAB',
               payload: selectedOrderTab,
            })
            dispatch({
               type: 'SET_USER_LOCATION',
               payload: {
                  ...address,
                  latitude: address.lat.toString(),
                  longitude: address.lng.toString(),
               },
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
               firstStoreOfSortedBrandLocation.location.id
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
               JSON.stringify(firstStoreOfSortedBrandLocation.location.id)
            )
            localStorage.setItem(
               'userLocation',
               JSON.stringify({
                  ...address,
                  latitude: address.lat.toString(),
                  longitude: address.lng.toString(),
               })
            )
            setShowLocationSelectionPopup(false)
         }
      }
   }, [stores])

   const onRefineLocationCloseIconClick = () => {
      setAddress(null)
   }

   // run when click on save and proceed
   const onRefineLocationComplete = () => {
      setShowLocationSelectionPopup(false)
   }

   // auto select mode
   if (
      LocationSelectorConfig.informationVisibility.deliverySettings
         .storeLocationSelectionMethod.value.value === 'auto' &&
      (fulfillmentType === 'ONDEMAND_DELIVERY' ||
         fulfillmentType === 'PREORDER_DELIVERY')
   ) {
      return (
         <RefineLocationPopup
            showRefineLocation={showRefineLocation}
            setShowRefineLocation={setShowRefineLocation}
            address={address}
            fulfillmentType={fulfillmentType}
            onRefineLocationCloseIconClick={onRefineLocationCloseIconClick}
            onRefineLocationComplete={onRefineLocationComplete}
         />
      )
   }

   // when no store available on user location
   if (stores.length === 0) {
      return <p>{t('No Store Available')}</p>
   }
   console.log('sortedBrandLocation', stores)
   // when there is no stores which do not fulfill delivery time and mile range for brandRecurrences
   if (!stores.some(store => store['fulfillmentStatus'].status)) {
      return (
         <div className="hern-location-selector__stores-list">
            {stores[0]['fulfillmentStatus'].message}
         </div>
      )
   }

   // when there is no stores which do not fulfill timing but does not fulfill delivery conditions (aerial distance, zipcodes, geoboundry)
   if (
      stores &&
      !stores.some(store => {
         const sortedStatus = store['fulfillmentStatus'].status
         if (sortedStatus) {
            return store['fulfillmentStatus'].status
         }
         return false
      })
   ) {
      return (
         <div className="hern-location-selector__stores-list">
            {t('NO store Available on this location')}
         </div>
      )
   }

   // some store fulfill all conditions (not all store )
   return (
      <div className="hern-location-selector__stores-list">
         {showStoresOnMap.value && (
            <div className="hern-location-selector__view-on-map">
               <span onClick={() => setShowStoreOnMap(true)}>{t('View on map')}</span>
            </div>
         )}
         <RefineLocationPopup
            showRefineLocation={showRefineLocation}
            address={address}
            fulfillmentType={fulfillmentType}
            onRefineLocationCloseIconClick={onRefineLocationCloseIconClick}
         />
         {stores.map((eachStore, index) => {
            const {
               location: {
                  label,
                  id,
                  locationAddress,
                  city,
                  state,
                  country,
                  zipcode,
               },
               aerialDistance,
               distanceUnit,
            } = eachStore
            const { line1, line2 } = locationAddress
            if (
               !eachStore['fulfillmentStatus'].status &&
               disabledLocationDisplayStyle.value?.value === 'noShow'
            ) {
               return null
            }
            return (
               <div
                  key={index}
                  className={classNames(
                     'hern-store-location-selector__each-store',
                     {
                        'hern-store-location-selector__each-store--border':
                           cardSelectionStyle.value?.value === 'border' &&
                           selectedStore &&
                           id === selectedStore.id,
                     },
                     {
                        'hern-store-location-selector__each-store--disabled':
                           disabledLocationDisplayStyle.value?.value ===
                           'disabled' &&
                           !eachStore['fulfillmentStatus'].status,
                     }
                  )}
                  onClick={() => {
                     if (eachStore['fulfillmentStatus'].status) {
                        const storeAddress = eachStore.location
                        const addressToBeSaveInCart = {
                           line1: storeAddress.locationAddress.line1,
                           line2: storeAddress.locationAddress.line2,
                           city: storeAddress.city,
                           state: storeAddress.state,
                           country: storeAddress.country,
                           zipcode: storeAddress.zipcode,
                           notes: '',
                           label: storeAddress.label,
                           lat: storeAddress.lat.toString(),
                           lng: storeAddress.lng.toString(),
                           landmark: '',
                           searched: '',
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
                                    address: addressToBeSaveInCart,
                                    locationId: storeAddress.id,
                                    orderTabId: selectedOrderTab.id,
                                 },
                              },
                           })
                        }
                        dispatch({
                           type: 'SET_LOCATION_ID',
                           payload: eachStore.location.id,
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
                        localStorage.setItem(
                           'orderTab',
                           JSON.stringify(fulfillmentType)
                        )
                        localStorage.setItem(
                           'storeLocationId',
                           JSON.stringify(eachStore.location.id)
                        )
                        localStorage.setItem(
                           'userLocation',
                           JSON.stringify({
                              ...address,
                           })
                        )
                        localStorage.setItem(
                           'pickupLocation',
                           JSON.stringify(addressToBeSaveInCart)
                        )
                        setSelectedStore(eachStore)
                        setShowLocationSelectionPopup(false)
                     }
                  }}
               >
                  <div className="hern-store-location-selector__store-location-info-container">
                     <StoreIcon />
                     <div className="hern-store-location-selector__store-location-details">
                        {showLocationLabel.value && (
                           <span className="hern-store-location__store-location-label">
                              {label}
                           </span>
                        )}
                        {showStoreAddress.value && (
                           <>
                              <span className="hern-store-location__store-location-address hern-store-location__store-location-address-line1">
                                 {line1}
                              </span>
                              <span className="hern-store-location__store-location-address hern-store-location__store-location-address-line2">
                                 {line2}
                              </span>
                              <span className="hern-store-location__store-location-address hern-store-location__store-location-address-c-s-c-z">
                                 {city} {state} {country}
                                 {' ('}
                                 {zipcode}
                                 {')'}
                              </span>
                           </>
                        )}
                     </div>
                  </div>
                  {cardSelectionStyle.value?.value === 'radio' &&
                     (storeDistanceValidation
                        ? !(
                           disabledLocationDisplayStyle.value?.value ===
                           'disabled' &&
                           !eachStore['fulfillmentStatus'].status
                        )
                        : true) && (
                        <RadioIcon
                           size={18}
                           showTick={selectedStore && id === selectedStore.id}
                        />
                     )}
                  <div className="hern-store-location-selector__time-distance">
                     {showAerialDistance.value && (
                        <div className="hern-store-location-selector__aerialDistance">
                           <DistanceIcon />
                           <span>
                              {aerialDistance} {distanceUnit}
                           </span>
                        </div>
                     )}
                  </div>
               </div>
            )
         })}
         {/* <StoresOnMap
             showStoreOnMap={showStoreOnMap}
             setShowStoreOnMap={setShowStoreOnMap}
             brandLocation={brandLocation}
             settings={settings}
             brandRecurrences={brandRecurrences}
             address={address}
          /> */}
      </div>
   )
}

// get distance
// const getDataWithDrivableDistance = async brandLocation => {
//    try {
//       const origin = isClient ? get_env('BASE_BRAND_URL') : ''
//       const url = `${origin}/server/api/distance-matrix`
//       const userLocationInLocal = JSON.parse(
//          localStorage.getItem('userLocation')
//       )
//       brandLocation.forEach(async (eachLocation, index) => {
//          const postLocationData = {
//             key: get_env('GOOGLE_API_KEY'),
//             lat1: userLocationInLocal.latitude,
//             lon1: userLocationInLocal.longitude,
//             lat2: eachLocation.location.locationAddress.locationCoordinates
//                .latitude,
//             lon2: eachLocation.location.locationAddress.locationCoordinates
//                .longitude,
//          }
//          const data = await getDrivableData(postLocationData, url)
//          const mapData = data.map(x => {
//             x['distance'] = x.rows[0].elements[0].distance
//             x['duration'] = x.rows[0].elements[0].duration
//             return x
//          })
//          setBrandLocation(prev => {
//             prev[index] = {
//                ...prev[index],
//                drivableDistanceDetails: mapData,
//             }
//             return prev
//          })
//       })
//    } catch (error) {
//       console.log('getDataWithDrivableDistance', error)
//    }
// }
const getDrivableData = async (postLocationData, url) => {
   const { data } = await axios.post(url, postLocationData)
   console.log('this is data with drivable distance', data)
   return data
}
