import React, { useState, useEffect } from 'react'
import { Col, Radio, Row, Space, Carousel, Modal } from 'antd'
import { useConfig } from '../lib'
import { isEmpty } from 'lodash'
import { DineinTable, EditIcon, CloseIcon } from '../assets/icons'
import { BRAND_LOCATIONS } from '../graphql'
import { getDistance, convertDistance } from 'geolib'
import moment from 'moment'
import { CartContext, useUser } from '../context'
import { useQuery } from '@apollo/react-hooks'
import { Loader, Button } from '.'
import { Delivery, Pickup } from './fulfillmentSection'
import { RefineLocationPopup } from './refineLocation'
import { LocationSelectorWrapper } from '../utils'

export const FulfillmentForm = ({ isEdit, setIsEdit }) => {
   const { orderTabs, selectedOrderTab, configOf } = useConfig()
   const theme = configOf('theme-color', 'Visual')
   const { cartState } = React.useContext(CartContext)

   // check whether user select fulfillment type or not
   const selectedFulfillment = React.useMemo(
      () =>
         selectedOrderTab
            ? selectedOrderTab.orderFulfillmentTypeLabel
                 .replace('_', ' ')
                 .split(' ')[1]
            : orderTabs.length == 0
            ? null
            : orderTabs[0].orderFulfillmentTypeLabel
                 .replace('_', ' ')
                 .split(' ')[1],
      [orderTabs]
   )
   const [fulfillment, setFulfillment] = useState(selectedFulfillment) // DELIVERY, PICKUP or DINEIN
   const [showRefineLocation, setShowRefineLocation] = useState(false)
   const [showLocationSelectorPopup, setShowLocationSelectionPopup] =
      React.useState(false)

   // useEffect(() => {
   //    const localUserLocation = JSON.parse(localStorage.getItem('userLocation'))
   //    console.log(localUserLocation, "localUserLocation")
   //    if (localUserLocation) {
   //       setAddress(localUserLocation)
   //    }
   // }, [])

   // map orderTabs to get order fulfillment type label
   const orderTabFulfillmentType = React.useMemo(
      () =>
         orderTabs
            ? orderTabs.map(eachTab => eachTab.orderFulfillmentTypeLabel)
            : null,
      [orderTabs]
   )

   // show
   const fulfillmentRadioOptions = React.useMemo(() => {
      let options = []
      if (
         orderTabFulfillmentType &&
         (orderTabFulfillmentType.includes('ONDEMAND_DELIVERY') ||
            orderTabFulfillmentType.includes('PREORDER_DELIVERY'))
      ) {
         options.push({ label: 'Delivery', value: 'DELIVERY' })
      }
      if (
         orderTabFulfillmentType &&
         (orderTabFulfillmentType.includes('ONDEMAND_PICKUP') ||
            orderTabFulfillmentType.includes('PREORDER_PICKUP'))
      ) {
         options.push({ label: 'Pickup', value: 'PICKUP' })
      }
      if (
         orderTabFulfillmentType &&
         (orderTabFulfillmentType.includes('ONDEMAND_DINEIN') ||
            orderTabFulfillmentType.includes('PREORDER_DINEIN'))
      ) {
         options.push({ label: 'Dinein', value: 'DINEIN' })
      }

      return options
   }, [orderTabFulfillmentType])

   const fulfillmentLabel = React.useMemo(() => {
      switch (fulfillment) {
         case 'DELIVERY':
            return 'Delivery At'
         case 'PICKUP':
            return 'Pickup From'
         case 'DINEIN':
            return 'DineIn At'
      }
   }, [fulfillment])

   return (
      <div className="hern-cart__fulfillment-card">
         <LocationSelectorWrapper
            showLocationSelectorPopup={showLocationSelectorPopup}
            setShowLocationSelectionPopup={setShowLocationSelectionPopup}
         />
         <div style={{ position: 'relative' }}>
            <div className="hern-cart__fulfillment-heading">
               <DineinTable style={{}} />
               <span className="hern-cart__fulfillment-heading-text">
                  How would you like to your order?
               </span>
            </div>
            {false && (
               <>
                  <Button
                     onClick={() => {
                        setIsEdit(false)
                     }}
                     className="hern-cart__fulfillment-change-btn"
                     style={{
                        color: theme?.accent || 'rgba(5, 150, 105, 1)',
                        border: `1px solid ${
                           theme?.accent || 'rgba(5, 150, 105, 1)'
                        }`,
                        bottom: '8px',
                        top: '0',
                     }}
                  >
                     Close
                  </Button>
                  <CloseIcon
                     style={{
                        position: 'absolute',
                        right: '8px',
                        top: '30px',
                        cursor: 'pointer',
                        stroke: 'currentColor',
                        zIndex: '100000',
                     }}
                     onClick={() => {
                        setIsEdit(false)
                     }}
                     fill={theme?.accent || 'rgba(5, 150, 105, 1)'}
                     className="hern-cart__fulfillment-close-icon"
                  />
               </>
            )}
            {/* {fulfillmentRadioOptions.length > 1 && (
               <Space size={'large'} style={{ margin: '10px 0' }}>
                  <Radio.Group
                     options={fulfillmentRadioOptions}
                     onChange={e => {
                        setFulfillment(e.target.value)
                     }}
                     value={fulfillment}
                  />
               </Space>
            )} */}
            <div className="hern-fulfillment-section__fulfillment-label-section">
               <span className="hern-fulfillment-section__fulfillment-label">
                  {fulfillmentLabel}
               </span>
               <Button
                  variant={'outline'}
                  onClick={() => {
                     setShowLocationSelectionPopup(true)
                  }}
               >
                  Change
               </Button>
            </div>
            {fulfillment === 'DELIVERY' && (
               <Row className="hern-address__location-input-field">
                  <ConsumerAddress
                     setShowRefineLocation={setShowRefineLocation}
                  />
               </Row>
            )}
         </div>
         {fulfillment === 'DELIVERY' && <Delivery />}
         {fulfillment === 'PICKUP' && <Pickup />}
         <RefineLocationPopup
            showRefineLocation={showRefineLocation}
            setShowRefineLocation={setShowRefineLocation}
            address={
               {
                  ...cartState?.cart?.address,
                  latitude: cartState?.cart?.address?.lat,
                  longitude: cartState?.cart?.address?.lng,
               } || JSON.parse(localStorage.getItem('userLocation'))
            }
            fulfillmentType={
               cartState?.cart?.fulfillmentInfo?.type ||
               JSON.parse(localStorage.getItem('orderTab'))
            }
            showRightButton={true}
         />
      </div>
   )
}

