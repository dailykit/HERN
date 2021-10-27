import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import GoogleMapReact from 'google-map-react'
import { CloseIcon, GPSIcon } from '../assets/icons'
import { useScript, isClient, get_env } from '../utils'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import { Loader } from './index'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import { useConfig } from '../lib'
import axios from 'axios'
import _ from 'lodash'
import { getDistance } from 'geolib'

// this Location selector is a pop up for mobile view so can user can select there location

export const LocationSelector = props => {
   // props
   const { setShowLocationSelectionPopup } = props

   // component state
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
   console.log('locationSearching', locationSearching)
   // location by browser
   const locationByBrowser = () => {
      // if no location already exist in local and if browser not support geolocation api
      setLocationSearching(prev => ({ ...prev, loading: !prev.loading }))
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
            console.log('unable to get user location')
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
      console.log('input', input)
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
                  setAddress(prev => ({ ...prev, mainText, secondaryText }))
                  localStorage.setItem(
                     'userLocation',
                     JSON.stringify({
                        latitude: userCoordinate.latitude,
                        longitude: userCoordinate.longitude,
                        address: {
                           mainText,
                           secondaryText,
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
                  {loaded && !error && (
                     <GooglePlacesAutocomplete
                        inputClassName="hern-store-location-selector-main__location-input"
                        onSelect={data => formatAddress(data)}
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
                  <AddressInfo address={address} />
               </div>
            ) : null}
            {/* <RefineLocation setUserCoordinate={setUserCoordinate} /> */}
            {/* Footer */}
            <StoreList userCoordinate={userCoordinate} />
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
      console.log('onChange', center, zoom, bounds, marginBounds)
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
         }
      }
   }
`
const StoreList = props => {
   // props
   const { userCoordinate } = props

   // context
   const { brand } = useConfig()

   // component state
   const [brandLocation, setBrandLocation] = useState(storeStaticData)
   const [sortedBrandLocation, setSortedBrandLocation] = useState(null)

   // get all store
   // const { loading: storeLoading, error: storeError } = useQuery(
   //    GET_BRAND_LOCATION,
   //    {
   //       variables: {
   //          where: {
   //             brandId: {
   //                _eq: brand.id,
   //             },
   //          },
   //       },
   //       onCompleted: ({ brands_brand_location = [] }) => {
   //          setBrandLocation(brands_brand_location)
   //          if (brands_brand_location.length !== 0) {
   //             getDataWithDrivableDistance(brands_brand_location)
   //          }
   //          console.log('completed')
   //       },
   //       onError: error => {
   //          console.log('getBrandLocationError', error)
   //       },
   //    }
   // )

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
            const data = await getDrivvaleData(postLocationData, url)
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
   console.log('new brandLocation', brandLocation)
   console.log('sortedArray')

   // useEffect(() => {
   //    setSortedBrandLocation(
   //       _.sortBy(brandLocation, [
   //          x => x.drivableDistanceDetails.distance.text.split(' ')[0],
   //       ])
   //    )
   // }, [brandLocation])

   useEffect(() => {
      if (brandLocation) {
         setSortedBrandLocation(getArialDistance(brandLocation, true))
      }
   }, [brandLocation])

   const getArialDistance = (data, sorted = false) => {
      const userLocation = JSON.parse(localStorage.getItem('userLocation'))

      // add arial distance
      const dataWithArialDistance = data.map(eachStore => {
         const arialDistance = getDistance(
            userLocation,
            eachStore.location.locationAddress.locationCoordinates,
            0.1
         )
         eachStore['arialDistance'] =
            parseFloat((arialDistance / 1000).toFixed(1)) + ' km'
         return eachStore
      })

      // sort by distance
      if (sorted) {
         const sortedDataWithArialDistance = _.sortBy(dataWithArialDistance, [
            x => x.arialDistance.split(' ')[0],
         ])
         return sortedDataWithArialDistance
      }
      return dataWithArialDistance
   }

   if (sortedBrandLocation === null) {
      return <Loader />
   }
   if (sortedBrandLocation.length === 0) {
      return <p>No Store Available</p>
   }
   return (
      <div className="hern-location-selector__stores-list">
         {sortedBrandLocation.map((eachStore, index) => {
            const {
               location: {
                  label,
                  locationAddress: {
                     line1,
                     line2,
                     city,
                     state,
                     country,
                     zipcode,
                  },
               },
               arialDistance,
            } = eachStore
            return (
               <div
                  key={index}
                  className="hern-store-location-selector__each-store"
               >
                  {/* <div>Icon</div> */}
                  <div className="hern-store-location-selector__store-location-details">
                     <span className="hern-store-location__store-location-label">
                        {label}
                     </span>
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
                     {/* <span>{arialDistance}</span> */}
                  </div>
                  {/* <div>Select</div> */}
               </div>
            )
         })}
      </div>
   )
}

const getDrivvaleData = async (postLocationData, url) => {
   const { data } = await axios.post(url, postLocationData)
   console.log('this is data with drivable distance', data)
   return data
}

const storeStaticData = [
   {
      id: 1000,
      brandId: 1,
      location: {
         id: 1000,
         locationAddress: {
            locationCoordinates: {
               latitude: 26.90316230216457,
               longitude: 75.73522352265464,
            },
            line1: '404',
            line2: 'Vaishali Nagar',
            city: 'Jaipur',
            state: 'Rajasthan',
            country: 'India',
            zipcode: '302021',
         },
         label: 'Vaishali Nagar',
         __typename: 'brands_location',
      },
      __typename: 'brands_brand_location',
   },
   {
      id: 1001,
      brandId: 1,
      location: {
         id: 1001,
         locationAddress: {
            locationCoordinates: {
               latitude: 26.901937228096937,
               longitude: 75.73881399859978,
            },
            line1: 'WP2Q+QG7',
            line2: 'Akruti Apartments, Chitrakoot',
            city: 'Jaipur',
            state: 'Rajasthan',
            country: 'India',
            zipcode: '302021',
         },
         label: 'Chitrakoot',
         __typename: 'brands_location',
      },
      __typename: 'brands_brand_location',
   },
   {
      id: 1002,
      brandId: 1,
      location: {
         id: 1002,
         locationAddress: {
            locationCoordinates: {
               latitude: 26.909911628518344,
               longitude: 75.77575138297402,
            },
            line1: 'SD 183 Shanti Nagar Hatwara Rod',
            line2: 'near by ESI Hospital, Shanti Nagar, Civil Lines',
            city: 'Jaipur',
            state: 'Rajasthan',
            country: 'India',
            zipcode: '302006',
         },
         label: 'Sodala',
         __typename: 'brands_location',
      },
      __typename: 'brands_brand_location',
   },
   {
      id: 1003,
      brandId: 1,
      location: {
         id: 1003,
         locationAddress: {
            locationCoordinates: {
               latitude: 26.89192841928747,
               longitude: 75.80403170257227,
            },
            line1: '43, Everest Colony',
            line2: 'Vidhayak Nagar, Lalkothi',
            city: 'Jaipur',
            state: 'Rajasthan',
            country: 'India',
            zipcode: '302015',
         },
         label: 'Tonk Road',
         __typename: 'brands_location',
      },
      __typename: 'brands_brand_location',
   },
   {
      id: 1004,
      brandId: 1,
      location: {
         id: 1004,
         locationAddress: {
            locationCoordinates: {
               latitude: 26.881315679510156,
               longitude: 75.79800985516759,
            },
            line1: '320, Laxmi Colony, Adarsh Bazar',
            line2: 'Barkat Nagar, Tonk Phatak',
            city: 'Jaipur',
            state: 'Rajasthan',
            country: 'India',
            zipcode: '302007',
         },
         label: 'Gandhi Nagar',
         __typename: 'brands_location',
      },
      __typename: 'brands_brand_location',
   },
]
