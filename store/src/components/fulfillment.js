import React, { useState, useEffect } from 'react'
import { Col, Radio, Row, Space } from 'antd'
import { useConfig } from '../lib'
import { DineinTable, GPSIcon } from '../assets/icons'
import {
   BRAND_LOCATIONS,
   BRAND_ONDEMAND_DELIVERY_RECURRENCES,
   GET_BRAND_LOCATION,
   ONDEMAND_DINE_BRAND_RECURRENCES,
   ONDEMAND_PICKUP_BRAND_RECURRENCES,
   PREORDER_DELIVERY_BRAND_RECURRENCES,
   PREORDER_PICKUP_BRAND_RECURRENCES,
   SCHEDULED_DINEIN_BRAND_RECURRENCES,
} from '../graphql'
import { getDistance, convertDistance } from 'geolib'

import {
   get_env,
   isClient,
   isPreOrderDeliveryAvailable,
   isStoreOnDemandDeliveryAvailable,
   useScript,
} from '../utils'
import { useUser } from '../context'
import { useQuery } from '@apollo/react-hooks'
import { Loader } from '.'
import classNames from 'classnames'
// import AddressListOuter from './address_list_outer'
import { AddressTunnel } from '../sections/select-delivery/address_tunnel'
import AddressList from './address_list'
// import AddressList from './address_list'

