import React from 'react'
import _, { isEmpty } from 'lodash'
import { useSubscription } from '@apollo/react-hooks'
import moment from 'moment'
import classNames from 'classnames'
import { FaCheckCircle } from 'react-icons/fa'
import { Avatar } from 'antd'
import {
   useJsApiLoader,
   GoogleMap,
   Marker,
   DirectionsService,
   DirectionsRenderer,
} from '@react-google-maps/api'
import { CartBillingDetails } from './cart_billing_details'
import { DebitCardIcon, DeliveryInfoIcons } from '../assets/icons'
import TimeIcon from '../assets/icons/Time'
import { GET_ORDER_DETAILS } from '../graphql'
import {
   combineCartItems,
   formatCurrency,
   useQueryParamState,
   normalizeAddress,
   isClient,
   get_env,
} from '../utils'
import { Loader } from './loader'
import { Empty } from 'antd'
import { useTranslation } from '../context'

export const CartOrderDetails = () => {
   const [cartId] = useQueryParamState('id')
   const { t } = useTranslation()
   const {
      error,
      loading: orderHistoryLoading,
      data: { carts = [] } = {},
   } = useSubscription(GET_ORDER_DETAILS, {
      skip: !cartId,
      variables: {
         where: {
            id: { _eq: Number(cartId) },
         },
      },
   })
   const { isLoaded } = useJsApiLoader({
      id: 'google-map-id',
      googleMapsApiKey: get_env('MAPS_API_KEY'),
   })

   const mapRef = React.useRef()
   const onMapLoad = React.useCallback(map => {
      mapRef.current = map
   }, [])
   if (!cartId) return <Empty />
   if (!isLoaded || orderHistoryLoading) return <Loader />
   if (error)
      return (
         <h2 style={{ padding: '75px 0', textAlign: 'center' }}>
            Something went wrong! <br /> Please reload the page
         </h2>
      )
   const cart = carts[0]
   const deliveryInfo = cart?.order?.deliveryInfo ?? null

   return (
      <>
         {/* Component for current location and status of delivery order */}
         {isLoaded && (
            <DeliveryTracking
               deliveryInfo={deliveryInfo}
               onMapLoad={onMapLoad}
            />
         )}
         {/* Payment status */}
         <div
            style={{ margin: deliveryInfo ? '24px 0' : 0 }}
            className="hern-order-history-card__tunnel-payment-info"
         >
            <span style={{ minWidth: '24px' }}>
               <DebitCardIcon size={20} />
            </span>
            {cart?.cartPayments?.length > 0 && (
               <div>
                  {cart?.availablePaymentOption?.label
                     ? `Payment: Paid by ${cart?.availablePaymentOption?.label}`
                     : cart?.cartPayments?.length === 1 &&
                       cart?.cartPayments[0].amount === 0 &&
                       cart?.cartPayments[0]?.transactionRemark?.paidBy}
               </div>
            )}
         </div>
         {/* List of ordered items   */}
         <CartItems products={cart?.cartItems} border={true} title={true} />
         {/* Cart billing details  */}
         <CartBillingDetails cart={cart} billing={cart?.cartOwnerBilling} />
      </>
   )
}

