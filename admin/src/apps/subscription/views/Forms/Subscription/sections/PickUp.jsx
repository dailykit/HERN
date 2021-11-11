import React from 'react'
import { isEmpty } from 'lodash'
import styled from 'styled-components'
import { useQuery, useMutation } from '@apollo/react-hooks'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import {
   Text,
   Form,
   Flex,
   Tunnel,
   Tunnels,
   Spacer,
   Table,
   TableHead,
   TableBody,
   TableRow,
   TableCell,
   useTunnel,
   TunnelHeader,
} from '@dailykit/ui'

import {
   Banner,
   InlineLoader,
   Tooltip,
} from '../../../../../../shared/components'
import { PICKUP_OPTIONS, INSERT_PICKUP_OPTION } from '../../../../graphql'
import {
   parseAddress,
   logger,
   useScript,
   get_env,
} from '../../../../../../shared/utils'

const PickUpTunnel = ({ tunnel, onSave }) => {
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   return (
      <>
         <Tunnels tunnels={tunnel.list}>
            <Tunnel layer={1} size="sm">
               <TunnelHeader
                  title="Select Pickup Option"
                  close={() => tunnel.close(1)}
                  right={{ action: () => openTunnel(1), title: 'Add Option' }}
               />
               <Banner id="subscription-app-create-subscription-form-select-pickup-tunnel-top" />
               <Flex
                  padding="16px"
                  overflowY="auto"
                  height="calc(100% - 105px)"
               >
                  <PickupOptions onSave={onSave} close={tunnel.close} />
               </Flex>
               <Banner id="subscription-app-create-subscription-form-select-pickup-tunnel-bottom" />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="sm">
               <CreateOption
                  // onSave={onSave}
                  // close={{ parent: tunnel.close, child: closeTunnel }}
                  parent={tunnel.close}
                  child={closeTunnel}
               />
            </Tunnel>
         </Tunnels>
      </>
   )
}

export default PickUpTunnel

const PickupOptions = ({ onSave, close }) => {
   const { loading, data: { pickup_options: options = [] } = {} } =
      useQuery(PICKUP_OPTIONS)

   if (loading) return <InlineLoader />
   return (
      <Table>
         <TableHead>
            <TableRow>
               <TableCell>Time</TableCell>
               <TableCell>Address</TableCell>
            </TableRow>
         </TableHead>
         <TableBody>
            {options.map(option => (
               <TableRow
                  key={option.id}
                  onClick={() => onSave(option) || close(1)}
               >
                  <TableCell>
                     <Styles.Text>
                        {option.time?.from} - {option.time?.to}
                     </Styles.Text>
                  </TableCell>
                  <TableCell>
                     <Styles.Text>{parseAddress(option.address)}</Styles.Text>
                  </TableCell>
               </TableRow>
            ))}
         </TableBody>
      </Table>
   )
}

const CreateOption = ({ parent, child, onSave }) => {
   const [form, setForm] = React.useState({
      from: '',
      to: '',
      address: {},
   })
   const [insert, { loading }] = useMutation(INSERT_PICKUP_OPTION, {
      onCompleted: ({ createPickupOption = {} }) => {
         onSave(createPickupOption)
         parent(1)
         child(1)
      },
      onError: error => logger(error),
   })

   const onChange = (name, value) => {
      setForm(existing => ({ ...existing, [name]: value }))
   }
   console.log("close function check", parent, child)

   return (
      <>
         <TunnelHeader
            title="Add Pickup Option"
            close={() => child(1)}
            right={{
               isLoading: loading,
               disabled: !form.from || !form.to || isEmpty(form.address),
               action: () =>
                  insert({
                     variables: {
                        object: {
                           time: { from: form.from, to: form.to },
                           address: form.address,
                        },
                     },
                  }),
               title: 'Save',
            }}
         />
         <Banner id="subscription-app-create-subscription-form-add-pickup-options-tunnel-top" />

         <Flex padding="16px" overflowY="auto" height="calc(100% - 105px)">
            <Text as="h4">Pick Up Time</Text>
            <Spacer size="14px" />
            <Styles.Row>
               <section>
                  <Form.Group>
                     <Form.Label htmlFor="from" title="from">
                        From*
                     </Form.Label>
                     <Form.Time
                        id="from"
                        name="from"
                        value={form.from}
                        placeholder="Enter the starting time"
                        onChange={e => onChange(e.target.name, e.target.value)}
                     />
                  </Form.Group>
               </section>
               <Spacer size="16px" xAxis />
               <section>
                  <Form.Group>
                     <Form.Label htmlFor="to" title="to">
                        To*
                     </Form.Label>
                     <Form.Time
                        id="to"
                        name="to"
                        value={form.to}
                        placeholder="Enter the ending time"
                        onChange={e => onChange(e.target.name, e.target.value)}
                     />
                  </Form.Group>
               </section>
            </Styles.Row>
            <Spacer size="24px" />
            <Text as="h4">Address</Text>
            <Spacer size="14px" />
            <Address
               address={form.address}
               onSelect={address => onChange('address', address)}
            />
         </Flex>
         <Banner id="subscription-app-create-subscription-form-add-pickup-options-tunnel-bottom" />
      </>
   )
}

