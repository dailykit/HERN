import React, { useState, useEffect } from 'react'
import GoogleMapReact from 'google-map-react'
import { LocationMarker, CloseIcon } from '../assets/icons'
import { CSSTransition } from 'react-transition-group'
import { get_env, useDelivery, autoSelectStore } from '../utils'
import { Form, Button } from '.'
import { useConfig } from '../lib'

const RefineLocation = props => {
   // props
   const { fulfillmentType } = props
   const { orderTabs, dispatch } = useConfig()

   // component state
   const [centerCoordinate, setCenterCoordinate] = useState({})
   const [address, setAddress] = React.useState(props.address)
   const [isStoreAvailableOnAddress, setIsStoreAvailableOnAddress] =
      React.useState(true)
   const [additionalAddressInfo, setAdditionalAddressInfo] = useState({
      line: '',
      landmark: '',
      label: '',
      notes: '',
   })
   const [selectedStore, setSelectedStore] = useState(null)
   console.log('this is address', address)

   // defaultProps for google map
   const defaultProps = {
      center: {
         lat: +address.latitude,
         lng: +address.longitude,
      },
      zoom: 16,
   }

   const onClickOnMap = () => {
      console.log('hello')
   }

   // handle submit and proceed
   const handleOnSubmit = () => {
      const selectedOrderTab = orderTabs.find(
         x => x.orderFulfillmentTypeLabel === fulfillmentType
      )

      localStorage.setItem('orderTab', JSON.stringify(selectedOrderTab))
      localStorage.setItem(
         'storeLocationId',
         JSON.stringify(selectedStore.location.id)
      )
      localStorage.setItem(
         'userLocation',
         JSON.stringify({ ...address, ...additionalAddressInfo })
      )
      dispatch({
         type: 'SET_LOCATION_ID',
         payload: selectedStore.location.id,
      })
      dispatch({
         type: 'SET_SELECTED_ORDER_TAB',
         payload: fulfillmentType,
      })
   }

   const onChangeMap = ({ center, zoom, bounds, marginBounds }) => {
      // console.log('onChange', center, zoom, bounds, marginBounds)
      console.log('thisIsCenter', center)
      setCenterCoordinate(prev => ({
         ...prev,
         latitude: center.lat,
         longitude: center.lng,
      }))
      fetch(
         `https://maps.googleapis.com/maps/api/geocode/json?latlng=${
            center.lat
         },${center.lng}&key=${get_env('GOOGLE_API_KEY')}`
      )
         .then(res => res.json())
         .then(data => {
            if (data.status === 'OK' && data.results.length > 0) {
               const formatted_address =
                  data.results[0].formatted_address.split(',')
               const mainText = formatted_address
                  .slice(0, formatted_address.length - 3)
                  .join(',')
               const secondaryText = formatted_address
                  .slice(formatted_address.length - 3)
                  .join(',')
               const address = {}
               data.results[0].address_components.forEach(node => {
                  if (node.types.includes('locality')) {
                     address.city = node.long_name
                  }
                  if (node.types.includes('administrative_area_level_1')) {
                     address.state = node.long_name
                  }
                  if (node.types.includes('country')) {
                     address.country = node.long_name
                  }
                  if (node.types.includes('postal_code')) {
                     address.zipcode = node.long_name
                  }
               })
               setAddress(prev => ({
                  mainText,
                  secondaryText,
                  ...address,
                  latitude: center.lat,
                  longitude: center.lng,
               }))
            }
         })
         .catch(e => {
            console.log('error', e)
         })
   }

   const { onDemandBrandRecurrence, preOrderBrandRecurrence, brandLocations } =
      useDelivery(address, fulfillmentType)

   useEffect(() => {
      if (
         address &&
         brandLocations &&
         (onDemandBrandRecurrence || preOrderBrandRecurrence)
      ) {
         const type = fulfillmentType
         let recurrencesDetails = {}
         switch (type) {
            case 'PREORDER_DELIVERY':
               recurrencesDetails = {
                  brandRecurrences: preOrderBrandRecurrence,
                  fulfillmentType: 'PREORDER_DELIVERY',
               }
               break
            case 'ONDEMAND_DELIVERY':
               recurrencesDetails = {
                  brandRecurrences: onDemandBrandRecurrence,
                  fulfillmentType: 'ONDEMAND_DELIVERY',
               }
               break
         }
         ;(async () => {
            const [result, fulfillmentStatus] = await autoSelectStore(
               brandLocations,
               recurrencesDetails.brandRecurrences,
               recurrencesDetails.fulfillmentType,
               address
            )
            console.log('results', result, fulfillmentStatus)
            const availableStores = result.filter(
               x => x[fulfillmentStatus]?.status
            )
            if (availableStores.length > 0) {
               setIsStoreAvailableOnAddress(true)
               setSelectedStore(availableStores[0])
            } else {
               setIsStoreAvailableOnAddress(false)
            }
         })()
      }
   }, [
      address,
      brandLocations,

      preOrderBrandRecurrence,
      onDemandBrandRecurrence,
   ])

   return (
      <div className="hern-refine-location">
         <div className="hern-refine-location_content">
            <RefineLocationHeader />
            <div>
               <div
                  style={{
                     height: '200px',
                     width: '100%',
                     position: 'relative',
                  }}
               >
                  <UserLocationMarker />
                  <GoogleMapReact
                     bootstrapURLKeys={{ key: get_env('GOOGLE_API_KEY') }}
                     defaultCenter={defaultProps.center}
                     defaultZoom={defaultProps.zoom}
                     onClick={onClickOnMap}
                     onChildClick={(a, b, c, d) => {
                        console.log('childClick', a, b, c, d)
                     }}
                     onChange={onChangeMap}
                     options={{ gestureHandling: 'greedy' }}
                  ></GoogleMapReact>
               </div>
            </div>
            <AddressInfo
               address={address}
               isStoreAvailableOnAddress={isStoreAvailableOnAddress}
            />
            <AddressForm
               isStoreAvailableOnAddress={isStoreAvailableOnAddress}
               additionalAddressInfo={additionalAddressInfo}
               setAdditionalAddressInfo={setAdditionalAddressInfo}
               handleOnSubmit={handleOnSubmit}
            />
         </div>
      </div>
   )
}

