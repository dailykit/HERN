import React, { useState, useEffect } from 'react'
import { Modal, Radio, Space } from 'antd'
import { useConfig } from '../../lib'
import { EditIcon, OrderTime } from '../../assets/icons'
import moment from 'moment'
import {
   generateTimeStamp,
   getStoresWithValidations,
   generateDeliverySlots,
   generateMiniSlots,
   getTimeSlotsValidation,
   getOnDemandValidation,
} from '../../utils'
import { CartContext } from '../../context'
import { Loader } from '../'
import { TimeSlots } from './components/timeSlots'
import { Button } from '../button'

export const Delivery = props => {
   const { setIsEdit } = props
   const {
      brand,
      locationId,
      orderTabs,
      lastStoreLocationId,
      dispatch,
      configOf,
   } = useConfig()
   const theme = configOf('theme-color', 'Visual')

   const { methods, cartState } = React.useContext(CartContext)
   // map orderTabs to get order fulfillment type label
   const orderTabFulfillmentType = React.useMemo(
      () =>
         orderTabs
            ? orderTabs.map(eachTab => eachTab.orderFulfillmentTypeLabel)
            : null,
      [orderTabs]
   )

   const consumerAddress = React.useMemo(() => {
      if (cartState.cart?.address) {
         return {
            ...cartState.cart?.address,
            latitude:
               cartState.cart?.address?.lat ||
               cartState.cart?.address?.latitude,
            longitude:
               cartState.cart?.address?.lng ||
               cartState.cart?.address?.longitude,
         }
      } else {
         return JSON.parse(localStorage.getItem('userLocation'))
      }
   }, [cartState.cart])

   const [deliverySlots, setDeliverySlots] = useState(null)
   const [selectedSlot, setSelectedSlot] = useState(null)
   const [fulfillmentTabInfo, setFulfillmentTabInfo] = useState({
      orderTabId: null,
      locationId: null,
      // fulfillmentInfo: null,
   })
   const [fulfillmentType, setFulfillmentType] = useState(null)
   const [isGetStoresLoading, setIsGetStoresLoading] = useState(true)
   const [stores, setStores] = useState(null)
   const [isLoading, setIsLoading] = React.useState(true)
   const [showSlots, setShowSlots] = React.useState(false)
   const [updateFulfillmentInfoForNow, setUpdateFulfillmentInfoForNow] =
      React.useState(false)
   const validMileRangeInfo = React.useMemo(() => {
      if (
         stores &&
         stores.length > 0 &&
         fulfillmentType === 'ONDEMAND_DELIVERY'
      ) {
         return stores[0].fulfillmentStatus.mileRangeInfo
      } else {
         null
      }
   }, [stores, fulfillmentType])

   const deliveryRadioOptions = React.useMemo(() => {
      let options = []
      if (
         orderTabFulfillmentType &&
         orderTabFulfillmentType.includes('ONDEMAND_DELIVERY')
      ) {
         options.push({ label: 'Now', value: 'ONDEMAND_DELIVERY' })
      }
      if (
         orderTabFulfillmentType &&
         orderTabFulfillmentType.includes('PREORDER_DELIVERY')
      ) {
         options.push({ label: 'Later', value: 'PREORDER_DELIVERY' })
      }

      return options
   }, [orderTabFulfillmentType])

   React.useEffect(() => {
      if (cartState.cart?.fulfillmentInfo?.type) {
         setFulfillmentType(cartState.cart?.fulfillmentInfo?.type)
         const orderTabId = orderTabs.find(
            t =>
               t.orderFulfillmentTypeLabel ===
               `${cartState.cart?.fulfillmentInfo?.type}`
         )?.id
         setFulfillmentTabInfo(prev => {
            return {
               ...prev,
               orderTabId,
               locationId: cartState.cart?.locationId,
            }
         })
         return
      }
      if (deliveryRadioOptions.length === 1) {
         const availableDeliveryType = deliveryRadioOptions[0].value
         setFulfillmentType(availableDeliveryType)
         const orderTabId = orderTabs.find(
            t => t.orderFulfillmentTypeLabel === `${availableDeliveryType}`
         )?.id
         setFulfillmentTabInfo(prev => {
            return { ...prev, orderTabId }
         })
      }
   }, [deliveryRadioOptions, cartState.cart])

   React.useEffect(() => {
      if (consumerAddress && brand.id && fulfillmentType) {
         console.log('consumerAddress', consumerAddress)
         async function fetchStores() {
            const brandClone = { ...brand }
            const availableStore = await getStoresWithValidations({
               brand: brandClone,
               fulfillmentType,
               address: consumerAddress,
               autoSelect: true,
            })
            if (availableStore.length > 0) {
               setFulfillmentTabInfo(prev => {
                  return { ...prev, locationId: availableStore[0].location.id }
               })
               if (fulfillmentType === 'PREORDER_DELIVERY') {
                  const deliverySlots = generateDeliverySlots(
                     availableStore[0].fulfillmentStatus.rec.map(
                        eachFulfillRecurrence =>
                           eachFulfillRecurrence.recurrence
                     )
                  )
                  const miniSlots = generateMiniSlots(deliverySlots.data, 60)
                  setDeliverySlots(miniSlots)
               }

               // this will only run when fulfillment will change manually
               if (
                  fulfillmentType === 'ONDEMAND_DELIVERY' &&
                  deliveryRadioOptions?.length > 1 &&
                  updateFulfillmentInfoForNow
               ) {
                  onNowClick({
                     mileRangeId:
                        availableStore[0].fulfillmentStatus.mileRangeInfo.id,
                     locationId: availableStore[0].location.id,
                  })
               }
            }
            setStores(availableStore)
            console.log('availableStore', availableStore)
            setIsGetStoresLoading(false)
            setUpdateFulfillmentInfoForNow(false)
         }
         fetchStores()
      }
   }, [consumerAddress, brand, fulfillmentType])

   // this will run when ondemand delivery auto select
   useEffect(() => {
      if (
         deliveryRadioOptions?.length === 1 &&
         fulfillmentType === 'ONDEMAND_DELIVERY' &&
         stores?.length > 0 &&
         !cartState?.cart?.fulfillmentInfo?.type
      ) {
         onNowClick({
            mileRangeId: stores[0].fulfillmentStatus.mileRangeInfo.id,
            locationId: stores[0].location.id,
         })
      }
   }, [fulfillmentType, stores, cartState?.cart, deliveryRadioOptions])

   const onFulfillmentTimeClick = (timestamp, mileRangeId) => {
      const slotInfo = {
         slot: {
            from: timestamp.from,
            to: timestamp.to,
            mileRangeId: mileRangeId,
         },
         type: 'PREORDER_DELIVERY',
      }

      methods.cart.update({
         variables: {
            id: cartState?.cart?.id,
            _set: {
               ...fulfillmentTabInfo,
               fulfillmentInfo: slotInfo,
               // address: consumerAddress,
               // locationId: locationId,
            },
         },
      })
      localStorage.removeItem('lastStoreLocationId')
      dispatch({
         type: 'SET_LAST_LOCATION_ID',
         payload: null,
      })
      setShowSlots(false)
      // setIsEdit(false)
   }

   // this fn will run just after available stores length > 0
   const onNowClick = ({ mileRangeId, locationId }) => {
      const slotInfo = {
         slot: {
            from: null,
            to: null,
            mileRangeId: mileRangeId,
         },
         type: 'ONDEMAND_DELIVERY',
      }

      methods.cart.update({
         variables: {
            id: cartState?.cart?.id,
            _set: {
               fulfillmentInfo: slotInfo,
               orderTabId: fulfillmentTabInfo.orderTabId,
               locationId: fulfillmentTabInfo.locationId || locationId,
               // locationId: locationId,
               // address: consumerAddress,
            },
         },
      })
      setShowSlots(false)
      // setIsEdit(false)
   }

   // to check validation for selected time slot to available time slots
   useEffect(() => {
      const interval = setInterval(() => {
         if (stores && stores.length > 0) {
            const cartTimeSlotFrom = cartState.cart?.fulfillmentInfo?.slot?.from
            const cartTimeSlotTo = cartState.cart?.fulfillmentInfo?.slot?.to
            const cartFulfillmentType = cartState.cart?.fulfillmentInfo?.type
            if (
               cartTimeSlotFrom &&
               cartTimeSlotTo &&
               cartFulfillmentType == 'PREORDER_DELIVERY'
            ) {
               const isValid = getTimeSlotsValidation(
                  stores[0].fulfillmentStatus.rec,
                  cartTimeSlotFrom,
                  cartTimeSlotTo,
                  cartState.cart?.fulfillmentInfo?.slot?.mileRangeId
               )
               if (!isValid.status) {
                  methods.cart.update({
                     variables: {
                        id: cartState?.cart?.id,
                        _set: {
                           fulfillmentInfo: null,
                        },
                     },
                  })
                  Modal.warning({
                     title: `This time slot is not available now.`,
                     maskClosable: true,
                     centered: true,
                  })
               }
            }
            if (
               cartFulfillmentType == 'ONDEMAND_DELIVERY' &&
               cartState.cart?.fulfillmentInfo?.slot?.mileRangeId
            ) {
               const isValid = getOnDemandValidation(
                  stores[0].fulfillmentStatus.rec,
                  cartState.cart?.fulfillmentInfo?.slot?.mileRangeId
               )
               if (!isValid.status) {
                  methods.cart.update({
                     variables: {
                        id: cartState?.cart?.id,
                        _set: {
                           fulfillmentInfo: null,
                        },
                     },
                  })
                  Modal.warning({
                     title: `This time slot expired.`,
                     maskClosable: true,
                     centered: true,
                  })
               }
            }
         }
      }, 10000)
      return () => {
         clearInterval(interval)
      }
   }, [stores, cartState.cart])

   React.useEffect(() => {
      if (stores && stores.length > 0) {
         const cartTimeSlotFrom = cartState.cart?.fulfillmentInfo?.slot?.from
         const cartTimeSlotTo = cartState.cart?.fulfillmentInfo?.slot?.to
         const cartFulfillmentType = cartState.cart?.fulfillmentInfo?.type
         if (
            cartTimeSlotFrom &&
            cartTimeSlotTo &&
            cartFulfillmentType == 'PREORDER_DELIVERY'
         ) {
            const isValid = getTimeSlotsValidation(
               stores[0].fulfillmentStatus.rec,
               cartTimeSlotFrom,
               cartTimeSlotTo,
               cartState.cart?.fulfillmentInfo.slot.mileRangeId
            )
            console.log('isValid', isValid)
            if (!isValid.status) {
               methods.cart.update({
                  variables: {
                     id: cartState?.cart?.id,
                     _set: {
                        fulfillmentInfo: null,
                     },
                  },
               })
               Modal.warning({
                  title: `This time slot is not available now.`,
                  maskClosable: true,
                  centered: true,
               })
            }
         }
         if (cartFulfillmentType == 'ONDEMAND_DELIVERY') {
            const isValid = getOnDemandValidation(
               stores[0].fulfillmentStatus.rec,
               cartState.cart?.fulfillmentInfo.slot.mileRangeId
            )
            if (!isValid.status) {
               methods.cart.update({
                  variables: {
                     id: cartState?.cart?.id,
                     _set: {
                        fulfillmentInfo: null,
                     },
                  },
               })
               Modal.warning({
                  title: `This time slot expired.`,
                  maskClosable: true,
                  centered: true,
               })
            }
         }
      }
   }, [stores])

   const title = React.useMemo(() => {
      switch (cartState.cart?.fulfillmentInfo?.type) {
         case 'ONDEMAND_DELIVERY':
            return `You order will be delivered within ${
               validMileRangeInfo?.prepTime || '...'
            } minutes.`
         case 'PREORDER_DELIVERY':
            return 'Schedule Delivery'
      }
   }, [cartState.cart, validMileRangeInfo])

   React.useEffect(() => {
      if (!_.isEmpty(cartState.cart)) {
         if (
            cartState.cart?.fulfillmentInfo?.slot?.to &&
            cartState.cart?.fulfillmentInfo?.slot?.from
         ) {
            const showTimeSlots = Boolean(
               !lastStoreLocationId == null ||
                  localStorage.getItem('lastStoreLocationId')
            )
            setShowSlots(showTimeSlots)
            setIsLoading(false)
         } else if (
            cartState.cart?.fulfillmentInfo?.type === 'ONDEMAND_DELIVERY'
         ) {
            setIsLoading(false)
         } else {
            setShowSlots(true)
            setIsLoading(false)
         }
      }
   }, [cartState.cart])

   if (isLoading) {
      return <p>Loading</p>
   }
   if (!showSlots) {
      return (
         <div className="hern-cart__fulfillment-time-section">
            <div className="hern-cart__fulfillment-time-section-heading">
               <OrderTime />
               <span>When would you like to order?</span>
            </div>
            <div
               style={{
                  display: 'flex',
                  alignItems: 'center',
               }}
            >
               <label style={{ marginTop: '5px' }}>
                  {title}{' '}
                  {(cartState.cart?.fulfillmentInfo?.type ===
                     'PREORDER_PICKUP' ||
                     cartState.cart?.fulfillmentInfo?.type ===
                        'PREORDER_DELIVERY') && (
                     <span>
                        {' '}
                        on{' '}
                        {moment(
                           cartState.cart?.fulfillmentInfo?.slot?.from
                        ).format('DD MMM YYYY')}
                        {' ('}
                        {moment(
                           cartState.cart?.fulfillmentInfo?.slot?.from
                        ).format('HH:mm')}
                        {'-'}
                        {moment(
                           cartState.cart?.fulfillmentInfo?.slot?.to
                        ).format('HH:mm')}
                        {')'}
                     </span>
                  )}
               </label>
               {(deliveryRadioOptions.length > 0 ||
                  fulfillmentType === 'PREORDER_DELIVERY') && (
                  <EditIcon
                     fill={theme?.accent || 'rgba(5, 150, 105, 1)'}
                     onClick={() => {
                        if (deliveryRadioOptions.length > 1) {
                           setFulfillmentType(null)
                           setFulfillmentTabInfo(prev => ({
                              ...prev,
                              orderTabId: null,
                           }))
                        }
                        setShowSlots(true)
                     }}
                     style={{ cursor: 'pointer', margin: '0 6px' }}
                  />
               )}
            </div>
         </div>
      )
   }

   return (
      <div className="hern-cart__fulfillment-time-section">
         <div className="hern-cart__fulfillment-time-section-heading">
            <OrderTime />
            <span>When would you like to order?</span>
         </div>

         {deliveryRadioOptions.length > 1 && (
            <Radio.Group
               options={deliveryRadioOptions}
               onChange={e => {
                  setFulfillmentType(e.target.value)
                  const orderTabId = orderTabs.find(
                     t => t.orderFulfillmentTypeLabel === `${e.target.value}`
                  )?.id
                  setFulfillmentTabInfo(prev => {
                     return { ...prev, orderTabId }
                  })
                  setIsGetStoresLoading(true)
                  if (e.target.value === 'ONDEMAND_DELIVERY') {
                     setUpdateFulfillmentInfoForNow(prev => !prev)
                  }
               }}
               value={fulfillmentType}
               className="hern-cart__fulfillment-date-slot"
            />
         )}

         {!fulfillmentType ? (
            <p>Please select a delivery type.</p>
         ) : isGetStoresLoading ? (
            <Loader inline />
         ) : stores.length === 0 ? (
            <p>No store available</p>
         ) : fulfillmentType === 'PREORDER_DELIVERY' ? (
            <TimeSlots
               onFulfillmentTimeClick={onFulfillmentTimeClick}
               selectedSlot={selectedSlot}
               availableDaySlots={deliverySlots}
               setSelectedSlot={setSelectedSlot}
               timeSlotsFor={'Delivery'}
            />
         ) : null}
      </div>
   )
}