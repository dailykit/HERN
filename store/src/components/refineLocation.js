import React, { useState } from 'react'
import GoogleMapReact from 'google-map-react'
import { LocationMarker, CloseIcon } from '../assets/icons'
import { CSSTransition } from 'react-transition-group'
import { get_env } from '../utils'
import { Form } from '.'

const RefineLocation = props => {
   // props
   //    const { address } = props

   // component state
   const [centerCoordinate, setCenterCoordinate] = useState({})

   // defaultProps for google map
   const defaultProps = {
      center: {
         lat: 26.90316230216457,
         lng: 75.73522352265464,
      },
      zoom: 16,
   }

   const onClickOnMap = () => {
      console.log('hello')
   }

   const onChangeMap = (center, zoom, bounds, marginBounds) => {
      // console.log('onChange', center, zoom, bounds, marginBounds)
      console.log('thisIsCenter', center)
      setCenterCoordinate(prev => ({
         ...prev,
         latitude: center.lat,
         longitude: center.lng,
      }))
   }

   const handleUpdateClick = () => {
      // setUserCoordinate(centerCoordinate)
   }
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
            <AddressForm />
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

const AddressForm = () => {
   const [addressWarnings, setAddressWarnings] = React.useState({
      line1: false,
   }) // to show warning for required field
   const [address] = React.useState({})
   return (
      <>
         <Form.Field className="hern-refine-location__address-form-field">
            <Form.Label>
               Apartment/Building Info/Street info*{' '}
               <span className="hern-address-warning">
                  {addressWarnings?.line1 ? 'fill this field' : null}
               </span>
            </Form.Label>
            <Form.Text
               type="text"
               placeholder="Enter apartment/building info/street info"
               value={address?.line1 || ''}
               onChange={e => {
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
                  setAddress({ ...address, line1: e.target.value })
               }}
            />
         </Form.Field>
         <Form.Field className="hern-refine-location__address-form-field">
            <Form.Label>Landmark</Form.Label>
            <Form.Text
               type="text"
               value={address?.landmark || ''}
               placeholder="Enter landmark"
               onChange={e =>
                  setAddress({
                     ...address,
                     landmark: e.target.value,
                  })
               }
            />
         </Form.Field>

         <Form.Field className="hern-refine-location__address-form-field">
            <Form.Label>Label</Form.Label>
            <Form.Text
               type="text"
               value={address?.label || ''}
               placeholder="Enter label for this address"
               onChange={e => setAddress({ ...address, label: e.target.value })}
            />
         </Form.Field>
         <Form.Field className="hern-refine-location__address-form-field">
            <Form.Label>Dropoff Instructions</Form.Label>
            <Form.TextArea
               type="text"
               value={address?.notes || ''}
               placeholder="Enter dropoff instructions"
               onChange={e => setAddress({ ...address, notes: e.target.value })}
            />
         </Form.Field>
      </>
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