const CartItems = ({ products, border = false, title = false }) => {
   const cartItems = combineCartItems(products)

   return (
      <div
         className={classNames({
            'hern-order-history__cart-items__wrapper': border,
         })}
      >
         {title && (
            <h3 className="hern-order-history__cart-items__title">
               Items({cartItems?.length})
            </h3>
         )}
         {cartItems.map((product, index) => {
            return (
               <div
                  className="hern-order-history__cart-items"
                  style={{
                     borderBottom: `${
                        cartItems?.length > 1
                           ? '1px solid rgba(64, 64, 64, 0.25)'
                           : 'none'
                     }`,
                     border: `${border && '1px solid rgba(64, 64, 64, 0.25)'}`,
                     paddingLeft: `${border && '16px'}`,
                  }}
               >
                  <div
                     className="hern-order-history-card__product-title"
                     key={index}
                  >
                     <div>{product.name}</div>
                     <span>x{product.ids.length}</span>
                  </div>
                  {/* Modifiers of the product */}
                  {product.childs.length > 0 && (
                     <ModifiersList data={product} />
                  )}
               </div>
            )
         })}
      </div>
   )
}
const ModifiersList = props => {
   const { data } = props
   return (
      <div className="hern-order-history-card__modifier-list">
         <span>{data.childs[0].productOption.label || 'N/A'}</span>{' '}
         {data.childs[0].price !== 0 && (
            <div>
               {data.childs[0].discount > 0 && (
                  <span
                     style={{
                        textDecoration: 'line-through',
                     }}
                  >
                     {formatCurrency(data.childs[0].price)}
                  </span>
               )}
               <span style={{ marginLeft: '6px' }}>
                  {formatCurrency(
                     data.childs[0].price - data.childs[0].discount
                  )}
               </span>
            </div>
         )}
      </div>
   )
}

const DeliveryTracking = ({ deliveryInfo, onMapLoad }) => {
   if (_.isNull(deliveryInfo)) return null

   /** Array of all status of order */
   const deliveryInformation = [
      {
         id: 1,
         step: 'delivery-request',
         label: 'Delivery  Request',
         status: deliveryInfo.deliveryRequest.status.value, // define the status SUCCEEDED or WAITING or CANCELED
         time: deliveryInfo.deliveryRequest.status.timeStamp, //define the time of the status
         tailHeight: 48, //define the height of the dots of current status
      },
      {
         id: 2,
         label: 'Driver Assigned',
         step: 'driver-assigned',
         status: deliveryInfo.assigned.status.value,
         time: deliveryInfo.assigned.status.timeStamp,
         details: {
            name: !isEmpty(deliveryInfo.assigned.driverInfo)
               ? deliveryInfo.assigned.driverInfo.driverFirstName +
                 ' ' +
                 deliveryInfo.assigned.driverInfo.driverLastName
               : '',
            image: deliveryInfo.assigned?.driverInfo.driverPicture ?? '',
            phone: deliveryInfo.assigned?.driverInfo?.driverPhone ?? '',
         },
         tailHeight: 72,
      },
      {
         id: 3,
         label: 'Order Pickup',
         step: 'order-picked-up',
         status: deliveryInfo.pickup.status.value,
         time: deliveryInfo.pickup.status.timeStamp,
         details: {
            name: deliveryInfo.pickup.pickupInfo.organizationName,
            phone: deliveryInfo.pickup.pickupInfo.organizationPhone,
         },
         address: deliveryInfo.pickup.pickupInfo.organizationAddress, //define the address of the pickup location or store
         tailHeight: 120,
      },
      {
         id: 4,
         label: 'Order Drop Off',
         step: 'order-drop-off',
         status: deliveryInfo.dropoff.status.value,
         time: deliveryInfo.dropoff.status.timeStamp,
         details: {
            name:
               deliveryInfo.dropoff.dropoffInfo.customerFirstName +
               ' ' +
               deliveryInfo.dropoff.dropoffInfo.customerLastName,
            phone: deliveryInfo.dropoff.dropoffInfo.customerPhone,
         },
         address: deliveryInfo.dropoff.dropoffInfo.customerAddress, // define customer address
         tailHeight: 120,
      },
      {
         id: 5,
         label: 'Order Delivered',
         step: 'order-delivered',
         status: deliveryInfo.dropoff.status.value,
         time: deliveryInfo.dropoff.status.timeStamp,
         tail: false,
         tailHeight: 0,
      },
   ]

   return (
      <>
         {/* Details on map  */}
         <DeliveryMap deliveryInfo={deliveryInfo} onMapLoad={onMapLoad} />
         {/* Status with info  */}
         <div style={{ margin: '32px 0' }}>
            {deliveryInformation.map(info => (
               <DeliveryProgress key={info.id} info={info} />
            ))}
         </div>
      </>
   )
}