const UserLocationMarker = () => {
   return (
      <LocationMarker
         size={48}
         style={{
            position: 'absolute',
            top: 'calc(52.5% - 24px)',
            left: '49.5%',
            zIndex: '1000',
            transform: 'translate(-50%,-50%)',
         }}
      />
   )
}

const RefineLocationHeader = () => {
   return (
      <div className="hern-store-location-selector-header">
         <div className="hern-store-location-selector-header-left">
            <CloseIcon size={16} color="#404040CC" stroke="currentColor" />
            <span>Refine Your Location</span>
         </div>
      </div>
   )
}

const AddressForm = ({
   isStoreAvailableOnAddress,
   additionalAddressInfo,
   setAdditionalAddressInfo,
   handleOnSubmit,
}) => {
   const [addressWarnings, setAddressWarnings] = React.useState({
      line1: false,
   }) // to show warning for required field
   const [address] = React.useState({})

   return (
      <div style={{ position: 'relative' }}>
         <div className="hern-refine-location__address-form">
            <Form.Field className="hern-refine-location__address-form-field">
               <Form.Label>
                  Apartment/Building Info/Street info*{' '}
                  <span className="hern-address-warning">
                     {addressWarnings?.line1 ? 'fill this field' : null}
                  </span>
               </Form.Label>
               <Form.Text
                  className="hern-refine-location__address-input"
                  type="text"
                  placeholder="Enter apartment/building info/street info"
                  value={additionalAddressInfo?.line1 || ''}
                  onChange={e => {
                     console.log('evalue', e.target.value)
                     if (!e.target.value) {
                        setAddressWarnings(prev => ({
                           ...prev,
                           line1: true,
                        }))
                     } else {
                        setAddressWarnings(prev => ({
                           ...prev,
                           line1: false,
                        }))
                     }
                     setAdditionalAddressInfo({
                        ...additionalAddressInfo,
                        line1: e.target.value,
                     })
                  }}
               />
            </Form.Field>
            <Form.Field className="hern-refine-location__address-form-field">
               <Form.Label>Landmark</Form.Label>
               <Form.Text
                  className="hern-refine-location__address-input"
                  type="text"
                  value={additionalAddressInfo?.landmark || ''}
                  placeholder="Enter landmark"
                  onChange={e =>
                     setAdditionalAddressInfo({
                        ...additionalAddressInfo,
                        landmark: e.target.value,
                     })
                  }
               />
            </Form.Field>

            <Form.Field className="hern-refine-location__address-form-field">
               <Form.Label>Label</Form.Label>
               <Form.Text
                  className="hern-refine-location__address-input"
                  type="text"
                  value={additionalAddressInfo?.label || ''}
                  placeholder="Enter label for this address"
                  onChange={e =>
                     setAdditionalAddressInfo({
                        ...additionalAddressInfo,
                        label: e.target.value,
                     })
                  }
               />
            </Form.Field>
            <Form.Field className="hern-refine-location__address-form-field">
               <Form.Label>Dropoff Instructions</Form.Label>
               <Form.TextArea
                  className="hern-refine-location__address-text-area"
                  type="text"
                  value={additionalAddressInfo?.notes || ''}
                  placeholder="Enter dropoff instructions"
                  onChange={e =>
                     setAdditionalAddressInfo({
                        ...additionalAddressInfo,
                        notes: e.target.value,
                     })
                  }
               />
            </Form.Field>
         </div>
         <Button
            size="sm"
            onClick={handleOnSubmit}
            className="hern-refine-location__save-proceed-btn"
            disabled={
               !isStoreAvailableOnAddress || !additionalAddressInfo?.line1
            }
         >
            Save & Proceed
         </Button>
      </div>
   )
}

const AddressInfo = props => {
   const { address, isStoreAvailableOnAddress } = props
   return (
      <div className="hern-store-location-selector__user-address">
         <div className="hern-store-location-selector__user-address-info">
            <span className="hern-store-location-selector__user-address-info-text hern-store-location-selector__user-address-info-main-text">
               {address.mainText}
            </span>
            <br />
            <span className="hern-store-location-selector__user-address-info-text hern-store-location-selector__user-address-info-secondary-text">
               {address.secondaryText} {address.zipcode}
            </span>
         </div>
         {!isStoreAvailableOnAddress && (
            <div className="hern-refine-location__no-store-available">
               No store available on this location.
            </div>
         )}
      </div>
   )
}

export const RefineLocationPopup = props => {
   const { showRefineLocation } = props
   return (
      <CSSTransition
         in={showRefineLocation}
         timeout={100}
         unmountOnExit
         classNames="hern-store-refine-location__css-transition"
      >
         <RefineLocation {...props} />
      </CSSTransition>
   )
}
