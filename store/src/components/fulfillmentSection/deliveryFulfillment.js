import React, { useState, useEffect } from 'react'
import { Radio, Space } from 'antd'
import { useConfig } from '../../lib'
import { EditIcon, OrderTime } from '../../assets/icons'
import moment from 'moment'
import {
   generateTimeStamp,
   getStoresWithValidations,
   generateDeliverySlots,
   generateMiniSlots,
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
   }, [deliveryRadioOptions])

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
            }
            setStores(availableStore)
            console.log('availableStore', availableStore)
            setIsGetStoresLoading(false)
         }
         fetchStores()
      }
   }, [consumerAddress, brand, fulfillmentType])
   useEffect(() => {
      if (
         fulfillmentType === 'ONDEMAND_DELIVERY' &&
         stores &&
         stores.length > 0
      ) {
         onNowClick()
      }
   }, [fulfillmentType, stores])

   const onFulfillmentTimeClick = timestamp => {
      const slotInfo = {
         slot: {
            from: timestamp.from,
            to: timestamp.to,
            mileRangeId: stores[0].fulfillmentStatus.mileRangeInfo.id,
         },
         type: 'PREORDER_DELIVERY',
      }

      methods.cart.update({
         variables: {
            id: cartState?.cart?.id,
            _set: {
               ...fulfillmentTabInfo,
               fulfillmentInfo: slotInfo,
               address: consumerAddress,
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

   const onNowClick = () => {
      const slotInfo = {
         slot: {
            from: moment().format(),
            to: moment()
               .add(
                  stores[0].fulfillmentStatus.mileRangeInfo.prepTime,
                  'minutes'
               )
               .format(),
            mileRangeId: stores[0].fulfillmentStatus.mileRangeInfo.id,
         },
         type: 'ONDEMAND_DELIVERY',
      }

      methods.cart.update({
         variables: {
            id: cartState?.cart?.id,
            _set: {
               ...fulfillmentTabInfo,
               fulfillmentInfo: slotInfo,
               locationId: locationId,
               address: consumerAddress,
            },
         },
      })
      // setIsEdit(false)
   }

   // for ondemand delivery
   useEffect(() => {
      if (stores && stores.length > 0) {
         setFulfillmentTabInfo(prev => {
            return { ...prev, locationId: stores[0].location.id }
         })
      }
   }, [stores])

   const title = React.useMemo(() => {
      switch (cartState.cart?.fulfillmentInfo?.type) {
         case 'ONDEMAND_DELIVERY':
            return 'Delivery'
         case 'PREORDER_DELIVERY':
            return 'Schedule Delivery'
         case 'PREORDER_PICKUP':
            return 'Schedule Pickup'
         case 'ONDEMAND_PICKUP':
            return 'Pickup'
      }
   }, [cartState.cart])

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
               <EditIcon
                  fill={theme?.accent || 'rgba(5, 150, 105, 1)'}
                  onClick={() => setShowSlots(true)}
                  style={{ cursor: 'pointer', margin: '0 6px' }}
               />
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
            <p>no stores available</p>
         ) : (
            <TimeSlots
               onFulfillmentTimeClick={onFulfillmentTimeClick}
               selectedSlot={selectedSlot}
               availableDaySlots={deliverySlots}
               setSelectedSlot={setSelectedSlot}
               timeSlotsFor={'Delivery'}
            />
         )}
      </div>
   )
}
