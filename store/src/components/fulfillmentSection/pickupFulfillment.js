import React, { useState, useEffect } from 'react'
import { Col, Radio, Row, Space, Carousel, Modal } from 'antd'
import { useConfig } from '../../lib'
import { isEmpty } from 'lodash'
import {
   DineinTable,
   GPSIcon,
   OrderTime,
   ArrowLeftIcon,
   ArrowRightIcon,
   EditIcon,
   CloseIcon,
   Info,
} from '../../assets/icons'
import {
   BRAND_LOCATIONS,
   BRAND_ONDEMAND_DELIVERY_RECURRENCES,
   GET_BRAND_LOCATION,
   MUTATIONS,
   ONDEMAND_DINE_BRAND_RECURRENCES,
   ONDEMAND_PICKUP_BRAND_RECURRENCES,
   PREORDER_DELIVERY_BRAND_RECURRENCES,
   PREORDER_PICKUP_BRAND_RECURRENCES,
   SCHEDULED_DINEIN_BRAND_RECURRENCES,
} from '../../graphql'
import { getDistance, convertDistance } from 'geolib'
import moment from 'moment'

import {
   get_env,
   isClient,
   isPreOrderDeliveryAvailable,
   isStoreOnDemandDeliveryAvailable,
   generateDeliverySlots,
   generateMiniSlots,
   isStoreOnDemandPickupAvailable,
   isStorePreOrderPickupAvailable,
   generatePickUpSlots,
   generateTimeStamp,
} from '../../utils'
import { CartContext, useUser } from '../../context'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Loader, Button } from '../'
import classNames from 'classnames'
// import AddressListOuter from './address_list_outer'
import { AddressTunnel } from '../../sections/select-delivery/address_tunnel'
import AddressList from '../address_list'
import { useToasts } from 'react-toast-notifications'
const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const Pickup = props => {
   const {
      brands_brand_location_aggregate,
      address,
      orderTabFulfillmentType,
      onPickUpAddressSelect,
      brandLocations,
      setIsEdit,
   } = props

   const { brand, locationId, configOf, orderTabs } = useConfig()
   const { methods, cartState } = React.useContext(CartContext)

   const theme = configOf('theme-color', 'visual')
   const storeCarousal = React.useRef()
   const lastCarousal = e => {
      e.stopPropagation()
      storeCarousal.current.prev()
   }
   const nextCarousal = e => {
      e.stopPropagation()
      storeCarousal.current.next()
   }

   const pickupRadioOptions = React.useMemo(() => {
      let options = []
      if (
         orderTabFulfillmentType &&
         orderTabFulfillmentType.includes('ONDEMAND_PICKUP')
      ) {
         options.push({ label: 'Now', value: 'ONDEMAND' })
      }
      if (
         orderTabFulfillmentType &&
         orderTabFulfillmentType.includes('PREORDER_PICKUP')
      ) {
         options.push({ label: 'Later', value: 'PREORDER' })
      }

      return options
   }, [orderTabFulfillmentType])

   const [pickupType, setPickUpType] = useState(null)
   const [onDemandBrandRecurrence, setOnDemandBrandReoccurrence] =
      useState(null)
   const [preOrderBrandRecurrence, setPreOrderBrandReoccurrence] =
      useState(null)
   const [status, setStatus] = useState('loading')
   const [sortedBrandLocation, setSortedBrandLocation] = useState(null)
   const [selectedStore, setSelectedStore] = useState(null)
   const [pickupSlots, setPickupSlots] = useState(null)
   const [selectedSlot, setSelectedSlot] = useState(null)
   const [fulfillmentTabInfo, setFulfillmentTabInfo] = useState({
      orderTabId: null,
      locationId: null,
   })
   const fulfillmentStatus = React.useMemo(() => {
      let type
      if (pickupType === 'ONDEMAND' || pickupType === 'PREORDER') {
         type = 'pickupStatus'
         return type
      }
   }, [pickupType])

   const { loading: onDemandPickupRecurrenceLoading } = useQuery(
      ONDEMAND_PICKUP_BRAND_RECURRENCES,
      {
         skip: !brand || !brand.id,
         variables: {
            where: {
               isActive: { _eq: true },
               recurrence: {
                  isActive: { _eq: true },
                  type: { _eq: 'ONDEMAND_PICKUP' },
               },
               brandId: { _eq: brand.id },
            },
         },
         onCompleted: data => {
            if (data) {
               setOnDemandBrandReoccurrence(data.brandRecurrences)
            }
         },
      }
   )
   const { loading: preOrderPickRecurrencesLoading } = useQuery(
      PREORDER_PICKUP_BRAND_RECURRENCES,
      {
         skip: !brand || !brand.id,
         variables: {
            where: {
               isActive: { _eq: true },
               recurrence: {
                  isActive: { _eq: true },
                  type: { _eq: 'PREORDER_PICKUP' },
               },
               brandId: { _eq: brand.id },
            },
         },
         onCompleted: data => {
            if (data) {
               setPreOrderBrandReoccurrence(data.brandRecurrences)
            }
         },
      }
   )
   const brandRecurrences = React.useMemo(() =>
      pickupType === 'ONDEMAND'
         ? onDemandBrandRecurrence
         : preOrderBrandRecurrence
   )

   useEffect(() => {
      if (pickupType === 'PREORDER' && selectedStore) {
         const pickupSlots = generatePickUpSlots(
            selectedStore.pickupStatus.rec.map(x => x.recurrence)
         )
         const miniSlots = generateMiniSlots(pickupSlots.data, 60)
         setPickupSlots(miniSlots)
      }
   }, [selectedStore])

   useEffect(() => {
      if (brandLocations && address) {
         ;(async () => {
            const brandLocationSortedByAerialDistance = await getAerialDistance(
               brandLocations,
               true
            )
            setSortedBrandLocation(brandLocationSortedByAerialDistance)
         })()
      }
   }, [brandLocations, brandRecurrences, address, pickupType])

   const getAerialDistance = async (data, sorted = false) => {
      // const userLocation = JSON.parse(localStorage.getItem('userLocation'))
      const userLocationWithLatLang = {
         latitude: address.latitude,
         longitude: address.longitude,
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
            if (brandRecurrences && pickupType === 'ONDEMAND') {
               const pickupStatus = await isStoreOnDemandPickupAvailable(
                  brandRecurrences,
                  eachStore
               )
               eachStore[fulfillmentStatus] = pickupStatus
            }
            if (brandRecurrences && pickupType === 'PREORDER') {
               const pickupStatus = await isStorePreOrderPickupAvailable(
                  brandRecurrences,
                  eachStore
               )
               eachStore[fulfillmentStatus] = pickupStatus
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

   useEffect(() => {
      if (pickupType === 'ONDEMAND' && selectedStore) {
         onNowPickup()
      }
   }, [selectedStore, pickupType])

   const onNowPickup = () => {
      const mileRange = selectedStore.pickupStatus.timeSlotInfo.mileRanges
         ? selectedStore.pickupStatus.timeSlotInfo.mileRanges[0]
         : null
      const slotInfo = {
         slot: {
            from: moment().format(),
            to: moment()
               .add(mileRange ? mileRange.prepTime : 60, 'minutes')
               .format(),
            timeslotId: selectedStore.pickupStatus.timeSlotInfo.id,
         },
         type: 'ONDEMAND_PICKUP',
      }

      methods.cart.update({
         variables: {
            id: cartState?.cart?.id,
            _set: {
               ...fulfillmentTabInfo,
               fulfillmentInfo: slotInfo,
               locationId: locationId,
               address,
            },
         },
      })
      setIsEdit(false)
   }

   const onFulfillmentTimeClick = timestamp => {
      let timeslotInfo = null
      selectedStore.pickupStatus.rec.forEach(x => {
         x.recurrence.timeSlots.forEach(timeSlot => {
            const format = 'HH:mm:ss'
            const chosenTime = moment(timestamp.from).format(format)
            const toTime = moment(timeSlot.to, format)
            const fromTime = moment(timeSlot.from, format)
            const isInBetween = moment(chosenTime, format).isBetween(
               fromTime,
               toTime
            )
            if (isInBetween) {
               timeslotInfo = timeSlot
            }
         })
      })

      const slotInfo = {
         slot: {
            from: timestamp.from,
            to: timestamp.to,
            timeslotId: timeslotInfo ? timeslotInfo?.id : null,
         },
         type: 'PREORDER_PICKUP',
      }

      methods.cart.update({
         variables: {
            id: cartState?.cart?.id,
            _set: {
               ...fulfillmentTabInfo,
               fulfillmentInfo: slotInfo,
               address,
               locationId: locationId,
            },
         },
      })
      setIsEdit(false)
   }
   return (
      <div>
         <Row>
            <Col span={10}>
               <AddressTunnel
                  outside={true}
                  showAddressForm={false}
                  onInputFiledSelect={onPickUpAddressSelect}
                  useLocalAddress={true}
               />
            </Col>
         </Row>
         {!address ? (
            <p>Please Select an address</p>
         ) : (
            <div style={{ position: 'relative' }}>
               <div className="hern-cart__fulfillment-time-section-heading">
                  <OrderTime />
                  <span>When would you like your order?</span>
               </div>
               <div>
                  <Radio.Group
                     options={pickupRadioOptions}
                     onChange={e => {
                        setPickUpType(e.target.value)
                        const orderTabId = orderTabs.find(
                           t =>
                              t.orderFulfillmentTypeLabel ===
                              `${e.target.value}_DELIVERY`
                        )?.id
                        setFulfillmentTabInfo(prev => {
                           return { ...prev, orderTabId }
                        })
                        setSelectedStore(null)
                     }}
                     value={pickupType}
                  />
               </div>
            </div>
         )}
         {sortedBrandLocation &&
            sortedBrandLocation.some(x => x?.pickupStatus?.status) && (
               <div style={{ position: 'relative' }}>
                  <ArrowLeftIcon
                     size={24}
                     className="hern-cart__store-arrow hern-cart__store-arrow-left"
                     style={{
                        background: `${theme?.accent}` || '#367bf599',
                     }}
                     onClick={lastCarousal}
                  />
                  <ArrowRightIcon
                     size={24}
                     className="hern-cart__store-arrow hern-cart__store-arrow-right"
                     style={{
                        background: `${theme?.accent}` || '#367bf599',
                     }}
                     onClick={nextCarousal}
                  />
                  <Carousel
                     ref={storeCarousal}
                     dots={false}
                     slidesToShow={3}
                     slidesToScroll={3}
                     infinite={false}
                  >
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
                        if (!eachStore[fulfillmentStatus].status) {
                           return null
                        }
                        return (
                           <div
                              key={index}
                              className={classNames(
                                 'hern-store-location-selector__each-store',
                                 {
                                    'hern-store-location-selector__each-store--border':
                                       selectedStore && id === selectedStore.id,
                                 }
                              )}
                              onClick={() => {
                                 if (eachStore[fulfillmentStatus].status) {
                                    setSelectedStore(eachStore)
                                 }
                              }}
                              style={{ cursor: 'pointer' }}
                           >
                              <div className="hern-store-location-selector__store-location-info-container">
                                 <div className="hern-store-location-selector__store-location-details">
                                    {true && (
                                       <span className="hern-store-location__store-location-label">
                                          {label}
                                       </span>
                                    )}
                                    {true && (
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
                              <div className="hern-store-location-selector__time-distance">
                                 <div className="hern-store-location-selector__aerialDistance">
                                    <span>
                                       {aerialDistance} {distanceUnit}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        )
                     })}
                  </Carousel>
               </div>
            )}
         {pickupType === 'PREORDER' && pickupSlots && (
            <Space direction={'vertical'}>
               <div>
                  <p className="hern-cart__fulfillment-slot-heading">
                     Fulfillment Date
                  </p>
                  <Radio.Group
                     onChange={e => {
                        setSelectedSlot(e.target.value)
                     }}
                  >
                     <Space size={'middle'}>
                        {pickupSlots.map((eachSlot, index) => {
                           return (
                              <Radio.Button value={eachSlot}>
                                 {moment(eachSlot.date).format('DD MMM YY')}
                              </Radio.Button>
                           )
                        })}
                     </Space>
                  </Radio.Group>
               </div>
               {selectedSlot && (
                  <div>
                     <p className="hern-cart__fulfillment-slot-heading">
                        Fulfillment Time
                     </p>
                     <Radio.Group
                        onChange={e => {
                           const newTimeStamp = generateTimeStamp(
                              e.target.value.time,
                              selectedSlot.date,
                              60
                           )
                           onFulfillmentTimeClick(newTimeStamp)
                        }}
                     >
                        {_.sortBy(selectedSlot.slots, [
                           function (slot) {
                              return moment(slot.time, 'HH:mm')
                           },
                        ]).map((eachSlot, index, elements) => {
                           const slot = {
                              from: eachSlot.time,
                              to: moment(eachSlot.time, 'HH:mm')
                                 .add(eachSlot.intervalInMinutes, 'm')
                                 .format('HH:mm'),
                           }
                           return (
                              <Radio.Button value={eachSlot}>
                                 {slot.from}
                                 {'-'}
                                 {slot.to}
                              </Radio.Button>
                           )
                        })}
                     </Radio.Group>
                  </div>
               )}
            </Space>
         )}
         <div></div>
      </div>
   )
}
