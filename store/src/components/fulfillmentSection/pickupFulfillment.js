import React, { useState, useEffect } from 'react'
import { Col, Radio, Row, Space, Carousel, Modal } from 'antd'
import { useConfig } from '../../lib'
import { OrderTime, EditIcon } from '../../assets/icons'
import { TimeSlots } from './components/timeSlots'
import {
   generateMiniSlots,
   generatePickUpSlots,
   getStoresWithValidations,
   getPickupTimeSlotValidation,
   getOndemandPickupTimeValidation,
} from '../../utils'
import { CartContext, useUser } from '../../context'
import { Loader, Button } from '../'
import moment from 'moment'

export const Pickup = props => {
   const {
      brand,
      locationId,
      configOf,
      orderTabs,
      lastStoreLocationId,
      dispatch,
   } = useConfig()
   const { methods, cartState } = React.useContext(CartContext)

   const theme = configOf('theme-color', 'visual')

   const [fulfillmentType, setFulfillmentType] = useState(null)
   const [isGetStoresLoading, setIsGetStoresLoading] = useState(true)
   const [updateFulfillmentInfoForNow, setUpdateFulfillmentInfoForNow] =
      React.useState(false)
   const [stores, setStores] = useState(null)
   const [isLoading, setIsLoading] = React.useState(true)
   const [showSlots, setShowSlots] = React.useState(false)

   const [pickupSlots, setPickupSlots] = useState(null)
   const [selectedSlot, setSelectedSlot] = useState(null)
   const [fulfillmentTabInfo, setFulfillmentTabInfo] = useState({
      orderTabId: null,
      locationId: null,
   })

   const orderTabFulfillmentType = React.useMemo(
      () =>
         orderTabs
            ? orderTabs.map(eachTab => eachTab.orderFulfillmentTypeLabel)
            : null,
      [orderTabs]
   )

   const pickupRadioOptions = React.useMemo(() => {
      let options = []
      if (
         orderTabFulfillmentType &&
         orderTabFulfillmentType.includes('ONDEMAND_PICKUP')
      ) {
         options.push({ label: 'Now', value: 'ONDEMAND_PICKUP' })
      }
      if (
         orderTabFulfillmentType &&
         orderTabFulfillmentType.includes('PREORDER_PICKUP')
      ) {
         options.push({ label: 'Later', value: 'PREORDER_PICKUP' })
      }

      return options
   }, [orderTabFulfillmentType])

   const timeSlotInfo = React.useMemo(() => {
      if (stores?.length > 0 && fulfillmentType === 'ONDEMAND_PICKUP') {
         const timeSlot = stores[0].fulfillmentStatus.timeSlotInfo
         return timeSlot
      } else {
         null
      }
   }, [stores, fulfillmentType])

   const title = React.useMemo(() => {
      switch (cartState.cart?.fulfillmentInfo?.type) {
         case 'ONDEMAND_PICKUP':
            return `You order will be delivered within ${
               timeSlotInfo?.pickUpPrepTime || '...'
            } minutes.`
         case 'PREORDER_PICKUP':
            return 'Schedule pickup'
      }
   }, [cartState.cart, timeSlotInfo])

   // update cart by when only ONDEMAN_PICKUP available
   useEffect(() => {
      if (
         fulfillmentType === 'ONDEMAND_PICKUP' &&
         pickupRadioOptions?.length === 1 &&
         stores?.length > 0 &&
         !cartState?.cart?.fulfillmentInfo?.type
      ) {
         onNowPickup({ timeSlotInfo: stores[0].fulfillmentStatus.timeSlotInfo })
      }
   }, [stores, fulfillmentType])

   // update fulfillmentType and fulfillmentInfo when cart available or only one pickup type available
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
               orderTabId,
               locationId: cartState.cart?.locationId,
            }
         })
         return
      }
      if (pickupRadioOptions.length === 1) {
         const availablePickupType = pickupRadioOptions[0].value
         setFulfillmentType(availablePickupType)
         const orderTabId = orderTabs.find(
            t => t.orderFulfillmentTypeLabel === `${availablePickupType}`
         )?.id
         setFulfillmentTabInfo(prev => {
            return { ...prev, orderTabId }
         })
      }
   }, [pickupRadioOptions, cartState.cart])

   // get available store, get minislots, if fulfillmentType === ONDEMAND_DELIVERY then fire onNowPick()
   React.useEffect(() => {
      if (brand.id && fulfillmentType) {
         async function fetchStores() {
            const brandClone = { ...brand }
            const storeLocationId = JSON.parse(
               localStorage.getItem('storeLocationId')
            )
            const availableStore = await getStoresWithValidations({
               brand: brandClone,
               fulfillmentType,
               // address: consumerAddress,
               autoSelect: true,
               locationId: locationId,
            })
            if (availableStore.length > 0) {
               setFulfillmentTabInfo(prev => {
                  return { ...prev, locationId: availableStore[0].location.id }
               })
               if (fulfillmentType === 'PREORDER_PICKUP') {
                  const pickupSlots = generatePickUpSlots(
                     availableStore[0].fulfillmentStatus.rec.map(
                        eachFulfillRecurrence =>
                           eachFulfillRecurrence.recurrence
                     )
                  )
                  const miniSlots = generateMiniSlots(pickupSlots.data, 60)
                  const validMiniSlots = miniSlots.map(eachMiniSlot => {
                     const eachMiniSlotDate = moment(eachMiniSlot.date).format(
                        'YYYY-MM-DD'
                     )
                     const currentDate = moment().format('YYYY-MM-DD')
                     const isSameDate = moment(currentDate).isSame(
                        moment(eachMiniSlotDate)
                     )
                     if (isSameDate) {
                        let newMiniSlots = []
                        eachMiniSlot.slots.forEach(eachSlot => {
                           const slot = moment(eachSlot.time, 'HH:mm')
                              .add(eachSlot.intervalInMinutes, 'm')
                              .format('HH:mm')
                           const isSlotIsValidForCurrentTime =
                              slot > moment().format('HH:mm')
                           if (isSlotIsValidForCurrentTime) {
                              newMiniSlots.push(eachSlot)
                           }
                        })
                        return {
                           ...eachMiniSlot,
                           slots: newMiniSlots,
                        }
                     } else {
                        return eachMiniSlot
                     }
                  })
                  setPickupSlots(validMiniSlots)
               }

               // this will only run when fulfillment will change manually
               if (
                  fulfillmentType === 'ONDEMAND_PICKUP' &&
                  pickupRadioOptions?.length > 1 &&
                  updateFulfillmentInfoForNow
               ) {
                  onNowPickup({
                     timeSlotInfo:
                        availableStore[0].fulfillmentStatus.timeSlotInfo,
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
   }, [brand, fulfillmentType])

   // if cart has slot info then show slot detail otherwise show time slots
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
            cartState.cart?.fulfillmentInfo?.type === 'ONDEMAND_PICKUP'
         ) {
            setIsLoading(false)
         } else {
            setShowSlots(true)
            setIsLoading(false)
         }
      }
   }, [cartState.cart])

   // time validation on selected timeSlotId
   useEffect(() => {
      const interval = setInterval(() => {
         if (stores && stores.length > 0) {
            pickupTimeValidationForOndemandPreorder()
         }
      }, 10000)
      return () => {
         clearInterval(interval)
      }
   }, [stores, cartState.cart])

   useEffect(() => {
      // when store is not available and cart has fulfillment info && component showing info then update cart by fulfillment null
      if (
         stores?.length === 0 &&
         cartState.cart?.fulfillmentInfo &&
         !showSlots
      ) {
         methods.cart.update({
            variables: {
               id: cartState?.cart?.id,
               _set: {
                  fulfillmentInfo: null,
               },
            },
         })
         setFulfillmentType(null)
         setFulfillmentTabInfo(prev => ({
            orderTabId: null,
            locationId: null,
         }))
         setStores(null)
         Modal.warning({
            title: `This time slot is not available now. Please select new time.`,
            maskClosable: true,
            centered: true,
         })
         setShowSlots(true)
         setIsLoading(false)
      } else {
         if (stores?.length > 0) {
            pickupTimeValidationForOndemandPreorder()
         }
      }
   }, [stores, cartState.cart])
   const pickupTimeValidationForOndemandPreorder = () => {
      const cartTimeSlotFrom = cartState.cart?.fulfillmentInfo?.slot?.from
      const cartTimeSlotTo = cartState.cart?.fulfillmentInfo?.slot?.to
      const cartFulfillmentType = cartState.cart?.fulfillmentInfo?.type
      if (
         cartTimeSlotFrom &&
         cartTimeSlotTo &&
         cartFulfillmentType == 'PREORDER_PICKUP' &&
         fulfillmentType == 'PREORDER_PICKUP' &&
         !showSlots
      ) {
         const isValid = getPickupTimeSlotValidation(
            stores[0].fulfillmentStatus.rec,
            cartTimeSlotFrom,
            cartTimeSlotTo,
            cartState.cart?.fulfillmentInfo?.slot?.timeslotId
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
            setStores(null)
            setFulfillmentType(null)
            setFulfillmentTabInfo({
               orderTabId: null,
               locationId: null,
            })
            Modal.warning({
               title: `This time slot is not available now.`,
               maskClosable: true,
               centered: true,
            })
         }
      }
      if (
         cartFulfillmentType == 'ONDEMAND_PICKUP' &&
         cartState.cart?.fulfillmentInfo?.slot?.timeslotId &&
         fulfillmentType === 'ONDEMAND_PICKUP' &&
         !showSlots
      ) {
         const isValid = getOndemandPickupTimeValidation(
            stores[0].fulfillmentStatus.rec,
            cartState.cart?.fulfillmentInfo?.slot?.timeslotId
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
            setStores(null)
            setFulfillmentType(null)
            setFulfillmentTabInfo({
               orderTabId: null,
               locationId: null,
            })
            Modal.warning({
               title: `This time slot expired.`,
               maskClosable: true,
               centered: true,
            })
         }
      }
   }

   const onNowPickup = ({ timeSlotInfo }) => {
      const slotInfo = {
         slot: {
            from: null,
            to: null,
            timeslotId: timeSlotInfo.id,
         },
         type: 'ONDEMAND_PICKUP',
      }

      methods.cart.update({
         variables: {
            id: cartState?.cart?.id,
            _set: {
               orderTabId: fulfillmentTabInfo.orderTabId,
               locationId: fulfillmentTabInfo.locationId || locationId,
               fulfillmentInfo: slotInfo,
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

   const onFulfillmentTimeClick = timestamp => {
      let timeslotInfo = null
      stores[0].fulfillmentStatus.rec.forEach(x => {
         x.recurrence.timeSlots.forEach(timeSlot => {
            const format = 'HH:mm'
            const selectedFromTime = moment(timestamp.from).format(format)
            const selectedToTime = moment(timestamp.to).format(format)
            const fromTime = moment(timeSlot.from, format).format(format)
            const toTime = moment(timeSlot.to, format).format(format)
            const isInBetween =
               selectedFromTime >= fromTime &&
               selectedFromTime <= toTime &&
               selectedToTime <= toTime
            if (isInBetween) {
               timeslotInfo = timeSlot
            }
         })
      })

      const slotInfo = {
         slot: {
            from: timestamp.from,
            to: timestamp.to,
            timeslotId: timeslotInfo?.id || null,
         },
         type: 'PREORDER_PICKUP',
      }

      methods.cart.update({
         variables: {
            id: cartState?.cart?.id,
            _set: {
               ...fulfillmentTabInfo,
               fulfillmentInfo: slotInfo,
               locationId: locationId,
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
                  {cartState.cart?.fulfillmentInfo?.type ===
                     'PREORDER_PICKUP' && (
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
               {(pickupRadioOptions.length > 0 ||
                  fulfillmentType === 'PREORDER_PICKUP') && (
                  <EditIcon
                     fill={theme?.accent || 'rgba(5, 150, 105, 1)'}
                     onClick={() => {
                        if (pickupRadioOptions.length > 1) {
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

         {pickupRadioOptions.length > 1 && (
            <Radio.Group
               options={pickupRadioOptions}
               onChange={e => {
                  setFulfillmentType(e.target.value)
                  const orderTabId = orderTabs.find(
                     t => t.orderFulfillmentTypeLabel === `${e.target.value}`
                  )?.id
                  setFulfillmentTabInfo(prev => {
                     return { ...prev, orderTabId }
                  })
                  setIsGetStoresLoading(true)
                  if (e.target.value === 'ONDEMAND_PICKUP') {
                     setUpdateFulfillmentInfoForNow(prev => !prev)
                  }
               }}
               value={fulfillmentType}
               className="hern-cart__fulfillment-date-slot"
            />
         )}

         {!fulfillmentType ? (
            <p>Please select a pickup type.</p>
         ) : isGetStoresLoading ? (
            <Loader inline />
         ) : stores.length === 0 ? (
            <p>No store available</p>
         ) : fulfillmentType === 'PREORDER_PICKUP' ? (
            <TimeSlots
               onFulfillmentTimeClick={onFulfillmentTimeClick}
               selectedSlot={selectedSlot}
               availableDaySlots={pickupSlots}
               setSelectedSlot={setSelectedSlot}
               timeSlotsFor={'Pickup'}
            />
         ) : null}
      </div>
   )
}
