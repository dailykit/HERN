import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'

import { useDelivery } from './state'
import { useUser, CartContext } from '../../context'
import { MUTATIONS } from '../../graphql'
import { CloseIcon } from '../../assets/icons'
import { useScript, isClient, get_env } from '../../utils'
import { Tunnel, Button, Form, Spacer } from '../../components'
const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const AddressTunnel = props => {
   const { outside = false, showAddressForm = true, onInputFiledSelect } = props
   const { user } = useUser()
   const { addToast } = useToasts()
   const { methods } = React.useContext(CartContext)
   const { state, dispatch } = outside
      ? { state: {}, dispatch: {} }
      : useDelivery()
   const [formStatus, setFormStatus] = React.useState('PENDING')
   const [address, setAddress] = React.useState(null)
   const [createAddress] = useMutation(MUTATIONS.CUSTOMER.ADDRESS.CREATE, {
      onCompleted: () => {
         toggleTunnel(false)
         setFormStatus('SAVED')
         addToast('Address has been saved.', {
            appearance: 'success',
         })
         dispatch({ type: 'SET_ADDRESS', payload: address })
         // fb pixel custom event for adding a new address
         ReactPixel.trackCustom('addAddress', address)
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })
   const [loaded, error] = useScript(
      isClient
         ? `https://maps.googleapis.com/maps/api/js?key=${get_env(
              'GOOGLE_API_KEY'
           )}&libraries=places`
         : ''
   )

   const formatAddress = async input => {
      if (!isClient) return 'Runs only on client side.'

      const response = await fetch(
         `https://maps.googleapis.com/maps/api/geocode/json?key=${
            isClient ? get_env('GOOGLE_API_KEY') : ''
         }&address=${encodeURIComponent(input.description)}`
      )
      const data = await response.json()
      if (data.status === 'OK' && data.results.length > 0) {
         const [result] = data.results

         const address = {
            line1: '',
            line2: input?.description,
            searched: input?.description,
            lat: result.geometry.location.lat.toString(),
            lng: result.geometry.location.lng.toString(),
         }

         result.address_components.forEach(node => {
            if (node.types.includes('street_number')) {
               address.line2 = `${node.long_name} `
            }
            if (node.types.includes('route')) {
               address.line2 += node.long_name
            }
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
         if (showAddressForm) {
            setAddress(address)
         }
         onInputFiledSelect && onInputFiledSelect(address)
         setFormStatus('IN_PROGRESS')
      }
   }
   const handleSubmit = () => {
      setFormStatus('SAVING')
      // if user authenticate than add address to users details
      if (user?.keycloakId) {
         createAddress({
            variables: {
               object: { ...address, keycloakId: user?.keycloakId },
            },
         })
      } else {
         // add address detail into current cart
         const cartId = localStorage.getItem('cart-id')
         methods.cart.update({
            variables: {
               id: cartId,
               _set: {
                  address: address,
               },
            },
         })
      }
      setAddress(null)
   }

   const toggleTunnel = (value = false) => {
      dispatch({ type: 'TOGGLE_TUNNEL', payload: value })
   }

   if (outside) {
      return (
         <>
            <section className="hern-delivery__address-tunnel__address-search">
               <Form.Label>Search Address</Form.Label>
               {loaded && !error && (
                  <GooglePlacesAutocomplete
                     inputClassName="hern-store-location-selector-main__location-input"
                     onSelect={data => formatAddress(data)}
                     apiKey={get_env('GOOGLE_API_KEY')}
                  />
               )}
            </section>
            {address && (
               <div className="hern-address__address-form">
                  <Form.Field>
                     <Form.Label>
                        Apartment/Building Info/Street info*
                     </Form.Label>
                     <Form.Text
                        type="text"
                        placeholder="Enter apartment/building info/street info"
                        value={address.line1 || ''}
                        onChange={e =>
                           setAddress({ ...address, line1: e.target.value })
                        }
                     />
                  </Form.Field>
                  <Form.Field>
                     <Form.Label>Line 2</Form.Label>
                     <Form.Text
                        type="text"
                        placeholder="Enter line 2"
                        value={address.line2 || ''}
                        onChange={e =>
                           setAddress({ ...address, line2: e.target.value })
                        }
                     />
                  </Form.Field>
                  <Form.Field>
                     <Form.Label>Landmark</Form.Label>
                     <Form.Text
                        type="text"
                        value={address.landmark || ''}
                        placeholder="Enter landmark"
                        onChange={e =>
                           setAddress({ ...address, landmark: e.target.value })
                        }
                     />
                  </Form.Field>

                  <Form.Field>
                     <Form.Label>City*</Form.Label>
                     <Form.Text
                        type="text"
                        placeholder="Enter city"
                        value={address.city || ''}
                        onChange={e =>
                           setAddress({ ...address, city: e.target.value })
                        }
                     />
                  </Form.Field>
                  <Form.Field>
                     <Form.Label>State</Form.Label>
                     <Form.Text readOnly value={address.state} />
                  </Form.Field>

                  <div className="hern-delivery__address-tunnel__country-zip-code">
                     <Form.Field>
                        <Form.Label>Country</Form.Label>
                        <Form.Text readOnly value={address.country} />
                     </Form.Field>
                     <Form.Field>
                        <Form.Label>Zipcode</Form.Label>
                        <Form.Text
                           // readOnly={Boolean(address.zipcode)}
                           value={address.zipcode}
                           onChange={e =>
                              setAddress({
                                 ...address,
                                 zipcode: e.target.value,
                              })
                           }
                        />
                     </Form.Field>
                  </div>
                  <Form.Field>
                     <Form.Label>Label</Form.Label>
                     <Form.Text
                        type="text"
                        value={address.label || ''}
                        placeholder="Enter label for this address"
                        onChange={e =>
                           setAddress({ ...address, label: e.target.value })
                        }
                     />
                  </Form.Field>
                  <Form.Field>
                     <Form.Label>Dropoff Instructions</Form.Label>
                     <Form.TextArea
                        type="text"
                        value={address.notes || ''}
                        placeholder="Enter dropoff instructions"
                        onChange={e =>
                           setAddress({ ...address, notes: e.target.value })
                        }
                     />
                  </Form.Field>
                  <Button
                     size="sm"
                     onClick={() => handleSubmit()}
                     disabled={
                        !address?.line1 ||
                        !address?.city ||
                        !address?.zipcode ||
                        formStatus === 'SAVING'
                     }
                  >
                     {formStatus === 'SAVING' ? 'Saving...' : 'Save Address'}
                  </Button>
                  <Spacer />
               </div>
            )}
         </>
      )
   }
   return (
      <Tunnel
         isOpen={state.address.tunnel}
         toggleTunnel={() => toggleTunnel(false)}
         size="sm"
      >
         <Tunnel.Header title="Add Address">
            <Button size="sm" onClick={() => toggleTunnel(false)}>
               <CloseIcon
                  size={20}
                  className="hern-delivery__address-tunnel__close-icon"
               />
            </Button>
         </Tunnel.Header>
         <Tunnel.Body>
            <section className="hern-delivery__address-tunnel__address-search">
               <Form.Label>Search Address</Form.Label>
               {loaded && !error && (
                  <GooglePlacesAutocomplete
                     onSelect={data => formatAddress(data)}
                  />
               )}
            </section>
            {address && (
               <>
                  <Form.Field>
                     <Form.Label>
                        Apartment/Building Info/Street info*
                     </Form.Label>
                     <Form.Text
                        type="text"
                        placeholder="Enter apartment/building info/street info"
                        value={address.line1 || ''}
                        onChange={e =>
                           setAddress({ ...address, line1: e.target.value })
                        }
                     />
                  </Form.Field>
                  <Form.Field>
                     <Form.Label>Line 2</Form.Label>
                     <Form.Text
                        type="text"
                        placeholder="Enter line 2"
                        value={address.line2 || ''}
                        onChange={e =>
                           setAddress({ ...address, line2: e.target.value })
                        }
                     />
                  </Form.Field>
                  <Form.Field>
                     <Form.Label>Landmark</Form.Label>
                     <Form.Text
                        type="text"
                        value={address.landmark || ''}
                        placeholder="Enter landmark"
                        onChange={e =>
                           setAddress({ ...address, landmark: e.target.value })
                        }
                     />
                  </Form.Field>

                  <Form.Field>
                     <Form.Label>City*</Form.Label>
                     <Form.Text
                        type="text"
                        placeholder="Enter city"
                        value={address.city || ''}
                        onChange={e =>
                           setAddress({ ...address, city: e.target.value })
                        }
                     />
                  </Form.Field>
                  <Form.Field>
                     <Form.Label>State</Form.Label>
                     <Form.Text readOnly value={address.state} />
                  </Form.Field>

                  <div className="hern-delivery__address-tunnel__country-zip-code">
                     <Form.Field>
                        <Form.Label>Country</Form.Label>
                        <Form.Text readOnly value={address.country} />
                     </Form.Field>
                     <Form.Field>
                        <Form.Label>Zipcode</Form.Label>
                        <Form.Text readOnly value={address.zipcode} />
                     </Form.Field>
                  </div>
                  <Form.Field>
                     <Form.Label>Label</Form.Label>
                     <Form.Text
                        type="text"
                        value={address.label || ''}
                        placeholder="Enter label for this address"
                        onChange={e =>
                           setAddress({ ...address, label: e.target.value })
                        }
                     />
                  </Form.Field>
                  <Form.Field>
                     <Form.Label>Dropoff Instructions</Form.Label>
                     <Form.TextArea
                        type="text"
                        value={address.notes || ''}
                        placeholder="Enter dropoff instructions"
                        onChange={e =>
                           setAddress({ ...address, notes: e.target.value })
                        }
                     />
                  </Form.Field>
                  <Button
                     size="sm"
                     onClick={() => handleSubmit()}
                     disabled={
                        !address?.line1 ||
                        !address?.city ||
                        formStatus === 'SAVING'
                     }
                  >
                     {formStatus === 'SAVING' ? 'Saving...' : 'Save Address'}
                  </Button>
                  <Spacer />
               </>
            )}
         </Tunnel.Body>
      </Tunnel>
   )
}
