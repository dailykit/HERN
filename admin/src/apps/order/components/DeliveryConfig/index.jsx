import React from 'react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import { useQuery, useSubscription } from '@apollo/react-hooks'
import {
   Text,
   Avatar,
   IconButton,
   useTunnel,
   Tunnels,
   Tunnel,
   TunnelHeader,
} from '@dailykit/ui'
import moment from 'moment'

import { useOrder } from '../../context'
import { QUERIES, DELIVERY_SERVICES, ORDER_DELIVERY_INFO } from '../../graphql'
import {
   Wrapper,
   StyledList,
   StyledDeliveryCard,
   DeliveryStates,
   StyledDeliveryBy,
   StyledTag,
} from './styled'
import { normalizeAddress, formatDate } from '../../utils'
import { ServiceInfo } from '../ServiceInfo'
import { InfoIcon } from '../../../../shared/assets/icons'
import { InlineLoader } from '../../../../shared/components'
import { get_env } from '../../../../shared/utils'

const formatTime = time =>
   moment(time).tz('Asia/Calcutta|Asia/Kolkata').format('YYYY-MM-DD hh:mm')
const isPickup = value => ['ONDEMAND_PICKUP', 'PREORDER_PICKUP'].includes(value)
const settings = {
   brand: {
      name: '',
   },
   address: {},
   contact: {
      phoneNo: '',
      email: '',
   },
   email: {
      name: '',
      email: '',
      template: {},
   },
}

