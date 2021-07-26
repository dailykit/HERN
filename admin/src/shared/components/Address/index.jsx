import React from 'react'
import gql from 'graphql-tag'
import styled from 'styled-components'
import { toast } from 'react-toastify'
import { useMutation } from '@apollo/react-hooks'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import { Tunnels, Tunnel, Spacer, TunnelHeader, Form } from '@dailykit/ui'

import { Flex } from '..'
import { useScript } from '../../utils/useScript'
import { isEmpty } from 'lodash'
import Banner from '../Banner'

const INSERT_ADDRESS = gql`
   mutation insertAddress($object: platform_customerAddress__insert_input!) {
      insertAddress: insert_platform_customerAddress__one(
         object: $object
         on_conflict: {
            constraint: customerAddress__pkey
            update_columns: [
               line1
               line2
               city
               state
               country
               zipcode
               notes
               label
               landmark
               searched
            ]
         }
      ) {
         id
         line1
         line2
         city
         state
         country
         zipcode
         notes
         label
         searched
         landmark
         keycloakId
      }
   }
`

export const AddressTunnel = ({
   tunnels,
   onSave,
   closeTunnel,
   address = {},
   keycloakId = '',
}) => {
   const [form, setForm] = React.useState({
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: '',
      zipcode: '',
      notes: '',
      label: '',
      landmark: '',
      searched: '',
   })
   const [isFormValid, setIsFormValid] = React.useState(false)
   const [upsert] = useMutation(INSERT_ADDRESS, {
      onCompleted: ({ insertAddress = {} }) => {
         if (keycloakId) {
            toast.success('Successfully created the address!')
         } else if (address?.id) {
            toast.success('Successfully updated the address!')
         }
         onSave(insertAddress)
         closeTunnel(1)
      },
      onError: () => {
         if (keycloakId) {
            toast.error('Failed to create the address!')
         } else if (address?.id) {
            toast.error('Failed to update the address!')
         }
      },
   })
   const [loaded, error] = useScript(
      `https://maps.googleapis.com/maps/api/js?key=${window._env_.REACT_APP_MAPS_API_KEY}&libraries=places`
   )

   React.useEffect(() => {
      const {
         line1 = '',
         line2 = '',
         city = '',
         state = '',
         zipcode = '',
         country = '',
      } = form
      setIsFormValid(
         [
            line1.trim(),
            line2.trim(),
            city.trim(),
            state.trim(),
            zipcode.trim(),
            country.trim(),
         ].every(node => node)
      )
   }, [form])

   React.useEffect(() => {
      if (address && !isEmpty(address)) {
         setForm(existing => ({ ...existing, ...address }))
      }
   }, [address])

   const formatAddress = React.useCallback(async input => {
      const response = await fetch(
         `https://maps.googleapis.com/maps/api/geocode/json?key=${
            window._env_.REACT_APP_MAPS_API_KEY
         }&address=${encodeURIComponent(input.description)}`
      )
      const data = await response.json()
      if (data.status === 'OK' && data.results.length > 0) {
         const [result] = data.results

         const node = {
            line1: '',
            line2: input?.description,
            searched: input?.description,
            lat: result.geometry.location.lat.toString(),
            lng: result.geometry.location.lng.toString(),
         }

         result.address_components.forEach(item => {
            if (item.types.includes('street_number')) {
               node.line2 = `${item.long_name} `
            }
            if (item.types.includes('route')) {
               node.line2 += item.long_name
            }
            if (item.types.includes('locality')) {
               node.city = item.long_name
            }
            if (item.types.includes('administrative_area_level_1')) {
               node.state = item.long_name
            }
            if (item.types.includes('country')) {
               node.country = item.long_name
            }
            if (item.types.includes('postal_code')) {
               node.zipcode = item.long_name
            }
         })
         setForm(existing => ({ ...existing, ...node }))
      }
   }, [])

   const onSubmit = () => {
      if (form?.id) {
         const { __typename, ...rest } = form
         upsert({
            variables: { object: { ...rest } },
         })
      } else if (keycloakId) {
         const { __typename, ...rest } = form
         upsert({
            variables: { object: { keycloakId, ...rest } },
         })
      } else {
         const { __typename, ...rest } = form
         onSave(rest)
         closeTunnel(1)
      }
   }

   const onChange = e => {
      const { name, value } = e.target
      setForm(existing => ({ ...existing, [name]: value }))
   }

   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel size="sm">
            <TunnelHeader
               title="Address"
               close={() => closeTunnel(1)}
               right={{
                  action: onSubmit,
                  title: 'Save',
                  disabled: !isFormValid,
               }}
            />
            <Banner id="address-tunnel-top" />
            <Flex padding="16px">
               <GPlaces>
                  {loaded && !error && (
                     <GooglePlacesAutocomplete
                        onSelect={formatAddress}
                        placeholder="Search your address"
                        renderInput={props => (
                           <Flex>
                              <Form.Group>
                                 <Form.Label htmlFor="search" title="search">
                                    <Flex container alignItems="center">
                                       Search on Google
                                    </Flex>
                                 </Form.Label>
                                 <Form.Text
                                    id="search"
                                    name="search"
                                    {...props}
                                 />
                              </Form.Group>
                           </Flex>
                        )}
                     />
                  )}
               </GPlaces>
               <Spacer size="16px" />
               <Styles.Divider />
               <Spacer size="24px" />
               <Form.Group>
                  <Form.Label htmlFor="line1" title="line1">
                     Apartment/Building Info/Street info*
                  </Form.Label>
                  <Form.Text
                     id="line1"
                     name="line1"
                     onChange={onChange}
                     value={form.line1}
                     placeholder="Enter Apartment/Building Info/Street info*"
                  />
               </Form.Group>
               <Spacer size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="line2" title="line2">
                     Line 2*
                  </Form.Label>
                  <Form.Text
                     id="line2"
                     name="line2"
                     onChange={onChange}
                     value={form.line2}
                     placeholder="Enter line 2"
                  />
               </Form.Group>
               <Spacer size="16px" />
               <Flex container alignItems="center">
                  <Form.Group>
                     <Form.Label htmlFor="city" title="city">
                        City*
                     </Form.Label>
                     <Form.Text
                        id="city"
                        name="city"
                        onChange={onChange}
                        value={form.city}
                        placeholder="Enter your city"
                     />
                  </Form.Group>
                  <Spacer size="16px" xAxis />
                  <Form.Group>
                     <Form.Label htmlFor="state" title="state">
                        State*
                     </Form.Label>
                     <Form.Text
                        id="state"
                        name="state"
                        onChange={onChange}
                        value={form.state}
                        placeholder="Enter your state"
                     />
                  </Form.Group>
               </Flex>
               <Spacer size="16px" />
               <Flex container alignItems="center">
                  <Form.Group>
                     <Form.Label htmlFor="country" title="country">
                        Country*
                     </Form.Label>
                     <Form.Text
                        id="country"
                        name="country"
                        onChange={onChange}
                        value={form.country}
                        placeholder="Enter your country"
                     />
                  </Form.Group>
                  <Spacer size="16px" xAxis />
                  <Form.Group>
                     <Form.Label htmlFor="zipcode" title="zipcode">
                        ZIP*
                     </Form.Label>
                     <Form.Text
                        id="zipcode"
                        name="zipcode"
                        onChange={onChange}
                        value={form.zipcode}
                        placeholder="Enter your zipcode"
                     />
                  </Form.Group>
               </Flex>
               <Spacer size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="landmark" title="landmark">
                     Landmark
                  </Form.Label>
                  <Form.Text
                     id="landmark"
                     name="landmark"
                     onChange={onChange}
                     value={form.landmark}
                     placeholder="Enter landmark"
                  />
               </Form.Group>
               <Spacer size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="label" title="label">
                     Label
                  </Form.Label>
                  <Form.Text
                     id="label"
                     name="label"
                     onChange={onChange}
                     value={form.label}
                     placeholder="Enter label"
                  />
               </Form.Group>
               <Spacer size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="notes" title="notes">
                     Dropoff Instructions
                  </Form.Label>
                  <Form.Text
                     id="notes"
                     name="notes"
                     onChange={onChange}
                     value={form.notes}
                     placeholder="Enter dropoff instructions"
                  />
               </Form.Group>
            </Flex>
            <Banner id="address-tunnel-bottom" />
         </Tunnel>
      </Tunnels>
   )
}

const Styles = {
   Divider: styled.hr`
      border: none;
      height: 1px;
      width: 100%;
      background: #e3e3e3;
   `,
}

const GPlaces = styled.section`
   .google-places-autocomplete {
      width: 100%;
      position: relative;
   }
   .google-places-autocomplete__input {
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
      :hover {
         background: rgba(0, 0, 0, 0.1);
      }
   }
   .google-places-autocomplete__suggestion--active {
      background: #e0e3e7;
   }
`
