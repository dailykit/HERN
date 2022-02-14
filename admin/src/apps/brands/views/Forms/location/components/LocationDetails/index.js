import { Text } from '@dailykit/ui'
import GoogleMapReact from 'google-map-react'
import React from 'react'
import { get_env } from '../../../../../../../shared/utils'
import { LocationMarkerIcon } from '../../../../../assets/icons'
import { StyledAddress, StyledContainer, StyledMap } from './styled'

const LocationDetails = ({ state, locationId }) => {
   console.log('state', state)
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
         lat: Number(state.lat),
         lng: Number(state.lng),
      },
      zoom: 15,
   }
   return (
      <>
         <StyledContainer>
            <StyledMap>
               <GoogleMapReact
                  bootstrapURLKeys={{
                     key: get_env('REACT_APP_MAPS_API_KEY'),
                  }}
                  defaultCenter={defaultProps.center}
                  center={defaultProps.center}
                  defaultZoom={defaultProps.zoom}
                  options={{ gestureHandling: 'greedy' }}
               >
                  <UserLocationMarker
                     lat={defaultProps.center.lat}
                     lng={defaultProps.center.lng}
                  />
               </GoogleMapReact>
            </StyledMap>
            <AddressInfo address={state} />
         </StyledContainer>
      </>
   )
}

export default LocationDetails

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
