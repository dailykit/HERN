import React from 'react'
import tw, { styled } from 'twin.macro'
import { useMutation } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'

import { useDelivery } from './state'
import { useUser } from '../../context'
import { MUTATIONS } from '../../graphql'
import { CloseIcon } from '../../assets/icons'
import { useScript, isClient, get_env } from '../../utils'
import { Tunnel, Button, Form, Spacer } from '../../components'

export const AddressTunnel = () => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const { state, dispatch } = useDelivery()
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
         setAddress(address)
         setFormStatus('IN_PROGRESS')
      }
   }

   const handleSubmit = () => {
      setFormStatus('SAVING')
      createAddress({
         variables: {
            object: { ...address, keycloakId: user?.keycloakId },
         },
      })
   }

   const toggleTunnel = (value = false) => {
      dispatch({ type: 'TOGGLE_TUNNEL', payload: value })
   }

   return (
      <Tunnel
         isOpen={state.address.tunnel}
         toggleTunnel={() => toggleTunnel(false)}
         size="sm"
      >
         <Tunnel.Header title="Add Address">
            <Button size="sm" onClick={() => toggleTunnel(false)}>
               <CloseIcon size={20} tw="stroke-current" />
            </Button>
         </Tunnel.Header>
         <Tunnel.Body>
            <AddressSearch>
               <Form.Label>Search Address</Form.Label>
               {loaded && !error && (
                  <GooglePlacesAutocomplete
                     onSelect={data => formatAddress(data)}
                  />
               )}
            </AddressSearch>
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
                  <div tw="flex flex-col md:flex-row gap-3">
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
                        <FormPlaceholder>{address.state}</FormPlaceholder>
                     </Form.Field>
                  </div>
                  <div tw="flex flex-col md:flex-row gap-3">
                     <Form.Field>
                        <Form.Label>Country</Form.Label>
                        <FormPlaceholder>{address.country}</FormPlaceholder>
                     </Form.Field>
                     <Form.Field>
                        <Form.Label>Zipcode</Form.Label>
                        <FormPlaceholder>{address.zipcode}</FormPlaceholder>
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

const AddressSearch = styled.section`
   margin-bottom: 16px;
   .google-places-autocomplete {
      width: 100%;
      position: relative;
   }
   .google-places-autocomplete__input {
      ${tw`border-b h-8 w-full focus:outline-none focus:border-gray-700`}
   }
   .google-places-autocomplete__input:active,
   .google-places-autocomplete__input:focus,
   .google-places-autocomplete__input:hover {
      outline: 0;
      border: none;
   }
   .google-places-autocomplete__suggestions-container {
      background: #fff;
      border-radius: 0 0 5px 5px;
      color: #000;
      position: absolute;
      width: 100%;
      z-index: 2;
      box-shadow: 0 1px 16px 0 rgba(0, 0, 0, 0.09);
   }
   .google-places-autocomplete__suggestion {
      font-size: 1rem;
      text-align: left;
      padding: 10px;
      cursor: pointer;
   }
   .google-places-autocomplete__suggestion:hover {
      background: rgba(0, 0, 0, 0.1);
   }
   .google-places-autocomplete__suggestion--active {
      background: #e0e3e7;
   }
`

const FormPlaceholder = styled.span`
   ${tw`py-2 px-3 border bg-gray-100`}
`