export const DeliveryConfig = ({ closeTunnel: closeParentTunnel }) => {
   const {
      updateOrder,
      state: { delivery_config },
   } = useOrder()
   const [selectedService, setSelectedService] = React.useState(null)
   const [serviceInfo, setServiceInfo] = React.useState(null)
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const { loading: loadingOrder, data: { order = {} } = {} } = useSubscription(
      QUERIES.ORDER.DELIVERY_INFO,
      {
         variables: { id: delivery_config.orderId },
      }
   )
   const { loading: loadingServices, data: { deliveryServices = [] } = {} } =
      useQuery(QUERIES.DELIVERY.SERVICES)

   const viewInfo = (e, id) => {
      e.stopPropagation()
      setServiceInfo(id)
      openTunnel(1)
   }

   const addDeliveryPartner = async () => {
      console.log('add delivery partner', {
         id: order.id,
         set: selectedService.partnershipId
            ? {
                 deliveryPartnershipId: selectedService.partnershipId,
              }
            : null,
         append: {
            deliveryInfo: {
               deliveryId: '',
               webhookUrl: '',
               deliveryCompany: {
                  logo: selectedService.logo,
                  name: selectedService.companyName,
                  ...(selectedService.isThirdParty && {
                     id: selectedService.partnershipId,
                  }),
               },
               deliveryFee: {
                  value: '',
                  unit: '',
               },
               tracking: {
                  location: {
                     isAvailable: false,
                     longitude: '',
                     latitude: '',
                  },
                  code: {
                     isAvailable: false,
                     value: '',
                     url: '',
                  },
                  sms: {
                     isAvailable: false,
                  },
                  eta: '',
               },
               orderInfo: {
                  products: [].concat(
                     ...delivery_config?.order?.cart?.products.map(product => {
                        return product.items.map(item => {
                           return {
                              id: item.productId,
                              name: item.displayName,
                              quantity: item?.displayUnit || 1,
                              price: item?.price * 100 || 0,
                           }
                        })
                     })
                  ),
               },
               deliveryRequest: {
                  status: {
                     value: 'WAITING',
                     timeStamp: '',
                     description: '',
                     data: {},
                  },
                  distance: {
                     value: 0,
                     unit: 'mile',
                  },
               },
               assigned: {
                  status: {
                     value: 'WAITING',
                     timeStamp: '',
                     description: '',
                     data: {},
                  },
                  driverInfo: {
                     driverFirstName: '',
                     driverLastName: '',
                     driverPhone: '',
                     driverPicture: '',
                  },
                  vehicleInfo: {
                     vehicleType: '',
                     vehicleMake: '',
                     vehicleModel: '',
                     vehicleColor: '',
                     vehicleLicensePlateNumber: '',
                     vehicleLicensePlateState: '',
                  },
               },
               pickup: {
                  window: {
                     ...(isPickup(
                        delivery_config?.order?.cart.fulfillmentInfo.type
                     )
                        ? {
                             approved: {
                                startsAt: formatTime(
                                   delivery_config?.order?.cart.fulfillmentInfo
                                      .slot.from
                                ),
                                endsAt: formatTime(
                                   delivery_config?.order?.cart.fulfillmentInfo
                                      .slot.to
                                ),
                             },
                          }
                        : { approved: {} }),
                  },
                  status: {
                     value: 'WAITING',
                  },
                  confirmation: {
                     photo: {
                        data: {},
                        isRequired: false,
                     },
                     idProof: {
                        data: {},
                        isRequired: false,
                     },
                     signature: {
                        data: {},
                        isRequired: false,
                     },
                  },
                  pickupInfo: {
                     organizationId: process.env.ORGANIZATION_ID,
                     organizationName: settings.brand.name,
                     organizationPhone: settings.contact.phoneNo,
                     organizationEmail: settings.contact.email,
                     organizationAddress: {
                        line1: settings.address.line1,
                        line2: settings.address.line2,
                        city: settings.address.city,
                        state: settings.address.state,
                        country: settings.address.country,
                        zipcode: settings.address.zip,
                        latitude: settings.address.lat,
                        longitude: settings.address.lng,
                     },
                  },
               },
               ...(isPickup(delivery_config?.order?.cart.fulfillmentInfo.type)
                  ? {
                       dropoff: {
                          dropoffInfo: {
                             ...(delivery_config?.order?.cart.customer &&
                                Object.keys(
                                   delivery_config?.order?.cart.customer
                                ).length > 0 && {
                                   customerEmail:
                                      delivery_config?.order?.cart.customer
                                         .customerEmail,
                                   customerPhone:
                                      delivery_config?.order?.cart.customer
                                         .customerPhone,
                                   customerLastName:
                                      delivery_config?.order?.cart.customer
                                         .customerLastName,
                                   customerFirstName:
                                      delivery_config?.order?.cart.customer
                                         .customerFirstName,
                                }),
                          },
                       },
                    }
                  : {
                       dropoff: {
                          status: {
                             value: 'WAITING',
                          },
                          window: {
                             approved: {},
                             requested: {
                                startsAt: new Date(
                                   `${delivery_config?.order?.cart.fulfillmentInfo.date} ${delivery_config?.order?.cart.fulfillmentInfo.slot.from}`
                                ),
                                endsAt: new Date(
                                   `${delivery_config?.order?.cart.fulfillmentInfo.date} ${delivery_config?.order?.cart.fulfillmentInfo.slot.to}`
                                ),
                             },
                          },
                          confirmation: {
                             photo: {
                                data: {},
                                isRequired: false,
                             },
                             idProof: {
                                data: {},
                                isRequired: false,
                             },
                             signature: {
                                data: {},
                                isRequired: false,
                             },
                          },
                          dropoffInfo: {
                             ...(delivery_config?.order?.cart.customer &&
                                Object.keys(
                                   delivery_config?.order?.cart.customer
                                ).length > 0 && {
                                   customerEmail:
                                      delivery_config?.order?.cart.customer
                                         .customerEmail,
                                   customerPhone:
                                      delivery_config?.order?.cart.customer
                                         .customerPhone,
                                   customerLastName:
                                      delivery_config?.order?.cart.customer
                                         .customerLastName,
                                   customerFirstName:
                                      delivery_config?.order?.cart.customer
                                         .customerFirstName,
                                   ...('customerAddress' in
                                      delivery_config?.order?.cart
                                         .customerInfo &&
                                      delivery_config?.order?.cart.customer
                                         .customerAddress &&
                                      Object.keys(
                                         delivery_config?.order?.cart
                                            .customerInfo.customerAddress
                                      ).length > 0 && {
                                         customerAddress: {
                                            line1: delivery_config?.order?.cart
                                               .address.line1,
                                            line2: delivery_config?.order?.cart
                                               .address.line2,
                                            city: delivery_config?.order?.cart
                                               .address.city,
                                            state: delivery_config?.order?.cart
                                               .address.state,
                                            zipcode:
                                               delivery_config?.order?.cart
                                                  .address.zipcode,
                                            country:
                                               delivery_config?.order?.cart
                                                  .address.country,
                                            notes: delivery_config?.order?.cart
                                               .address.notes,
                                            label: delivery_config?.order?.cart
                                               .address.label,
                                            landmark:
                                               delivery_config?.order?.cart
                                                  .address.landmark,
                                         },
                                      }),
                                }),
                          },
                       },
                    }),
               return: {
                  status: {
                     value: 'WAITING',
                     timeStamp: '',
                     description: '',
                     data: {},
                  },
                  window: {
                     requested: {
                        id: '',
                        buffer: '',
                        startsAt: '',
                        endsAt: '',
                     },
                     approved: {
                        id: '',
                        startsAt: '',
                        endsAt: '',
                     },
                  },
                  confirmation: {
                     photo: {
                        isRequired: false,
                        data: {},
                     },
                     signature: {
                        isRequired: false,
                        data: {},
                     },
                     idProof: {
                        isRequired: false,
                        data: {},
                     },
                  },
                  returnInfo: {
                     organizationId: process.env.ORGANIZATION_ID,
                     organizationName: settings.brand.name,
                     organizationPhone: settings.contact.phoneNo,
                     organizationEmail: settings.contact.email,
                     organizationAddress: {
                        line1: settings.address.line1,
                        line2: settings.address.line2,
                        city: settings.address.city,
                        state: settings.address.state,
                        country: settings.address.country,
                        zipcode: settings.address.zip,
                        latitude: settings.address.lat,
                        longitude: settings.address.lng,
                     },
                  },
               },
            },
         },
      })
      // await updateOrder({
      //    id: order.id,
      //    set: selectedService.partnershipId
      //       ? {
      //            deliveryPartnershipId: selectedService.partnershipId,
      //         }
      //       : null,
      //    append: {
      //       deliveryInfo: {
      //          deliveryCompany: {
      //             logo: selectedService.logo,
      //             name: selectedService.companyName,
      //             ...(selectedService.isThirdParty && {
      //                id: selectedService.partnershipId,
      //             }),
      //          },
      //       },
      //    },
      // })
      closeParentTunnel(1)
   }

   const trackDelivery = () => {
      window.open(order.deliveryInfo.tracking.code.url, '__blank')
   }

   if (loadingOrder)
      return (
         <Wrapper>
            <InlineLoader />
         </Wrapper>
      )
   return (
      <Wrapper>
         {order.deliveryInfo?.deliveryCompany?.name ? (
            <>
               <TunnelHeader
                  close={() => closeParentTunnel(1)}
                  right={{
                     action: () => trackDelivery(),
                     title: 'Track',
                  }}
                  title={`Delivery - Order ${order.id}`}
               />
               <DeliveryDetails details={order} />
            </>
         ) : (
            <>
               <TunnelHeader
                  close={() => closeParentTunnel(1)}
                  right={{
                     action: () => addDeliveryPartner(),
                     title: 'Save',
                  }}
                  title={`Delivery - Order ${order.id}`}
               />
               <section data-type="tunnel-content">
                  <Text as="title">Available Delivery Partners</Text>
                  {loadingServices && <InlineLoader />}
                  <StyledList>
                     {deliveryServices.map(service => (
                        <li key={service.id}>
                           <section
                              onChange={() => setSelectedService(service)}
                           >
                              <input type="radio" name="service" />
                              <Avatar
                                 withName
                                 title={service.companyName}
                                 url={service.logo}
                              />
                           </section>
                           {service.isThirdParty && (
                              <IconButton
                                 type="outline"
                                 onClick={e =>
                                    viewInfo(e, service.partnershipId)
                                 }
                              >
                                 <InfoIcon />
                              </IconButton>
                           )}
                        </li>
                     ))}
                  </StyledList>
               </section>
               <Tunnels tunnels={tunnels}>
                  <Tunnel layer="1" size="sm">
                     <TunnelHeader
                        title="Delivery Partner Information"
                        close={() => closeTunnel(1)}
                     />
                     <ServiceInfo id={serviceInfo} />
                  </Tunnel>
               </Tunnels>
            </>
         )}
      </Wrapper>
   )
}