export const Fulfillment = () => {
   const { brand, orderTabs, locationId, selectedOrderTab } = useConfig()
   const { user } = useUser()

   const addresses = user?.platform_customer?.addresses || []

   // check whether user select fulfillment type or not
   const selectedFulfillmentType = React.useMemo(() =>
      selectedOrderTab ? selectedOrderTab.replace('_', ' ').split(' ')[1] : null
   )
   const [fulfillmentType, setFulfillmentType] = useState(
      selectedFulfillmentType || 'DELIVERY'
   )
   const [address, setAddress] = useState(null)
   const [userCoordinate, setUserCoordinate] = useState({
      latitude: null,
      longitude: null,
   })

   const [brandLocation, setBrandLocation] = useState(null)

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
            console.log('brands_brand_location', brands_brand_location)
            if (brands_brand_location.length !== 0) {
               setBrandLocation(brands_brand_location)
               // getDataWithDrivableDistance(brands_brand_location)
            }
         },
         onError: error => {
            console.log('getBrandLocationError', error)
         },
      }
   )

   // get all store when user address available
   const {
      loading: brandLocationLoading,
      data: { brands_brand_location_aggregate = {} } = {},
   } = useQuery(BRAND_LOCATIONS, {
      skip: !brand || !brand?.id,
      variables: {
         where: {
            _or: [
               {
                  location: {
                     city: { _eq: 'Jaipur' },
                     state: { _eq: 'Rajasthan' },
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
      onError: error => {
         console.log(error)
      },
   })

   const orderTabFulfillmentType = React.useMemo(
      () =>
         orderTabs
            ? orderTabs.map(eachTab => eachTab.orderFulfillmentTypeLabel)
            : null,
      [orderTabs]
   )
   console.log('orderTabFulfillmentType', orderTabFulfillmentType)
   const [deliveryRadioOptions] = useState([
      {
         label: 'Deliver',
         value: 'DELIVERY',
         disabled:
            orderTabFulfillmentType.includes('ONDEMAND_DELIVERY') ||
            orderTabFulfillmentType.includes('PREORDER_DELIVERY'),
      },
      {
         label: 'Pickup',
         value: 'PICKUP',
         disabled:
            orderTabFulfillmentType.includes('ONDEMAND_PICKUP') ||
            orderTabFulfillmentType.includes('PREORDER_PICKUP'),
      },
      {
         label: 'Dinein',
         value: 'DINEIN',
         disabled:
            orderTabFulfillmentType.includes('ONDEMAND_DINEIN') ||
            orderTabFulfillmentType.includes('SCHEDULED_DINEIN'),
      },
   ])

   const onAddressSelect = newAddress => {
      const modifiedAddress = {
         ...newAddress,
         latitude: newAddress.lat,
         longitude: newAddress.lng,
      }
      setAddress(modifiedAddress)
      localStorage.setItem('userLocation', JSON.stringify(modifiedAddress))
   }

   return (
      <div className="hern-cart__fulfillment-card">
         <div>
            <div className="hern-cart__fulfillment-heading">
               <DineinTable style={{}} />
               <span className="hern-cart__fulfillment-heading-text">
                  How would you like to your order?
               </span>
            </div>
            <Space size={'large'} style={{ margin: '10px 0' }}>
               <Radio.Group
                  options={deliveryRadioOptions}
                  onChange={e => {
                     console.log(e)
                     setFulfillmentType(e.target.value)
                  }}
                  value={fulfillmentType}
               />
            </Space>
            <Row>
               <Col span={12}>
                  <AddressTunnel outside={true} />
               </Col>
               <Col span={12}>
                  <AddressList
                     zipCodes={false}
                     tunnel={false}
                     onSelect={onAddressSelect}
                  />
               </Col>
            </Row>
         </div>
         {fulfillmentType === 'DELIVERY' && (
            <Delivery
               brands_brand_location_aggregate={brands_brand_location_aggregate}
               address={address}
            />
         )}
         {/* {fulfillmentType === 'PICKUP' && <Pickup />} */}
      </div>
   )
}

const Delivery = props => {
   const { brands_brand_location_aggregate, address } = props
   const { brand, locationId } = useConfig()

   const [deliveryType, setDeliveryType] = useState('ONDEMAND')
   const [status, setStatus] = useState('loading')
   const [selectedStore, setSelectedStore] = useState(null)
   const [brandLocation, setBrandLocation] = useState(null)
   const [sortedBrandLocation, setSortedBrandLocation] = useState(null)
   const [onDemandBrandRecurrence, setOnDemandBrandReoccurrence] =
      useState(null)
   const [preOrderBrandRecurrence, setPreOrderBrandReoccurrence] =
      useState(null)

   const fulfillmentStatus = React.useMemo(() => {
      let type
      if (deliveryType === 'ONDEMAND' || deliveryType === 'PREORDER') {
         type = 'deliveryStatus'
         return type
      }
   }, [deliveryType])

   const brandRecurrences = React.useMemo(() =>
      deliveryType === 'ONDEMAND'
         ? onDemandBrandRecurrence
         : preOrderBrandRecurrence
   )
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
               ...(locationId || { locationId: { _eq: brand.id } }),
            },
         },
         onCompleted: ({ brands_brand_location = [] }) => {
            if (brands_brand_location.length !== 0) {
               setBrandLocation(brands_brand_location)
            }
         },
         onError: error => {
            console.log('getBrandLocationError', error)
         },
      }
   )
   // onDemand delivery
   const { loading: brandRecurrencesLoading } = useQuery(
      BRAND_ONDEMAND_DELIVERY_RECURRENCES,
      {
         skip:
            !brands_brand_location_aggregate?.nodes ||
            !brands_brand_location_aggregate?.nodes?.length > 0 ||
            !brand ||
            !brand.id ||
            !(deliveryType === 'ONDEMAND'),
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
         fetchPolicy: 'network-only',
         onCompleted: data => {
            if (data) {
               setOnDemandBrandReoccurrence(data.brandRecurrences)
            }
         },
         onError: e => {
            console.log('Ondemand brand recurrences error:::', e)
         },
      }
   )

   // preOrderDelivery
   const { loading: preOrderBrandRecurrencesLoading } = useQuery(
      PREORDER_DELIVERY_BRAND_RECURRENCES,
      {
         skip:
            !brands_brand_location_aggregate?.nodes ||
            !brands_brand_location_aggregate?.nodes?.length > 0 ||
            !brand ||
            !brand.id ||
            !(deliveryType === 'PREORDER'),
         variables: {
            where: {
               recurrence: {
                  isActive: { _eq: true },
                  type: { _eq: 'PREORDER_DELIVERY' },
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
         fetchPolicy: 'network-only',
         onCompleted: data => {
            if (data) {
               setPreOrderBrandReoccurrence(data.brandRecurrences)
            }
         },
         onError: e => {
            console.log('preOrder brand recurrences error:::', e)
         },
      }
   )
   useEffect(() => {
      // if locationId already available then need not to choose store automatically
      if (
         !locationId &&
         address &&
         sortedBrandLocation &&
         sortedBrandLocation.every(eachStore =>
            Boolean(eachStore[fulfillmentStatus])
         )
      ) {
         setSelectedStore(
            sortedBrandLocation.filter(
               eachStore => eachStore[fulfillmentStatus].status
            )[0]
         )
         console.log(
            'automatic',
            sortedBrandLocation.filter(
               eachStore => eachStore[fulfillmentStatus].status
            )[0]
         )
      }
      if (locationId) {
      }
   }, [sortedBrandLocation, address])
   useEffect(() => {
      console.log('isBrand', brandLocation, address, brandRecurrences)
      if (brandLocation && address) {
         ;(async () => {
            const bar = await getAerialDistance(brandLocation, true)
            console.log('this is bar')
            setSortedBrandLocation(bar)
         })()
      }
   }, [brandLocation, brandRecurrences, address])
   const getAerialDistance = async (data, sorted = false) => {
      const userLocation = JSON.parse(localStorage.getItem('userLocation'))
      const userLocationWithLatLang = {
         latitude: userLocation.latitude,
         longitude: userLocation.longitude,
      }

      // // add arial distance
      const dataWithAerialDistance = await Promise.all(
         data.map(async eachStore => {
            const aerialDistance = getDistance(
               userLocationWithLatLang,
               eachStore.location.locationAddress.locationCoordinates,
               0.1
            )
            const aerialDistanceInMiles = convertDistance(aerialDistance, 'mi')
            eachStore['aerialDistance'] = parseFloat(
               aerialDistanceInMiles.toFixed(2)
            )
            eachStore['distanceUnit'] = 'mi'
            if (brandRecurrences && deliveryType === 'ONDEMAND') {
               const deliveryStatus = await isStoreOnDemandDeliveryAvailable(
                  brandRecurrences,
                  eachStore
               )
               eachStore[fulfillmentStatus] = deliveryStatus
            }
            if (brandRecurrences && deliveryType === 'PREORDER') {
               const deliveryStatus = await isPreOrderDeliveryAvailable(
                  brandRecurrences,
                  eachStore
               )
               eachStore[fulfillmentStatus] = deliveryStatus
            }
            return eachStore
         })
      )
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
   if (!locationId && selectedStore === null) {
      return <p>Please Select an address</p>
   }
   if (!selectedStore.deliveryStatus.status) {
      return <p>{selectedStore.deliveryStatus.message}</p>
   }
   return <></>
}
