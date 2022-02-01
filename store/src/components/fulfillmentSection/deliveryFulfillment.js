import React, { useState, useEffect } from 'react'
import { Radio, Space } from 'antd'
import { useConfig } from '../../lib'
import { OrderTime } from '../../assets/icons'
import moment from 'moment'
import {
   generateTimeStamp,
   getStoresWithValidations,
   generateDeliverySlots,
   generateMiniSlots,
} from '../../utils'
import { CartContext } from '../../context'
import { Loader } from '../'

export const Delivery = props => {
   const { setIsEdit } = props
   const { brand, locationId, orderTabs } = useConfig()
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
            latitude: cartState.cart?.address?.lat,
            longitude: cartState.cart?.address?.lng,
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
      setIsEdit(false)
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
      setIsEdit(false)
   }

   // for ondemand delivery
   useEffect(() => {
      if (stores && stores.length > 0) {
         setFulfillmentTabInfo(prev => {
            return { ...prev, locationId: stores[0].location.id }
         })
      }
   }, [stores])
   console.log(
      'selectedSlot',
      selectedSlot,
      selectedSlot?.slots?.sort(
         (t1, t2) => moment(t1.time, 'HH:mm') > moment(t2.time, 'HH:mm')
      )
   )
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
            <Space direction={'vertical'}>
               <div className="hern-fulfillment__day-slots-container">
                  <p>Please Select Schedule For Delivery</p>
                  <p className="hern-cart__fulfillment-slot-heading">
                     Fulfillment Date
                  </p>
                  <Radio.Group
                     onChange={e => {
                        setSelectedSlot(e.target.value)
                     }}
                  >
                     {deliverySlots.map((eachSlot, index) => {
                        return (
                           <Radio.Button value={eachSlot} size="large">
                              {moment(eachSlot.date).format('DD MMM YY')}
                           </Radio.Button>
                        )
                     })}
                  </Radio.Group>
               </div>
               {selectedSlot && (
                  <div className="hern-fulfillment__time-slots-container">
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
      </div>
   )
}