const DeliveryDetails = ({ details }) => {
   const [map, setMap] = React.useState(null)
   const [isLoading, setIsLoading] = React.useState(true)
   const [coordinates, setCoordinates] = React.useState({
      driver: null,
      customer: null,
      organization: null,
   })
   const [deliveryInfo, setDeliveryInfo] = React.useState(null)
   const [order, setOrder] = React.useState(null)

   React.useEffect(() => {
      const { deliveryInfo, ...rest } = details
      setOrder(rest)
      setDeliveryInfo(deliveryInfo)
      setCoordinates({
         driver: {
            lat: deliveryInfo.tracking.location.latitude,
            lng: deliveryInfo.tracking.location.longitude,
         },
         customer: {
            lat: deliveryInfo.dropoff.dropoffInfo.customerAddress.latitude,
            lng: deliveryInfo.dropoff.dropoffInfo.customerAddress.longitude,
         },
         organization: {
            lat: deliveryInfo.pickup.pickupInfo.organizationAddress.latitude,
            lng: deliveryInfo.pickup.pickupInfo.organizationAddress.longitude,
         },
      })
      setIsLoading(false)
   }, [details])

   const onLoad = React.useCallback(function callback(map) {
      const bounds = new window.google.maps.LatLngBounds()
      map.fitBounds(bounds)
      setMap(map)
   }, [])

   const onUnmount = React.useCallback(function callback(map) {
      setMap(null)
   }, [])

   const containerStyle = {
      width: '100%',
      height: '400px',
   }

   if (isLoading) return <InlineLoader />
   return (
      <main data-type="tunnel-content">
         <StyledDeliveryBy>
            <Text as="title">Delivery Status</Text>
            <Avatar
               withName
               url={deliveryInfo.deliveryCompany.logo}
               title={deliveryInfo.deliveryCompany.name || 'N/A'}
            />
         </StyledDeliveryBy>
         <LoadScript googleMapsApiKey={get_env('REACT_APP_MAPS_API_KEY')}>
            <GoogleMap
               zoom={15}
               onLoad={onLoad}
               onUnmount={onUnmount}
               clickableIcons={false}
               center={coordinates.driver}
               mapContainerStyle={containerStyle}
            >
               <Marker
                  position={coordinates.organization}
                  icon="https://dailykit-133-test.s3.us-east-2.amazonaws.com/icons/store.png"
               />
               <Marker
                  position={coordinates.customer}
                  icon="https://dailykit-133-test.s3.us-east-2.amazonaws.com/icons/home.png"
               />
               <Marker
                  position={coordinates.driver}
                  icon="https://dailykit-133-test.s3.us-east-2.amazonaws.com/icons/package.png"
               />
            </GoogleMap>
         </LoadScript>
         <section data-type="delivery-states">
            <DeliveryStates
               status={{
                  request: deliveryInfo.deliveryRequest.status.value,
                  assignment: deliveryInfo.assigned.status.value,
                  pickup: deliveryInfo.pickup.status.value,
                  dropoff: deliveryInfo.dropoff.status.value,
               }}
            >
               <DeliveryState
                  title="Delivery Request"
                  value={deliveryInfo.deliveryRequest.status.value}
                  time={deliveryInfo.deliveryRequest.status.timeStamp}
               />
               <DeliveryState
                  title="Driver Assigned"
                  value={deliveryInfo.assigned.status.value}
                  time={deliveryInfo.assigned.status.timeStamp}
               >
                  <div
                     style={{
                        display: 'flex',
                        alignItems: 'center',
                     }}
                  >
                     <Avatar
                        withName
                        url={deliveryInfo.assigned.driverInfo.driverPicture}
                        title={
                           deliveryInfo.assigned.driverInfo.driverFirstName
                              ? `${deliveryInfo.assigned.driverInfo.driverFirstName} ${deliveryInfo.assigned.driverInfo.driverLastName}`
                              : 'N/A'
                        }
                     />
                     &nbsp;&middot;&nbsp;
                     {deliveryInfo.assigned.driverInfo.driverPhone || 'N/A'}
                  </div>
               </DeliveryState>
               <DeliveryState
                  title="Pick Up"
                  value={deliveryInfo.pickup.status.value}
                  time={deliveryInfo.pickup.status.timeStamp}
               >
                  <div
                     style={{
                        display: 'flex',
                        alignItems: 'center',
                     }}
                  >
                     <Avatar
                        withName
                        title={deliveryInfo.pickup.pickupInfo.organizationName}
                     />
                     &nbsp;&middot;&nbsp;
                     {deliveryInfo.pickup.pickupInfo.organizationPhone || 'N/A'}
                  </div>

                  <div style={{ marginTop: 6 }}>
                     {normalizeAddress(
                        deliveryInfo.pickup.pickupInfo.organizationAddress
                     )}
                  </div>
               </DeliveryState>
               <DeliveryState
                  title="Drop Off"
                  value={deliveryInfo.dropoff.status.value}
                  time={deliveryInfo.dropoff.status.timeStamp}
               >
                  <div
                     style={{
                        display: 'flex',
                        alignItems: 'center',
                     }}
                  >
                     <Avatar
                        withName
                        title={`${deliveryInfo.dropoff.dropoffInfo.customerFirstName} ${deliveryInfo.dropoff.dropoffInfo.customerLastName}`}
                     />
                     &nbsp;&middot;&nbsp;
                     {deliveryInfo.dropoff.dropoffInfo.customerPhone || 'N/A'}
                  </div>
                  <div style={{ marginTop: 6 }}>
                     {normalizeAddress(
                        deliveryInfo.dropoff.dropoffInfo.customerAddress
                     )}
                  </div>
               </DeliveryState>
               <DeliveryState
                  title="Delivered"
                  value={
                     deliveryInfo.dropoff.status.value === 'SUCCEEDED'
                        ? 'SUCCEEDED'
                        : 'WAITING'
                  }
               />
            </DeliveryStates>
         </section>
      </main>
   )
}

const STATUS = {
   WAITING: 'Waiting',
   IN_PROGRESS: 'In Progress',
   SUCCEEDED: 'Completed',
   CANCELLED: 'Cancelled',
}

const DeliveryState = ({ title, value, time, children }) => {
   return (
      <StyledDeliveryCard>
         <section data-type="status">
            <span>
               <span>
                  {title || 'N/A'}
                  <StyledTag status={value}>{STATUS[value]}</StyledTag>
               </span>
               <span>{time && formatDate(time)}</span>
            </span>
         </section>
         {children && <div>{children}</div>}
      </StyledDeliveryCard>
   )
}
