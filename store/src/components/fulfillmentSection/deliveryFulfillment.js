import React, { useState, useEffect } from 'react'
import { Modal, Radio, Space } from 'antd'
import { useConfig } from '../../lib'
import {
   DeliveryNowIcon,
   DeliveryLaterIcon,
   OrderTime,
} from '../../assets/icons'
import moment from 'moment'
import {
   generateTimeStamp,
   getStoresWithValidations,
   generateDeliverySlots,
   generateMiniSlots,
   getTimeSlotsValidation,
   getOnDemandValidation,
   setThemeVariable,
   isClient,
} from '../../utils'
import { CartContext } from '../../context'
import { Loader } from '../'
import { TimeSlots } from './components/timeSlots'
import { Button } from '../button'
import classNames from 'classnames'

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
   console.log('cart', cartState)
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
         options.push({
            label: (
               <span>
                  <DeliveryNowIcon />
                  &nbsp;Delivery Now
               </span>
            ),
            value: 'ONDEMAND_DELIVERY',
         })
      }
      if (
         orderTabFulfillmentType &&
         orderTabFulfillmentType.includes('PREORDER_DELIVERY')
      ) {
         options.push({
            label: (
               <span>
                  <DeliveryLaterIcon />
                  &nbsp; Schedule Later
               </span>
            ),
            value: 'PREORDER_DELIVERY',
         })
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
                  setDeliverySlots(validMiniSlots)
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
               cartFulfillmentType == 'PREORDER_DELIVERY' &&
               fulfillmentType === 'PREORDER_DELIVERY' &&
               !showSlots
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
               cartFulfillmentType == 'ONDEMAND_DELIVERY' &&
               cartState.cart?.fulfillmentInfo?.slot?.mileRangeId &&
               fulfillmentType === 'ONDEMAND_DELIVERY' &&
               !showSlots
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
            cartFulfillmentType == 'PREORDER_DELIVERY' &&
            fulfillmentType === 'PREORDER_DELIVERY' &&
            !showSlots
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
            cartFulfillmentType == 'ONDEMAND_DELIVERY' &&
            fulfillmentType === 'ONDEMAND_DELIVERY' &&
            !showSlots &&
            cartState.cart?.fulfillmentInfo?.slot?.mileRangeId
         ) {
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
      } else {
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
         }
      }
   }, [stores, cartState.cart])

   const title = React.useMemo(() => {
      switch (cartState.cart?.fulfillmentInfo?.type) {
         case 'ONDEMAND_DELIVERY':
            return `Delivering in ${validMileRangeInfo?.prepTime || '...'} min.`
         default:
            return ''
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
   const [isMobileViewOpen, setIsMobileViewOpen] = React.useState(true)
   const isSmallerDevice = isClient && window.innerWidth < 768

   React.useEffect(() => {
      if (cartState.cart?.fulfillmentInfo !== null) {
         setIsMobileViewOpen(false)
      }
      if (!isMobileViewOpen) {
         setThemeVariable(
            '--fufillment-time-section-top',
            showSlots ? '64px' : 'auto'
         )
         setThemeVariable(
            '--fufillment-time-section-bottom',
            showSlots ? '0px' : '56px'
         )
      }
   }, [isMobileViewOpen, showSlots])

   setThemeVariable(
      '--user-info-section-bottom',
      isSmallerDevice &&
         cartState.cart?.fulfillmentInfo === null &&
         showSlots &&
         isMobileViewOpen
         ? '92px'
         : '128px'
   )
   setThemeVariable(
      '--fufillment-address-section-bottom',
      isSmallerDevice &&
         cartState.cart?.fulfillmentInfo === null &&
         showSlots &&
         isMobileViewOpen
         ? '56px'
         : '92px'
   )

   if (isLoading) {
      return <p>Loading</p>
   }
   if (
      isSmallerDevice &&
      cartState.cart?.fulfillmentInfo === null &&
      showSlots &&
      isMobileViewOpen
   ) {
      return (
         <button
            className="hern-user-info-tunnel__open-btn"
            onClick={() => {
               setShowSlots(true)
               setIsMobileViewOpen(false)
            }}
         >
            Add delivery time{' '}
         </button>
      )
   }

   if (!showSlots) {
      return (
         <div className="hern-cart__fulfillment-time-section">
            <div style={{ display: 'flex' }}>
               <OrderTime width={20} height={20} />
               &nbsp;&nbsp;
               <label>
                  {title}
                  {(cartState.cart?.fulfillmentInfo?.type ===
                     'PREORDER_PICKUP' ||
                     cartState.cart?.fulfillmentInfo?.type ===
                        'PREORDER_DELIVERY') && (
                     <span>
                        {' '}
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
                  <Button
                     variant="ghost"
                     style={{ marginLeft: 'auto' }}
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
                  >
                     Change
                  </Button>
               )}
            </div>
         </div>
      )
   }

   return (
      <div className="hern-cart__fulfillment-time-section">
         <div className="hern-cart__fulfillment-time-section-heading">
            <span>When would you like to order?</span>
         </div>

         {deliveryRadioOptions.length > 1 && (
            <div className="hern-fulfillment__options__type-btn">
               {deliveryRadioOptions.map(({ label, value }) => (
                  <button
                     key={label}
                     className={classNames({
                        'hern-fulfillment__options__type-btn--active':
                           fulfillmentType === value,
                     })}
                     onClick={() => {
                        setFulfillmentType(value)
                        const orderTabId = orderTabs.find(
                           t => t.orderFulfillmentTypeLabel === `${value}`
                        )?.id
                        setFulfillmentTabInfo(prev => {
                           return { ...prev, orderTabId }
                        })
                        setIsGetStoresLoading(true)
                        if (value === 'ONDEMAND_DELIVERY') {
                           setUpdateFulfillmentInfoForNow(prev => !prev)
                        }
                     }}
                  >
                     {label}
                  </button>
               ))}
            </div>
         )}

         {!fulfillmentType ? null : isGetStoresLoading ? (
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
