import {
   ButtonGroup,
   Spacer,
   Text,
   TextButton,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import GoogleMapReact from 'google-map-react'
import React from 'react'
import { get_env } from '../../../../../../../shared/utils'
import { LocationMarkerIcon } from '../../../../../assets/icons'
import { EditLocationDetails } from '../../tunnels'
import {
   StyledAddress,
   StyledAddressContainer,
   StyledContainer,
   StyledMap,
} from './styled'

const LocationDetails = ({ state, locationId }) => {
   console.log('state', state)
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

   const UserLocationMarker = props => {
      // console.log('userLocationProps', props)
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
   const defaultProps = React.useMemo(
      () => ({
         center: {
            lat: parseFloat(state.lat),
            lng: parseFloat(state.lng),
         },
         zoom: 16,
      }),
      [state]
   )
   // console.log('default props', defaultProps)
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
                     lat={+defaultProps.center.lat}
                     lng={+defaultProps.center.lng}
                  />
               </GoogleMapReact>
            </StyledMap>
            <StyledAddressContainer>
               <AddressInfo address={state} />
               <ButtonGroup>
                  <TextButton
                     type="ghost"
                     size="sm"
                     onClick={() => openTunnel(1)}
                     title={'Click to edit store location'}
                  >
                     Edit Location
                  </TextButton>
               </ButtonGroup>
            </StyledAddressContainer>
         </StyledContainer>

         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} popup={true} size="md">
               <EditLocationDetails
                  state={state}
                  locationId={locationId}
                  close={closeTunnel}
               />
            </Tunnel>
         </Tunnels>
      </>
   )
}

export default LocationDetails

const AddressInfo = props => {
   const { address } = props
   return (
      <div style={{ padding: '0.5rem' }}>
         <Text as="h3">Your Store Address</Text>
         <Spacer size="0.5rem" />
         <StyledAddress>
            <span>
               {address.locationAddress.line1}, {address.locationAddress.line2}
            </span>
            <span>
               {address.city}, {address.state}, {address.country}{' '}
               {address.zipcode}
            </span>
         </StyledAddress>
      </div>
   )
}
