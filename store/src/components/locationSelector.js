import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import GoogleMapReact from 'google-map-react'
import {
   CloseIcon,
   DistanceIcon,
   GPSIcon,
   LocationMarker,
   RadioIcon,
   StoreIcon,
} from '../assets/icons'
import {
   useScript,
   isClient,
   get_env,
   isStoreDeliveryAvailable,
} from '../utils'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import { Loader } from './index'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import { useConfig } from '../lib'
import axios from 'axios'
import _ from 'lodash'
import { getDistance, convertDistance } from 'geolib'
import { CSSTransition } from 'react-transition-group'
import LocationSelectorConfig from './locatoinSeletorConfig.json'
import { Button } from './button'
import {
   BRAND_LOCATIONS,
   BRAND_ONDEMAND_DELIVERY_RECURRENCES,
} from '../graphql'

// this Location selector is a pop up for mobile view so can user can select there location

export const LocationSelector = props => {
   // WARNING this component using settings so whenever using this component make sure this component can access settings
   const { setShowLocationSelectionPopup, settings } = props

   const { brand } = useConfig()

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
   const [brandRecurrences, setBrandRecurrences] = useState(null)

   React.useEffect(() => {
      document.querySelector('body').style.overflowY = 'hidden'
      return () => (document.querySelector('body').style.overflowY = 'auto')
   })
   React.useEffect(() => {
      const userLocation = JSON.parse(localStorage.getItem('userLocation'))
      if (userLocation && userLocation.address) {
         setLocationSearching(prev => ({ ...prev, loading: !prev.loading }))
         setAddress(userLocation.address)
         setLocationSearching(prev => ({ ...prev, loading: !prev.loading }))
      }
   }, [])
   const [loaded, error] = useScript(
      isClient
         ? `https://maps.googleapis.com/maps/api/js?key=${get_env(
              'GOOGLE_API_KEY'
           )}&libraries=places`
         : ''
   )
   // console.log('locationSearching', locationSearching)
   // location by browser
   const locationByBrowser = () => {
      // if no location already exist in local and if browser not support geolocation api
      setLocationSearching(prev => ({
         ...prev,
         loading: !prev.loading,
         error: false,
      }))
      if (window.navigator.geolocation) {
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
         window.navigator.geolocation.getCurrentPosition(success, error)
      }
   }

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
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
         }
         setUserCoordinate(prev => ({ ...prev, ...userLocation }))
         const address = {
            mainText: input.structured_formatting.main_text,
            secondaryText: input.structured_formatting.secondary_text,
         }
         result.address_components.forEach(node => {
            if (node.types.includes('postal_code')) {
               address.zipcode = node.long_name
            }
         })
         setAddress(address)
         localStorage.setItem(
            'userLocation',
            JSON.stringify({ ...userLocation, address })
         )
      }
   }

   // get all store when user address available
   const {
      loading: brandLocationLoading,
      data: { brands_brand_location_aggregate = {} } = {},
   } = useQuery(BRAND_LOCATIONS, {
      skip: !address?.city || !address?.state || !brand || !brand?.id,
      variables: {
         where: {
            _or: [
               {
                  location: {
                     city: { _eq: address?.city },
                     state: { _eq: address?.state },
                  },
               },
               {
                  _or: [
                     { doesDeliverOutsideCity: { _eq: true } },
                     { doesDeliverOutsideState: { _eq: true } },
                  ],
               },
            ],
            brandId: { _eq: brand.id },
         },
      },
      onCompleted: data => {
         // console.log('brandLocationDataa', data)
      },
      onError: error => {
         console.log(error)
      },
   })

   const { loading: brandRecurrencesLoading } = useQuery(
      BRAND_ONDEMAND_DELIVERY_RECURRENCES,
      {
         skip:
            !brands_brand_location_aggregate?.nodes ||
            !brands_brand_location_aggregate?.nodes.length > 0 ||
            !brand ||
            !brand.id,
         variables: {
            where: {
               recurrence: {
                  isActive: { _eq: true },
                  type: { _eq: 'ONDEMAND_DELIVERY' },
               },
               _or: [
                  {
                     brandLocationId: {
                        _in: brands_brand_location_aggregate?.nodes?.map(
                           x => x.id
                        ),
                     },
                  },
                  { brandId: { _eq: brand.id } },
               ],
               isActive: { _eq: true },
            },
         },
         onCompleted: data => {
            console.log('this is recurrences data', data)
            if (data) {
               setBrandRecurrences(data.brandRecurrences)
            }
         },
      }
   )
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
                     ...prev,
                     mainText,
                     secondaryText,
                     ...address,
                  }))
                  localStorage.setItem(
                     'userLocation',
                     JSON.stringify({
                        latitude: userCoordinate.latitude,
                        longitude: userCoordinate.longitude,
                        address: {
                           mainText,
                           secondaryText,
                           ...address,
                        },
                     })
                  )
                  setLocationSearching(prev => ({
                     ...prev,
                     loading: !prev.loading,
                  }))
               }
            })
            .catch(e => {
               console.log('error', e)
               setLocationSearching(prev => ({
                  ...prev,
                  loading: !prev.loading,
                  error: true,
                  errorType: 'fetchAddress',
               }))
            })
      }
   }, [userCoordinate])

   return (
      <div className={classNames('hern-store-location-selector')}>
         <div className="hern-store-location-selector-container">
            {/* Header */}
            <div className="hern-store-location-selector-header">
               <div className="hern-store-location-selector-header-left">
                  <CloseIcon
                     size={16}
                     color="#404040CC"
                     stroke="currentColor"
                     onClick={() => setShowLocationSelectionPopup(false)}
                  />
                  <span>Location</span>
               </div>
               <div>
                  <span>Skip</span>
               </div>
            </div>
            {/* get location */}
            <div className="hern-store-location-selector-main">
               <div className="hern-store-location-selector-main__location-field">
                  {loaded &&
                     !error &&
                     LocationSelectorConfig.informationVisibility
                        .deliverySettings.userAddressInput.value && (
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
                  {locationSearching.error &&
                     locationSearching.errorType === 'blockByBrowser' && (
                        <span className="hern-store-location-selector-main__get-current-location-error-message">
                           You have blocked this site from tracking your
                           location. To use this, change your location settings
                           in browser.
                        </span>
                     )}
               </div>
            </div>
            {locationSearching.loading ? (
               <Loader />
            ) : locationSearching.error ? (
               <p>unable to find location</p>
            ) : address ? (
               <div className="hern-store-location-selector__user-location">
                  {LocationSelectorConfig.informationVisibility.deliverySettings
                     .userAddress.value && <AddressInfo address={address} />}
               </div>
            ) : null}
            {/* <RefineLocation setUserCoordinate={setUserCoordinate} /> */}
            {/* Footer */}
            {address && (
               <StoreList
                  userCoordinate={userCoordinate}
                  setShowLocationSelectionPopup={setShowLocationSelectionPopup}
                  settings={settings}
                  brandRecurrences={brandRecurrences}
               />
            )}
            <div className="hern-store-location-selector-footer"></div>
         </div>
      </div>
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

const RefineLocation = props => {
   // props
   const { setUserCoordinate } = props

   // component state
   const [centerCoordinate, setCenterCoordinate] = useState({})

   // defaultProps for google map
   const defaultProps = {
      center: {
         lat: 26.90316230216457,
         lng: 75.73522352265464,
      },
      zoom: 16,
   }

   const onClickOnMap = () => {
      console.log('hello')
   }

   const onChangeMap = (center, zoom, bounds, marginBounds) => {
      // console.log('onChange', center, zoom, bounds, marginBounds)
      setCenterCoordinate(prev => ({
         ...prev,
         latitude: center.lat,
         longitude: center.lng,
      }))
   }

   const handleUpdateClick = () => {
      setUserCoordinate(centerCoordinate)
   }
   return (
      <>
         <div>
            <span>Refine your location </span>{' '}
            <button onClick={handleUpdateClick}>Update</button>
         </div>
         <div>
            <div style={{ height: '100vh', width: '100%' }}>
               <GoogleMapReact
                  bootstrapURLKeys={{ key: get_env('GOOGLE_API_KEY') }}
                  defaultCenter={defaultProps.center}
                  defaultZoom={defaultProps.zoom}
                  onClick={onClickOnMap}
                  onChildClick={(a, b, c, d) => {
                     console.log('childClick', a, b, c, d)
                  }}
                  onChange={onChangeMap}
               ></GoogleMapReact>
            </div>
         </div>
      </>
   )
}
const GET_BRAND_LOCATION = gql`
   query GET_BRAND_LOCATION($where: brands_brand_location_bool_exp!) {
      brands_brand_location(where: $where) {
         id
         brandId
         location {
            id
            locationAddress
            label
            zipcode
            city
            state
            lat
            lng
            country
         }
      }
   }
`
const StoreList = props => {
   const {
      userCoordinate,
      setShowLocationSelectionPopup,
      settings,
      brandRecurrences,
   } = props
   // console.log('settings', settings)

   const { brand } = useConfig()

   const {
      showAerialDistance,
      showStoreAddress,
      showLocationLabel,
      cardSelectionStyle,
      selectionButtonLabel,
   } = LocationSelectorConfig.informationVisibility.deliveryLocationCard
   const { showStoresOnMap, disabledLocationDisplayStyle } =
      LocationSelectorConfig.informationVisibility.deliverySettings

   const [brandLocation, setBrandLocation] = useState(null)
   const [sortedBrandLocation, setSortedBrandLocation] = useState(null)
   const [selectedStore, setSelectedStore] = useState(null)
   const [showStoreOnMap, setShowStoreOnMap] = useState(false)
   const [status, setStatus] = useState('loading')

   // get all store
   const { loading: storeLoading, error: storeError } = useQuery(
      GET_BRAND_LOCATION,
      {
         skip: !(brand || brand.id),
         variables: {
            where: {
               brandId: {
                  _eq: brand.id,
               },
            },
         },
         onCompleted: ({ brands_brand_location = [] }) => {
            setBrandLocation(brands_brand_location)
            if (brands_brand_location.length !== 0) {
               setBrandLocation(brands_brand_location)
               // getDataWithDrivableDistance(brands_brand_location)
               console.log('brands_brand_location', brands_brand_location)
            }
         },
         onError: error => {
            console.log('getBrandLocationError', error)
         },
      }
   )

   // get distance
   const getDataWithDrivableDistance = async brandLocation => {
      try {
         const origin = isClient ? window.location.origin : ''
         const url = `${origin}/server/api/distance-matrix`
         const userLocationInLocal = JSON.parse(
            localStorage.getItem('userLocation')
         )
         brandLocation.forEach(async (eachLocation, index) => {
            const postLocationData = {
               key: get_env('GOOGLE_API_KEY'),
               lat1: userLocationInLocal.latitude,
               lon1: userLocationInLocal.longitude,
               lat2: eachLocation.location.locationAddress.locationCoordinates
                  .latitude,
               lon2: eachLocation.location.locationAddress.locationCoordinates
                  .longitude,
            }
            const data = await getDrivableData(postLocationData, url)
            const mapData = data.map(x => {
               x['distance'] = x.rows[0].elements[0].distance
               x['duration'] = x.rows[0].elements[0].duration
               return x
            })
            setBrandLocation(prev => {
               prev[index] = {
                  ...prev[index],
                  drivableDistanceDetails: mapData,
               }
               return prev
            })
         })
      } catch (error) {
         console.log('getDataWithDrivableDistance', error)
      }
   }

   useEffect(() => {
      if (brandLocation) {
         setSortedBrandLocation(getAerialDistance(brandLocation, true))
      }
   }, [brandLocation, brandRecurrences])

   useEffect(() => {
      if (
         sortedBrandLocation &&
         sortedBrandLocation.every(eachStore =>
            Boolean(eachStore.deliveryStatus)
         )
      ) {
         setSelectedStore(
            sortedBrandLocation.filter(
               eachStore => eachStore.deliveryStatus.status
            )[0]
         )
         if (
            LocationSelectorConfig.informationVisibility.deliverySettings
               .storeLocationSelectionMethod.value.value === 'auto'
         ) {
            // select automatically first store form sorted array
            console.log(
               'your automatic store is',
               sortedBrandLocation.filter(
                  eachStore => eachStore.deliveryStatus.status
               )[0]
            )
            setShowLocationSelectionPopup(false)
         }
      }
   }, [sortedBrandLocation])

   const getAerialDistance = (data, sorted = false) => {
      const userLocation = JSON.parse(localStorage.getItem('userLocation'))

      // add arial distance
      const dataWithAerialDistance = data.map(eachStore => {
         const aerialDistance = getDistance(
            userLocation,
            eachStore.location.locationAddress.locationCoordinates,
            0.1
         )
         const aerialDistanceInMiles = convertDistance(aerialDistance, 'mi')
         eachStore['aerialDistance'] = parseFloat(
            aerialDistanceInMiles.toFixed(2)
         )
         eachStore['distanceUnit'] = 'mi'
         if (brandRecurrences) {
            const deliveryStatus = isStoreDeliveryAvailable(
               brandRecurrences,
               eachStore
            )
            eachStore['deliveryStatus'] = deliveryStatus
         }
         return eachStore
      })
      // sort by distance
      if (sorted) {
         const sortedDataWithAerialDistance = _.sortBy(dataWithAerialDistance, [
            x => x.aerialDistance,
         ])
         if (brandRecurrences) {
            setStatus('success')
         }
         return sortedDataWithAerialDistance
      }
      return dataWithAerialDistance
   }

   // auto select mode
   if (
      LocationSelectorConfig.informationVisibility.deliverySettings
         .storeLocationSelectionMethod.value.value === 'auto'
   ) {
      return null
   }

   // sorted and location calculating
   if (
      brandRecurrences === null ||
      sortedBrandLocation === null ||
      status === 'loading'
   ) {
      return <Loader />
   }

   // when no store available on user location
   if (sortedBrandLocation.length === 0) {
      return <p>No Store Available</p>
   }

   // when there is no stores which do not fulfill delivery time and mile range for brandRecurrences
   if (!sortedBrandLocation.some(store => store.deliveryStatus.status)) {
      return (
         <div className="hern-location-selector__stores-list">
            {sortedBrandLocation[0].deliveryStatus.message}
         </div>
      )
   }

   // when there is no stores which do not fulfill timing but does not fulfill delivery conditions (aerial distance, zipcodes, geoboundry)
   if (
      !sortedBrandLocation.some(store => {
         const sortedStatus = store.deliveryStatus.result
         if (sortedStatus) {
            const { aerial, zipcode, geoBoundary } = sortedStatus
            return aerial && zipcode && geoBoundary
         }
         return false
      })
   ) {
      return (
         <div className="hern-location-selector__stores-list">
            NO store Available on this location
         </div>
      )
   }

   // some store fulfill all conditions (not all store )
   return (
      <div className="hern-location-selector__stores-list">
         {showStoresOnMap.value && (
            <div className="hern-location-selector__view-on-map">
               <span onClick={() => setShowStoreOnMap(true)}>View on map</span>
            </div>
         )}
         {sortedBrandLocation.map((eachStore, index) => {
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
               !eachStore.deliveryStatus.status &&
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
                              'disabled' && !eachStore.deliveryStatus.status,
                     }
                  )}
                  onClick={() => {
                     eachStore.deliveryStatus.status &&
                        setSelectedStore(eachStore)
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
                     disabledLocationDisplayStyle.value?.value === 'disabled' &&
                     !eachStore.deliveryStatus.status(
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
         <StoresOnMap
            showStoreOnMap={showStoreOnMap}
            setShowStoreOnMap={setShowStoreOnMap}
            brandLocation={brandLocation}
            settings={settings}
         />
      </div>
   )
}

const getDrivableData = async (postLocationData, url) => {
   const { data } = await axios.post(url, postLocationData)
   console.log('this is data with drivable distance', data)
   return data
}

const StoresOnMap = props => {
   const { brandLocation, settings, showStoreOnMap, setShowStoreOnMap } = props

   const defaultCenter = localStorage.getItem('userLocation')
   const { latitude, longitude } = React.useMemo(
      () => defaultCenter && JSON.parse(defaultCenter),
      [defaultCenter]
   )

   // defaultProps for google map
   const defaultProps = {
      ...(JSON.parse(defaultCenter) && {
         center: {
            lat: latitude,
            lng: longitude,
         },
      }),
      zoom: 16,
   }

   const UserLocationMarker = () => {
      return (
         <div style={{ position: 'relative', width: '48px', height: '48px' }}>
            <LocationMarker
               size={48}
               style={{
                  position: 'absolute',
                  top: '-48px',
                  left: '-24px',
               }}
            />
         </div>
      )
   }

   const StoreLocationMarker = props => {
      const { settings, storeDetails } = props

      const [clickedStoreId, setClickedStoreId] = useState(null)
      return (
         <div className="hern-store-selector__store-location-map-store-marker">
            <div
               className={classNames(
                  'hern-store-selector__store-location-map-store-detail-pop',
                  {
                     'hern-store-selector__store-location-map-store-detail-pop--active':
                        clickedStoreId === storeDetails.id,
                  }
               )}
            >
               <div className="hern-store-selector__store-location-map-store-detail-pop-content">
                  <div className="hern-store-selector__store-location-map-store-detail-pop-close-icon">
                     <CloseIcon
                        size={16}
                        color="#404040CC"
                        stroke="currentColor"
                        onClick={() => {
                           setClickedStoreId(null)
                        }}
                     />
                  </div>
                  <div className="hern-store-selector__store-location-map-store-detail-pop__store">
                     <span className="hern-store-selector__store-location-map-store-detail-pop__store-label">
                        Chitrakoot
                     </span>
                     <div className="hern-store-selector__store-location-map-store-detail-pop__address">
                        <label className="hern-store-selector__store-location-map-store-detail-pop__address-label hern-store-selector__store-location-map-store-detail-pop__info-label">
                           Address
                        </label>
                        <span className="hern-store-selector__store-location-map-store-detail-pop__address-line1 hern-store-selector__store-location-map-store-detail-pop__address__info">
                           WP2Q+QG7
                        </span>
                        <span className="hern-store-selector__store-location-map-store-detail-pop__address-line2 hern-store-selector__store-location-map-store-detail-pop__address__info">
                           Akruti Appartments, Chitrakoot
                        </span>
                        <span className="hern-store-selector__store-location-map-store-detail-pop__address-C-S-C hern-store-selector__store-location-map-store-detail-pop__address__info">
                           Jaipur, Rajasthan (India)
                        </span>
                     </div>
                     <div className="hern-store-selector__store-location-map-store-detail-pop__timing">
                        <label className="hern-store-selector__store-location-map-store-detail-pop__timing-label hern-store-selector__store-location-map-store-detail-pop__info-label">
                           Today’s Delivery Hours
                        </label>
                        <span className="hern-store-selector__store-location-map-store-detail-pop__timing-timing">
                           Mon-Sun : 12:00PM-10:00PM
                        </span>
                     </div>
                  </div>
                  <Button className="hern-store-selector__store-location-map-store-detail__store-btn">
                     View Store
                  </Button>
               </div>
            </div>
            <img
               className={'hern-store-selector__store-location-map-store-icon'}
               src={settings.brand['theme-brand'].logo.url}
               onClick={() => {
                  setClickedStoreId(storeDetails.id)
                  console.log(storeDetails)
               }}
            />
         </div>
      )
   }
   return (
      <CSSTransition
         in={showStoreOnMap}
         timeout={300}
         unmountOnExit
         classNames="hern-store-location-selector__store-on-map-css-transition"
      >
         <div className="hern-store-location-selector__store-on-map-container">
            <div className="hern-store-location-selector__store-on-map-header">
               <div className="hern-store-location-selector__store-on-map-header-right">
                  <CloseIcon
                     size={16}
                     color="#404040CC"
                     stroke="currentColor"
                     onClick={() => {
                        setShowStoreOnMap(false)
                     }}
                  />
                  <span>Stores on map</span>
               </div>
            </div>
            <div className="hern-store-location-selector__store-on-map-map">
               <GoogleMapReact
                  bootstrapURLKeys={{ key: get_env('GOOGLE_API_KEY') }}
                  defaultCenter={defaultProps.center}
                  defaultZoom={defaultProps.zoom}
               >
                  <UserLocationMarker lat={latitude} lng={longitude} />
                  {brandLocation.map((eachBrand, index) => {
                     const { latitude, longitude } =
                        eachBrand.location.locationAddress.locationCoordinates
                     return (
                        <StoreLocationMarker
                           key={index}
                           lat={latitude}
                           lng={longitude}
                           storeDetails={eachBrand}
                           settings={settings}
                        />
                     )
                  })}
               </GoogleMapReact>
            </div>
         </div>
      </CSSTransition>
   )
}
