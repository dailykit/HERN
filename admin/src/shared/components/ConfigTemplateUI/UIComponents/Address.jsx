import React from 'react'
import { isEmpty } from 'lodash'
import styled from 'styled-components'
import { Tooltip } from 'antd'
import { Spacer, Text, Form } from '@dailykit/ui'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import { Flex } from '../../index'
import { useScript } from '../../../utils/useScript'
import { get_env } from '../../../utils'

export const Address = ({ fieldDetail, path, onConfigChange, editMode }) => {
   return (
      <>
         {editMode ? (
            <Flex
               container
               alignItems="center"
               justifyContent="space-between"
               flexDirection="column"
            >
               <Flex container alignItems="flex-end">
                  <Form.Label title={fieldDetail.label} htmlFor="address">
                     {fieldDetail.label.toUpperCase()}
                  </Form.Label>
               </Flex>
               <Text as="p">{normalizeAddress(fieldDetail.value)}</Text>
               <AddressForm
                  path={path}
                  onConfigChange={onConfigChange}
                  address={fieldDetail.value}
                  settingId={'49'}
               />
            </Flex>
         ) : (
            <Flex
               container
               justifyContent="space-between"
               alignItems="center"
               margin={`0 0 0 10px`}
            >
               <Flex container alignItems="flex-end">
                  <Form.Label title={fieldDetail.label} htmlFor="text">
                     {fieldDetail.label.toUpperCase()}
                  </Form.Label>
               </Flex>
               <Form.Group>
                  <Text
                     as="h3"
                     style={{
                        fontSize: '15px',
                        width: '15rem',
                        color: '#555B6E',
                        marginRight: '-2rem',
                     }}
                  >
                     {normalizeAddress(fieldDetail.value)}
                  </Text>
               </Form.Group>
            </Flex>
         )}
      </>
   )
}

//for showing address
const normalizeAddress = (address = {}) => {
   if (isEmpty(address)) return 'No address added yet!'
   let result = ''
   if ('line1' in address) {
      result += address.line1
   }
   if ('line2' in address) {
      result += ', ' + address.line2
   }
   if ('city' in address) {
      result += ', ' + address.city
   }
   if ('state' in address) {
      result += ', ' + address.state
   }
   if ('country' in address) {
      result += ', ' + address.country
   }
   if ('zipcode' in address) {
      result += ', ' + address.zipcode
   }
   return result
}

//on edit address Form is shown
export const AddressForm = ({ path, address, onConfigChange }) => {
   const [populated, setPopulated] = React.useState(address)
   const [loaded, error] = useScript(
      `https://maps.googleapis.com/maps/api/js?key=${get_env(
         'REACT_APP_MAPS_API_KEY'
      )}&libraries=places`
   )

   //updates values in configTemplateUI (but save option in index.js)
   React.useEffect(() => {
      const e = { target: { name: path, value: populated } }
      onConfigChange(e, populated)
   }, [populated])

   const formatAddress = async address => {
      const response = await fetch(
         `https://maps.googleapis.com/maps/api/geocode/json?key=${get_env(
            'REACT_APP_MAPS_API_KEY'
         )}&address=${encodeURIComponent(address.description)}`
      )
      const data = await response.json()
      if (data.status === 'OK' && data.results.length > 0) {
         const [result] = data.results

         const address = {
            line2: '',
            lat: result.geometry.location.lat.toString(),
            lng: result.geometry.location.lng.toString(),
         }

         result.address_components.forEach(node => {
            if (node.types.includes('street_number')) {
               address.line1 = `${node.long_name} `
            }
            if (node.types.includes('route')) {
               address.line1 += node.long_name
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
         setPopulated(address)
      }
   }
   return (
      <Flex padding="16px">
         <GPlaces>
            {loaded && !error && (
               <GooglePlacesAutocomplete
                  placeholder=""
                  onSelect={data => formatAddress(data)}
                  renderInput={props => (
                     <Flex>
                        <Form.Group>
                           <Form.Label htmlFor="search" title="search">
                              <Flex container alignItems="center">
                                 Search on Google
                              </Flex>
                           </Form.Label>
                           <Form.Text id="search" name="search" {...props} />
                        </Form.Group>
                     </Flex>
                  )}
               />
            )}
         </GPlaces>
         {!isEmpty(populated) && (
            <>
               <Flex margin="24px 0">
                  <Form.Group>
                     <Form.Label htmlFor="line1" title="line1">
                        <Flex container alignItems="center">
                           Line 1
                        </Flex>
                     </Form.Label>
                     <Form.Text
                        id="line1"
                        name="line1"
                        value={populated.line1}
                        onChange={e =>
                           setPopulated({
                              ...populated,
                              line1: e.target.value,
                           })
                        }
                     />
                  </Form.Group>
                  <Spacer size="24px" />

                  <Form.Group>
                     <Form.Label htmlFor="line2" title="line2">
                        <Flex container alignItems="center">
                           Line 2
                        </Flex>
                     </Form.Label>
                     <Form.Text
                        id="line2"
                        name="line2"
                        value={populated.line2}
                        onChange={e =>
                           setPopulated({
                              ...populated,
                              line2: e.target.value,
                           })
                        }
                     />
                  </Form.Group>
                  <Spacer size="24px" />
               </Flex>
               <Flex container alignItems="center" margin="0 0 24px 0">
                  <Form.Group>
                     <Form.Label htmlFor="city" title="city">
                        <Flex container alignItems="center">
                           City
                        </Flex>
                     </Form.Label>
                     <Form.Text
                        id="city"
                        name="city"
                        value={populated.city}
                        onChange={e =>
                           setPopulated({
                              ...populated,
                              city: e.target.value,
                           })
                        }
                     />
                  </Form.Group>

                  <Spacer size="16px" xAxis />
                  <Form.Group>
                     <Form.Label htmlFor="state" title="state">
                        <Flex container alignItems="center">
                           State
                        </Flex>
                     </Form.Label>
                     <Form.Text
                        id="state"
                        name="state"
                        value={populated.state}
                        onChange={e =>
                           setPopulated({
                              ...populated,
                              state: e.target.value,
                           })
                        }
                     />
                  </Form.Group>
               </Flex>
               <Flex container alignItems="center" margin="0 0 24px 0">
                  <Form.Group>
                     <Form.Label htmlFor="country" title="country">
                        <Flex container alignItems="center">
                           Country
                        </Flex>
                     </Form.Label>
                     <Form.Text
                        id="country"
                        name="country"
                        value={populated.country}
                        onChange={e =>
                           setPopulated({
                              ...populated,
                              country: e.target.value,
                           })
                        }
                     />
                  </Form.Group>

                  <Spacer size="16px" xAxis />
                  <Form.Group>
                     <Form.Label htmlFor="zipcode" title="zipcode">
                        <Flex container alignItems="center">
                           ZIP
                        </Flex>
                     </Form.Label>
                     <Form.Text
                        id="zipcode"
                        name="zipcode"
                        value={populated.zipcode}
                        onChange={e =>
                           setPopulated({
                              ...populated,
                              zipcode: e.target.value,
                           })
                        }
                     />
                  </Form.Group>
               </Flex>
            </>
         )}
      </Flex>
   )
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