const DeliveryProgress = ({ info }) => {
   const {
      label,
      status,
      step,
      details = {},
      time,
      address,
      tailHeight = '64',
   } = info
   return (
      <div className="hern-delivery-progress">
         <div className="hern-delivery-progress__icon">
            {status === 'SUCCEEDED' ? (
               <FaCheckCircle size={32} color="var(--hern-accent)" />
            ) : (
               <div className="hern-delivery-progress__icon__step-icon">
                  {/* Get icon based on delivery step  */}
                  {getIcon(step)}
               </div>
            )}
            {/* Dots towards the next step || tail of current step */}
            <svg
               width="4"
               height={tailHeight}
               viewBox={`0 0 4 ${tailHeight}`}
               fill="none"
               xmlns="http://www.w3.org/2000/svg"
            >
               <line
                  x1="2.02051"
                  y1="0.385742"
                  x2="2.02051"
                  y2={tailHeight}
                  stroke={
                     status === 'SUCCEEDED'
                        ? 'var(--hern-accent)'
                        : 'rgba(64, 64, 64, 0.2)'
                  }
                  strokeWidth="3"
                  strokeDasharray="4 4"
               />
            </svg>
         </div>
         {/* label */}
         <div className="hern-delivery-progress__content">
            <div className="hern-delivery-progress__title">
               <h3
                  style={
                     status !== 'SUCCEEDED'
                        ? { color: 'rgba(64, 64, 64, 0.2)' }
                        : {}
                  }
               >
                  {label}
               </h3>
            </div>
            {/* time */}
            {time && (
               <div className="hern-delivery-progress__time">
                  <TimeIcon
                     color={
                        status !== 'SUCCEEDED'
                           ? 'rgba(64, 64, 64, 0.2)'
                           : 'rgba(64, 64, 64, 0.6)'
                     }
                     size={10}
                  />
                  <span
                     style={
                        status !== 'SUCCEEDED'
                           ? { color: 'rgba(64, 64, 64, 0.2)' }
                           : {}
                     }
                  >
                     {moment(time).format('h:mm a , DD MMM YYYY')}
                  </span>
               </div>
            )}
            {/* details : name, phone and image  of customer or organization or driver based on step */}
            {!isEmpty(details) && (
               <div className="hern-delivery-progress__driver-info">
                  {!isEmpty(details.name) && (
                     <div className="hern-delivery-progress__driver-info__avatar">
                        {!isEmpty(details.image) ? (
                           <img
                              style={{ height: '16px', width: '16px' }}
                              src={details.image}
                              alt="avatar"
                           />
                        ) : (
                           <>
                              {!isEmpty(details.name) ? (
                                 <Avatar
                                    style={{
                                       backgroundColor: 'rgba(255, 198, 51, 1)',
                                    }}
                                    size={16}
                                 >
                                    {details.name.split(' ')[0][0]}
                                 </Avatar>
                              ) : null}
                           </>
                        )}
                        {!isEmpty(details.name) && (
                           <span className="hern-delivery-progress__driver-info__avatar__title">
                              {details.name}
                           </span>
                        )}
                     </div>
                  )}
                  {!isEmpty(details.phone) && (
                     <div className="hern-delivery-progress__driver-info__phone">
                        {/* phone icon */}
                        <svg
                           width="11"
                           height="11"
                           viewBox="0 0 11 11"
                           fill="none"
                           xmlns="http://www.w3.org/2000/svg"
                        >
                           <path
                              d="M9.15361 8.91754C9.58015 8.48011 9.58015 7.89688 9.15361 7.47067L7.98626 6.30419C7.78422 6.09109 7.53728 5.97893 7.26789 5.97893C7.00972 5.97893 6.76278 6.09109 6.54952 6.30419L5.87605 6.97716C5.81992 6.94351 5.7638 6.92108 5.70768 6.88743C5.62911 6.85378 5.56176 6.80892 5.49441 6.77527C4.86584 6.38271 4.29338 5.85555 3.75461 5.1938C3.48522 4.85732 3.30562 4.57692 3.18215 4.2853C3.35052 4.12827 3.51889 3.96003 3.67603 3.80301C3.73216 3.74693 3.7995 3.67963 3.85563 3.62355C4.06889 3.41044 4.19236 3.15247 4.19236 2.8945C4.19236 2.63653 4.08012 2.38978 3.85563 2.16546L3.28318 1.58222C3.21583 1.51493 3.14848 1.44763 3.09236 1.38033C2.96889 1.24574 2.83419 1.11115 2.6995 0.987771C2.49746 0.785882 2.25052 0.673721 1.99235 0.673721C1.73419 0.673721 1.48725 0.785882 1.27398 0.987771L0.544387 1.71682C0.274998 1.986 0.117854 2.31127 0.0841802 2.69262C0.039282 3.3095 0.218875 3.88152 0.353569 4.26287C0.690306 5.18259 1.20663 6.04622 1.9699 6.96594C2.90154 8.07633 4.01277 8.93997 5.28114 9.55686C5.7638 9.79239 6.41482 10.0616 7.14442 10.1064C7.18932 10.1064 7.23422 10.1064 7.27911 10.1064C7.76177 10.1064 8.17708 9.92699 8.49136 9.57929L8.50259 9.56807C8.61483 9.43348 8.73831 9.3101 8.873 9.18673C8.97402 9.10821 9.06382 9.01849 9.15361 8.91754ZM8.49136 8.79416C8.35667 8.92876 8.21075 9.06335 8.08728 9.22037C7.87401 9.45591 7.61585 9.55686 7.29034 9.55686C7.25666 9.55686 7.22299 9.55686 7.18932 9.55686C6.56074 9.50078 5.97707 9.26524 5.52808 9.05213C4.32706 8.4689 3.28318 7.65012 2.40766 6.60703C1.68929 5.74339 1.20663 4.93583 0.881123 4.07219C0.679081 3.54504 0.611734 3.13004 0.645407 2.7487C0.667857 2.50194 0.768878 2.30005 0.937246 2.1206L1.65562 1.40277C1.75664 1.30182 1.86888 1.24574 1.98113 1.24574C2.11582 1.24574 2.22807 1.32425 2.30664 1.40277C2.44133 1.52614 2.55358 1.64952 2.68827 1.78411C2.75562 1.85141 2.82297 1.91871 2.89032 1.986L3.46277 2.55802C3.57501 2.67018 3.63114 2.78234 3.63114 2.8945C3.63114 3.00667 3.57501 3.11883 3.46277 3.23099C3.40665 3.28707 3.3393 3.35436 3.28318 3.41044C3.10358 3.5899 2.93521 3.75814 2.75562 3.92638L2.7444 3.9376C2.5648 4.11706 2.59848 4.29651 2.63215 4.40868C2.63215 4.41989 2.63215 4.41989 2.64338 4.43111C2.7893 4.79002 3.00256 5.13772 3.32807 5.5415C3.91175 6.25933 4.5291 6.82013 5.20257 7.24634C5.29237 7.30242 5.38217 7.34729 5.46074 7.39215C5.53931 7.4258 5.60666 7.47067 5.674 7.50431C5.68523 7.50431 5.68523 7.51553 5.69645 7.51553C5.7638 7.54918 5.83115 7.57161 5.89849 7.57161C6.06686 7.57161 6.17911 7.45945 6.21278 7.4258L6.94238 6.69676C7.00972 6.62946 7.13319 6.53973 7.26789 6.53973C7.40258 6.53973 7.5036 6.62946 7.58218 6.69676L8.74953 7.86323C9.01892 8.13241 8.89545 8.37917 8.7383 8.53619C8.67096 8.62592 8.58116 8.70444 8.49136 8.79416ZM5.2587 2.14303C5.28114 1.986 5.42706 1.88506 5.58421 1.91871C6.25768 2.03087 6.86381 2.34492 7.34646 2.83842C7.82912 3.33193 8.1434 3.9376 8.26687 4.59935C8.28932 4.75637 8.1883 4.90218 8.04238 4.92462C8.03116 4.92462 8.00871 4.92462 7.99748 4.92462C7.86279 4.92462 7.73932 4.82367 7.71687 4.68908C7.62707 4.13949 7.35769 3.62355 6.9536 3.23099C6.54952 2.82721 6.04441 2.56924 5.49441 2.46829C5.32604 2.44586 5.22502 2.30005 5.2587 2.14303ZM9.52402 4.61057C9.35565 3.62355 8.88422 2.72626 8.17708 2.00843C7.45871 1.29061 6.56074 0.830746 5.57298 0.662505C5.41584 0.640073 5.31482 0.494264 5.34849 0.337238C5.38217 0.180213 5.51686 0.0792685 5.674 0.112917C6.76278 0.292374 7.77299 0.808314 8.56994 1.60466C9.36688 2.401 9.89443 3.41044 10.074 4.50962C10.0965 4.66665 9.99545 4.81245 9.84953 4.83489C9.83831 4.83489 9.81586 4.83489 9.80464 4.83489C9.66994 4.8461 9.54647 4.74516 9.52402 4.61057Z"
                              fill="#404040"
                              fillOpacity="0.6"
                           />
                        </svg>
                        <span>{details.phone}</span>
                     </div>
                  )}
               </div>
            )}
            {/* address */}
            {!isEmpty(address) && (
               <div
                  title={normalizeAddress(address)}
                  className="hern-delivery-progress__address"
                  style={status !== 'SUCCEEDED' ? { opacity: '0.6' } : {}}
               >
                  <p>
                     <span>
                        {step === 'order-drop-off'
                           ? 'Drop off to '
                           : 'Pick up from '}
                        :
                     </span>
                     &nbsp;
                     {normalizeAddress(address)}
                  </p>
               </div>
            )}
         </div>
      </div>
   )
}
const getIcon = step => {
   switch (step) {
      case 'delivery-request':
         return <DeliveryInfoIcons.DeliveryRequested />
      case 'driver-assigned':
         return <DeliveryInfoIcons.Driver />
      case 'order-picked-up':
         return <DeliveryInfoIcons.Pickup />
      case 'order-drop-off':
         return <DeliveryInfoIcons.DropOff />
      case 'order-delivered':
         return <DeliveryInfoIcons.Delivered />
      default:
         return null
   }
}
const DeliveryMap = ({ deliveryInfo, onMapLoad }) => {
   const [directions, setDirections] = React.useState('')
   const containerStyle = {
      width: '100%',
      height: '400px',
   }
   const coordinates = React.useMemo(() => {
      return {
         driver: {
            lat: +deliveryInfo.tracking.location.latitude,
            lng: +deliveryInfo.tracking.location.longitude,
         },
         customer: {
            lat: +deliveryInfo.dropoff.dropoffInfo.customerAddress.lat,
            lng: +deliveryInfo.dropoff.dropoffInfo.customerAddress.lng,
         },
         organization: {
            lat: +deliveryInfo.pickup.pickupInfo.organizationAddress.lat,
            lng: +deliveryInfo.pickup.pickupInfo.organizationAddress.lng,
         },
      }
   }, [
      deliveryInfo.tracking.location.latitude,
      deliveryInfo.tracking.location.longitude,
      deliveryInfo.dropoff.dropoffInfo.customerAddress.lat,
      deliveryInfo.dropoff.dropoffInfo.customerAddress.lng,
      deliveryInfo.pickup.pickupInfo.organizationAddress.lat,
      deliveryInfo.pickup.pickupInfo.organizationAddress.lng,
   ])
   return (
      <div
         style={{
            position: 'relative',
            ...containerStyle,
         }}
      >
         {deliveryInfo.dropoff.status.value !== 'SUCCEEDED' ? (
            <>
               {deliveryInfo.tracking.eta && (
                  <div className="hern-delivery-info__map__time">
                     <p>
                        {deliveryInfo.tracking.eta?.dropoff > 0
                           ? `Estimated Time: ${
                                (deliveryInfo.tracking.eta?.pickup || 0) +
                                (deliveryInfo.tracking.eta?.dropoff || 0)
                             } mins`
                           : `${
                                deliveryInfo.assigned?.driverInfo
                                   ?.driverFirstName || 'Partner'
                             } reached at your location`}
                     </p>
                  </div>
               )}
               <GoogleMap
                  center={coordinates.driver}
                  zoom={10}
                  options={options} //options for disable default UI and add custom
                  onLoad={onMapLoad}
                  mapContainerStyle={containerStyle}
               >
                  {/* marker for store location */}
                  <Marker
                     position={coordinates.organization}
                     icon={{
                        url: 'https://dailykit-133-test.s3.us-east-2.amazonaws.com/icons/store.png',
                        ...(isClient && {
                           scaledSize: new window.google.maps.Size(30, 30),
                           origin: new window.google.maps.Point(0, 0),
                           anchor: new window.google.maps.Point(15, 15),
                        }),
                     }}
                  />
                  {/* marker for customer  */}
                  <Marker
                     position={coordinates.customer}
                     icon={{
                        url: 'https://dailykit-133-test.s3.us-east-2.amazonaws.com/icons/home.png',
                        ...(isClient && {
                           scaledSize: new window.google.maps.Size(30, 30),
                           origin: new window.google.maps.Point(0, 0),
                           anchor: new window.google.maps.Point(15, 15),
                        }),
                     }}
                  />
                  {/* marker for driver */}
                  <Marker
                     position={coordinates.driver}
                     icon={{
                        url: 'https://dailykit-133-test.s3.us-east-2.amazonaws.com/icons/driver.png',
                        ...(isClient && {
                           scaledSize: new window.google.maps.Size(30, 30),
                           origin: new window.google.maps.Point(0, 0),
                           anchor: new window.google.maps.Point(15, 15),
                        }),
                     }}
                  />

                  {/* DirectionService will rerender again and again
                  (so you'll face flickering issue in map) and you have
                  to stop it until get a response result from DirectionService callback */}
                  {!directions && (
                     <DirectionsService
                        options={{
                           destination: coordinates.customer,
                           origin: coordinates.organization,
                           travelMode: 'DRIVING',
                        }}
                        callback={(response, status) => {
                           if (status === 'OK') {
                              setDirections(response)
                           }
                        }}
                     />
                  )}
                  {directions && (
                     <DirectionsRenderer
                        options={{ suppressMarkers: true }}
                        directions={directions}
                     />
                  )}
               </GoogleMap>
            </>
         ) : (
            <div
               style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#e5e5e5',
                  ...containerStyle,
               }}
            >
               <p style={{ margin: 0, fontSize: '16px' }}>
                  Your order has been delivered.
               </p>
               <p style={{ margin: 0, fontWeight: 600, fontSize: '18px' }}>
                  {`Delivered in ${moment(
                     deliveryInfo.dropoff.status.timeStamp
                  ).diff(
                     moment(deliveryInfo.assigned.status.timeStamp),
                     'minutes'
                  )} mins`}{' '}
               </p>
            </div>
         )}
      </div>
   )
}
const subtleColorful = [
   {
      featureType: 'all',
      elementType: 'labels.text',
      stylers: [
         {
            color: '#878787',
         },
      ],
   },
   {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [
         {
            visibility: 'off',
         },
      ],
   },
   {
      featureType: 'landscape',
      elementType: 'all',
      stylers: [
         {
            color: '#f9f5ed',
         },
      ],
   },
   {
      featureType: 'road.highway',
      elementType: 'all',
      stylers: [
         {
            color: '#f5f5f5',
         },
      ],
   },
   {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [
         {
            color: '#c9c9c9',
         },
      ],
   },
   {
      featureType: 'water',
      elementType: 'all',
      stylers: [
         {
            color: '#aee0f4',
         },
      ],
   },
]

const options = {
   styles: subtleColorful,
   disableDefaultUI: true,
   zoomControl: true,
   fullscreenControl: true,
}
