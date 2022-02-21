import React, { useState } from 'react'
import { useConfig } from '../lib'
import { isEmpty } from 'lodash'
import { DineinTable, LocationIcon, ChevronIcon } from '../assets/icons'
import { BRAND_LOCATIONS } from '../graphql'
import { getDistance, convertDistance } from 'geolib'
import moment from 'moment'
import { CartContext } from '../context'
import { useQuery } from '@apollo/react-hooks'
import { Loader } from '.'
import { Delivery, Pickup } from './fulfillmentSection'
import { RefineLocationPopup } from './refineLocation'
import { LocationSelectorWrapper } from '../utils'
import classNames from 'classnames'
import TimeIcon from '../assets/icons/Time'

export const FulfillmentForm = () => {
   const { orderTabs, selectedOrderTab } = useConfig()
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
      [orderTabs, selectedOrderTab]
   )
   const [showRefineLocation, setShowRefineLocation] = useState(false)
   const [showLocationSelectorPopup, setShowLocationSelectionPopup] =
      React.useState(false)

   const fulfillmentLabel = React.useMemo(() => {
      switch (selectedFulfillment) {
         case 'DELIVERY':
            return 'Delivery at'
         case 'PICKUP':
            return 'Pickup from'
         case 'DINEIN':
            return 'DineIn At'
      }
   }, [selectedFulfillment])
   const [fulfillementAddressOpen, setFulfillementAddressOpen] =
      React.useState(true)
   const [fulfillementTimeOpen, setFulfillementTimeOpen] = React.useState(true)

   const isDisabled =
      !cartState?.cart?.customerInfo?.customerFirstName ||
      !cartState?.cart?.customerInfo?.customerLastName ||
      !cartState?.cart?.customerInfo?.customerPhone

   return (
      <div>
         <LocationSelectorWrapper
            showLocationSelectorPopup={showLocationSelectorPopup}
            setShowLocationSelectionPopup={setShowLocationSelectionPopup}
         />
         <div
            style={{ opacity: isDisabled ? 0.7 : 1 }}
            className="hern-fulfillment__address"
         >
            <div
               className={classNames('hern-fulfillment__address__header', {
                  'hern-fulfillment__address__header--open':
                     fulfillementAddressOpen,
               })}
            >
               <div>
                  <span className="hern-location-icon-shawdow">
                     <LocationIcon size={18} />
                  </span>
                  &nbsp; &nbsp;
                  <h3>Address</h3>
               </div>
               <span
                  onClick={() =>
                     setFulfillementAddressOpen(!fulfillementAddressOpen)
                  }
                  role="button"
               >
                  <ChevronIcon
                     direction={fulfillementAddressOpen ? 'down' : 'right'}
                     color="rgba(64, 64, 64, 0.6)"
                     width={16}
                     height={16}
                  />
               </span>
            </div>
            {fulfillementAddressOpen && (
               <>
                  <div className="hern-fulfillment__address__content">
                     <span>{fulfillmentLabel}</span>
                     <button
                        onClick={() => setShowLocationSelectionPopup(true)}
                     >
                        <ChevronIcon direction="down" />
                     </button>
                     {(selectedFulfillment === 'DELIVERY' ||
                        selectedFulfillment === 'PICKUP') && (
                        <ConsumerAddress
                           setShowRefineLocation={setShowRefineLocation}
                           showEditIcon={selectedFulfillment === 'DELIVERY'}
                        />
                     )}
                  </div>
               </>
            )}
         </div>
         <div
            style={{ opacity: isDisabled ? 0.7 : 1 }}
            className="hern-fulfillment__time"
         >
            <div
               className={classNames('hern-fulfillment__time__header', {
                  'hern-fulfillment__time__header--open': fulfillementTimeOpen,
               })}
            >
               <div>
                  <span className="hern-time-icon-shawdow">
                     <TimeIcon color="rgba(64, 64, 64, 0.6)" size={18} />
                  </span>
                  &nbsp; &nbsp;
                  <h3>
                     {selectedFulfillment === 'PICKUP' && 'Pick up time'}
                     {selectedFulfillment === 'DELIVERY' && 'Delivery time'}
                  </h3>
               </div>
               <span
                  onClick={() => setFulfillementTimeOpen(!fulfillementTimeOpen)}
                  role="button"
               >
                  <ChevronIcon
                     direction={fulfillementTimeOpen ? 'down' : 'right'}
                     color="rgba(64, 64, 64, 0.6)"
                     width={16}
                     height={16}
                  />
               </span>
            </div>
            {fulfillementTimeOpen && (
               <div>
                  {selectedFulfillment === 'DELIVERY' && <Delivery />}
                  {selectedFulfillment === 'PICKUP' && <Pickup />}
               </div>
            )}
         </div>
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
   const { brand } = useConfig()
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
         {editable ? (
            <FulfillmentForm />
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

const ConsumerAddress = ({ setShowRefineLocation, showEditIcon }) => {
   const { cartState: { cart } = {} } = React.useContext(CartContext)

   const address = React.useMemo(() => {
      if (cart?.address) {
         return cart?.address
      } else {
         return JSON.parse(localStorage.getItem('userLocation'))
      }
   }, [cart])
   if (!address) {
      return null
   }
   const fullAddress = `${address?.line1} ${address?.line2} ${address?.city} ${address?.state} ${address?.country},${address?.zipcode}`
   const isChangeButtonDisabled =
      !cart?.customerInfo?.customerFirstName ||
      !cart?.customerInfo?.customerLastName ||
      !cart?.customerInfo?.customerPhone
   return (
      <>
         <address title={fullAddress}>{fullAddress}</address>
         {showEditIcon && (
            <button
               onClick={() => setShowRefineLocation(true)}
               className="hern-fulfillment__address__content__change-btn"
               disabled={isChangeButtonDisabled}
            >
               Change
            </button>
         )}
      </>
   )
}