export const Fulfillment = ({ cart, editable = true }) => {
   // const { cartState } = React.useContext(CartContext)
   const { brand, configOf } = useConfig()
   const theme = configOf('theme-color', 'Visual')

   const [isEdit, setIsEdit] = useState(false)
   const title = React.useMemo(() => {
      switch (cart?.fulfillmentInfo?.type) {
         case 'ONDEMAND_DELIVERY':
            return 'Delivery'
         case 'PREORDER_DELIVERY':
            return 'Schedule Delivery'
         case 'PREORDER_PICKUP':
            return 'Schedule Pickup'
         case 'ONDEMAND_PICKUP':
            return 'Pickup'
      }
   }, [cart])

   const {
      loading: brandLocationLading,
      error: brandLocationError,
      data: brandLocations,
   } = useQuery(BRAND_LOCATIONS, {
      skip: !brand || !brand?.id || !cart || !cart?.locationId,
      variables: {
         where: {
            brandId: { _eq: brand.id },
            locationId: { _eq: cart?.locationId },
         },
      },
   })

   const addressInfo = React.useMemo(() => {
      if (
         cart?.fulfillmentInfo?.type === 'ONDEMAND_DELIVERY' ||
         cart?.fulfillmentInfo?.type === 'PREORDER_DELIVERY'
      ) {
         if (!brandLocations) {
            return {}
         }
         const { location } =
            brandLocations.brands_brand_location_aggregate.nodes[0]
         const brandCoordinate = {
            latitude: location.lat,
            longitude: location.lng,
         }
         const aerialDistance = getDistance(
            {
               latitude: cart.address.lat || cart.address.latitude,
               longitude: cart.address.lng || cart.address.longitude,
            },
            brandCoordinate,
            0.1
         )
         const aerialDistanceInMiles = convertDistance(aerialDistance, 'mi')
         return {
            ...cart.address,
            aerialDistance: aerialDistanceInMiles,
            distanceUnit: 'mi',
         }
      }
      if (
         cart?.fulfillmentInfo?.type === 'ONDEMAND_PICKUP' ||
         cart?.fulfillmentInfo?.type === 'PREORDER_PICKUP'
      ) {
         if (!brandLocations) {
            return {}
         }
         const {
            location: {
               label,
               id,
               locationAddress,
               city,
               state,
               country,
               zipcode,
               lat,
               lng,
            },
         } = brandLocations.brands_brand_location_aggregate.nodes[0]
         const { line1, line2 } = locationAddress
         const aerialDistance = getDistance(
            {
               latitude: cart.address.lat || cart.address.latitude,
               longitude: cart.address.lng || cart.address.longitude,
            },
            {
               latitude: lat,
               longitude: lng,
            },
            0.1
         )
         const aerialDistanceInMiles = convertDistance(aerialDistance, 'mi')
         return {
            label,
            id,
            city,
            state,
            country,
            zipcode,
            line1,
            line2,
            aerialDistance: aerialDistanceInMiles,
            distanceUnit: 'mi',
         }
      }
   }, [cart, brandLocations])
   if (brandLocationLading) {
      return <Loader inline />
   }
   return (
      <>
         {editable && (cart?.fulfillmentInfo === null || isEdit) ? (
            <FulfillmentForm isEdit={isEdit} setIsEdit={setIsEdit} />
         ) : (
            <div className="hern-cart__fulfillment-card">
               <div className="hern-cart__fulfillment-heading">
                  <DineinTable />
                  <span className="hern-cart__fulfillment-heading-text">
                     {editable
                        ? 'How would you like to your order?'
                        : 'Order details'}
                  </span>
               </div>
               <div style={{ position: 'relative' }}>
                  <label style={{ marginTop: '5px' }}>
                     {title}{' '}
                     {(cart?.fulfillmentInfo?.type === 'PREORDER_PICKUP' ||
                        cart?.fulfillmentInfo?.type ===
                           'PREORDER_DELIVERY') && (
                        <span>
                           {' '}
                           on{' '}
                           {moment(cart?.fulfillmentInfo?.slot?.from).format(
                              'DD MMM YYYY'
                           )}
                           {' ('}
                           {moment(cart?.fulfillmentInfo?.slot?.from).format(
                              'HH:mm'
                           )}
                           {'-'}
                           {moment(cart?.fulfillmentInfo?.slot?.to).format(
                              'HH:mm'
                           )}
                           {')'}
                        </span>
                     )}
                  </label>
                  {editable && (
                     <>
                        <Button
                           onClick={() => {
                              setIsEdit(true)
                           }}
                           className="hern-cart__fulfillment-change-btn"
                           style={{
                              color: theme?.accent || 'rgba(5, 150, 105, 1)',
                              border: `1px solid ${
                                 theme?.accent || 'rgba(5, 150, 105, 1)'
                              }`,
                           }}
                        >
                           Change
                        </Button>
                        <EditIcon
                           style={{
                              position: 'absolute',
                              right: '8px',
                              top: '8px',
                              cursor: 'pointer',
                           }}
                           onClick={() => {
                              setIsEdit(true)
                           }}
                           fill={theme?.accent || 'rgba(5, 150, 105, 1)'}
                           className="hern-cart__fulfillment-change-edit-icon"
                        />
                     </>
                  )}

                  {!isEmpty(addressInfo) ? (
                     <div className="hern-store-location-selector__each-store">
                        <div className="hern-store-location-selector__store-location-info-container">
                           <div className="hern-store-location-selector__store-location-details">
                              <span className="hern-store-location__store-location-label">
                                 {addressInfo.label}
                              </span>

                              <span className="hern-store-location__store-location-address hern-store-location__store-location-address-line1">
                                 {addressInfo.line1}
                              </span>
                              <span className="hern-store-location__store-location-address hern-store-location__store-location-address-line2">
                                 {addressInfo.line2}
                              </span>
                              <span className="hern-store-location__store-location-address hern-store-location__store-location-address-c-s-c-z">
                                 {addressInfo.city} {addressInfo.state}{' '}
                                 {addressInfo.country}
                                 {' ('}
                                 {addressInfo.zipcode}
                                 {')'}
                              </span>
                           </div>
                        </div>
                        <div className="hern-store-location-selector__time-distance">
                           <div className="hern-store-location-selector__aerialDistance">
                              <span>
                                 {addressInfo?.aerialDistance &&
                                    addressInfo?.aerialDistance.toFixed(2)}{' '}
                                 {addressInfo?.distanceUnit}
                              </span>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <p>No address available ! </p>
                  )}
               </div>
            </div>
         )}
      </>
   )
}

const ConsumerAddress = ({ setShowRefineLocation }) => {
   const { configOf } = useConfig()
   const { cartState } = React.useContext(CartContext)
   const theme = configOf('theme-color', 'Visual')

   const address = React.useMemo(() => {
      if (cartState.cart?.address) {
         return cartState.cart?.address
      } else {
         return JSON.parse(localStorage.getItem('userLocation'))
      }
   }, [cartState.cart])
   if (!address) {
      return null
   }
   return (
      <div className="hern-fulfillment-consumer-address">
         <label>Address</label>
         <p>{address?.line1}</p>
         <p>{address?.line2}</p>
         <span>{address?.city} </span>
         <span>{address?.state} </span>
         <span>
            {address?.country}
            {', '}
         </span>
         <span>{address?.zipcode}</span>
         <EditIcon
            style={{
               position: 'absolute',
               right: '8px',
               top: '8px',
               cursor: 'pointer',
            }}
            onClick={() => {
               setShowRefineLocation(true)
            }}
            fill={theme?.accent || 'rgba(5, 150, 105, 1)'}
         />
      </div>
   )
}
