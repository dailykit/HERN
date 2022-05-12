import { Text, TunnelHeader } from '@dailykit/ui'
import GoogleMapReact from 'google-map-react'
import { parseInt } from 'lodash'
import React from 'react'
import { get_env } from '../../../../../../../shared/utils'
import { LocationMarkerIcon } from '../../../../../assets/icons'
import { Marker } from 'google-map-react'
import { StyledAddress, StyledAddressHeading } from './styled'

const DisplayLocation = ({ closeTunnel, selectedRowData, openTunnel }) => {
   console.log('selectedRowData', selectedRowData)

   const UserLocationMarker = () => {
      return (
         <LocationMarkerIcon
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
   const defaultProps = {
      center: {
         lat: Number(selectedRowData.lat),
         lng: Number(selectedRowData.lng),
      },
      zoom: 15,
   }
   return (
      <>
         <TunnelHeader
            title="Your Store on Map"
            close={() => closeTunnel(2)}
            right={{
               title: 'Edit',
               action: () => {
                  openTunnel(3)
                  closeTunnel(2)
               },
            }}
         />
         <div>
            <div
               style={{
                  height: '400px',
                  width: '100%',
                  position: 'relative',
               }}
            >
               <GoogleMapReact
                  bootstrapURLKeys={{
                     key: get_env('REACT_APP_MAPS_API_KEY'),
                  }}
                  defaultCenter={defaultProps.center}
                  defaultZoom={defaultProps.zoom}
                  options={{ gestureHandling: 'greedy' }}
               >
                  <UserLocationMarker
                     lat={defaultProps.center.lat}
                     lng={defaultProps.center.lng}
                  />
               </GoogleMapReact>
            </div>
         </div>
         <AddressInfo address={selectedRowData} />
      </>
   )
}

export default DisplayLocation

const AddressInfo = props => {
   const { address } = props
   return (
      <>
         <Text as="h3" style={{ margin: '1rem' }}>
            Your Store Address
         </Text>
         <StyledAddress>
            <span>
               {address.locationAddress.line1}, {address.locationAddress.line2}
            </span>
            <span>
               {address.city}, {address.state}, {address.country}{' '}
               {address.zipcode}
            </span>
         </StyledAddress>
      </>
   )
}