const Address = ({ address, onSelect }) => {
   const [loaded, error] = useScript(
      `https://maps.googleapis.com/maps/api/js?key=${get_env(
         'REACT_APP_MAPS_API_KEY'
      )}&libraries=places`
   )

   const formatAddress = async input => {
      const response = await fetch(
         `https://maps.googleapis.com/maps/api/geocode/json?key=${get_env(
            'REACT_APP_MAPS_API_KEY'
         )}&address=${encodeURIComponent(input.description)}`
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
         onSelect(address)
      }
   }
   return (
      <>
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
                                 <Tooltip identifier="address_googleSearch" />
                              </Flex>
                           </Form.Label>
                           <Form.Text id="search" name="search" {...props} />
                        </Form.Group>
                     </Flex>
                  )}
               />
            )}
         </GPlaces>
         {!isEmpty(address) && (
            <>
               <Flex margin="24px 0">
                  <Form.Group>
                     <Form.Label htmlFor="line1" title="line1">
                        <Flex container alignItems="center">
                           Line 1
                           <Tooltip identifier="address_line1" />
                        </Flex>
                     </Form.Label>
                     <Form.Text
                        id="line1"
                        name="line1"
                        value={address.line1}
                        onChange={e =>
                           onSelect({
                              ...address,
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
                           <Tooltip identifier="address_line2" />
                        </Flex>
                     </Form.Label>
                     <Form.Text
                        id="line2"
                        name="line2"
                        value={address.line2}
                        onChange={e =>
                           onSelect({
                              ...address,
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
                           <Tooltip identifier="address_city" />
                        </Flex>
                     </Form.Label>
                     <Form.Text
                        id="city"
                        name="city"
                        value={address.city}
                        onChange={e =>
                           onSelect({
                              ...address,
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
                           <Tooltip identifier="address_state" />
                        </Flex>
                     </Form.Label>
                     <Form.Text
                        id="state"
                        name="state"
                        value={address.state}
                        onChange={e =>
                           onSelect({
                              ...address,
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
                           <Tooltip identifier="address_country" />
                        </Flex>
                     </Form.Label>
                     <Form.Text
                        id="country"
                        name="country"
                        value={address.country}
                        onChange={e =>
                           onSelect({
                              ...address,
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
                           <Tooltip identifier="address_zip" />
                        </Flex>
                     </Form.Label>
                     <Form.Text
                        id="zipcode"
                        name="zipcode"
                        value={address.zipcode}
                        onChange={e =>
                           onSelect({
                              ...address,
                              zipcode: e.target.value,
                           })
                        }
                     />
                  </Form.Group>
               </Flex>
            </>
         )}
      </>
   )
}

const Styles = {
   Row: styled.div`
      display: flex;
      align-items: center;
      > section {
         flex: 1;
      }
   `,
   Text: styled.p`
      font-size: 14px;
      color: #555b6e;
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
