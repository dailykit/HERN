import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'

import { useDelivery } from './state'
import { useUser, CartContext, useTranslation } from '../../context'
import { MUTATIONS } from '../../graphql'
import { CloseIcon } from '../../assets/icons'
import { useScript, isClient, get_env, useOnClickOutside } from '../../utils'
import { Tunnel, Button, Form, Spacer } from '../../components'
import { useConfig } from '../../lib'
import { Modal } from 'antd'
const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const AddressTunnel = props => {
   const {
      outside = false,
      showAddressForm = true,
      onInputFiledSelect,
      onSubmitAddress,
      useLocalAddress = false, // use local address as address
   } = props

   // outside --> use without this component without popup

   const { user } = useUser()
   const { addToast } = useToasts()
   const { t, dynamicTrans } = useTranslation()
   const { methods } = React.useContext(CartContext)
   const { state, dispatch } = outside
      ? { state: {}, dispatch: {} }
      : useDelivery()
   const { selectedOrderTab } = useConfig()
   const userAddressFormRef = React.useRef()
   useOnClickOutside(userAddressFormRef, () => {
      if (!address) {
         return
      }
      if (!address.line1) {
         setAddressWarnings(prev => ({
            ...prev,
            line1: true,
         }))
         return
      }
      console.log('this is valid location')
      if (useLocalAddress) {
         handleSubmitLocal()
      } else {
         handleSubmit()
      }
   })

   const [formStatus, setFormStatus] = React.useState('PENDING')
   const [address, setAddress] = React.useState(null)
   const [createAddress] = useMutation(MUTATIONS.CUSTOMER.ADDRESS.CREATE, {
      onCompleted: () => {
         setFormStatus('SAVED')
         addToast(t('Address has been saved.'), {
            appearance: 'success',
         })
         if (!outside) {
            toggleTunnel(false)
            dispatch({ type: 'SET_ADDRESS', payload: address })
         }
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
   const [addressWarnings, setAddressWarnings] = React.useState({
      line1: false,
   }) // to show warning for required field

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
         // console.log('resultAddress', result.address_components)
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
         if (!address.zipcode) {
            showWarningPopup()
         }
         onInputFiledSelect && onInputFiledSelect(address)
         setFormStatus('IN_PROGRESS')
      }
   }

   const showWarningPopup = () => {
      Modal.warning({
         title: `Please select precise zipcode location`,
         maskClosable: true,
         centered: true,
      })
   }

   const handleSubmitLocal = () => {
      setFormStatus('SAVING')
      const userLocationInLocal = JSON.parse(
         localStorage.getItem('userLocation')
      )
      const addressFromLocal = {
         ...address,
         city: userLocationInLocal.address.city,
         country: userLocationInLocal.address.country,
         state: userLocationInLocal.address.state,
         zipcode: userLocationInLocal.address.zipcode.toString(),
         lat: userLocationInLocal.latitude.toString(),
         lng: userLocationInLocal.longitude.toString(),
         line2: userLocationInLocal.address.mainText,
         searched: userLocationInLocal.searched || '',
      }
      if (user?.keycloakId) {
         if (outside) {
            onSubmitAddress(addressFromLocal)
         }
         createAddress({
            variables: {
               object: { ...addressFromLocal, keycloakId: user?.keycloakId },
            },
         })
      } else {
         if (outside) {
            onSubmitAddress(addressFromLocal)
         }
      }
      setAddress(null)
   }

   const handleSubmit = () => {
      setFormStatus('SAVING')
      // if user authenticate than add address to users details
      if (user?.keycloakId) {
         if (outside) {
            onSubmitAddress(address)
         }
         createAddress({
            variables: {
               object: { ...address, keycloakId: user?.keycloakId },
            },
         })
      } else {
         if (outside) {
            onSubmitAddress(address)
         }
      }
      setAddress(null)
   }

   const toggleTunnel = (value = false) => {
      dispatch({ type: 'TOGGLE_TUNNEL', payload: value })
   }

   // outside --> use without tunnel
   // useLocalAddress --> use localStorage address (getting from location selector) for address
   if (outside && useLocalAddress) {
      return (
         <div className="hern-address__address-form" ref={userAddressFormRef}>
            <Form.Field>
               <Form.Label>
                  {t('Apartment/Building Info/Street info*')}
                  <span className="hern-address-warning">
                     {addressWarnings?.line1 ? t('fill this field') : null}
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
            <Form.Field>
               <Form.Label>{t('Landmark')}</Form.Label>
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

            <Form.Field>
               <Form.Label>{t('Label')}</Form.Label>
               <Form.Text
                  type="text"
                  value={address?.label || ''}
                  placeholder="Enter label for this address"
                  onChange={e =>
                     setAddress({ ...address, label: e.target.value })
                  }
               />
            </Form.Field>
            <Form.Field>
               <Form.Label>{t('Dropoff Instructions')}</Form.Label>
               <Form.TextArea
                  type="text"
                  value={address?.notes || ''}
                  placeholder="Enter dropoff instructions"
                  onChange={e =>
                     setAddress({ ...address, notes: e.target.value })
                  }
               />
            </Form.Field>
            <Spacer />
         </div>
      )
   }
   if (outside) {
      return (
         <>
            <section className="hern-delivery__address-tunnel__address-search">
               <Form.Label>
                  <span>{t('Search')}</span>
                  {selectedOrderTab ? ' ' + selectedOrderTab.label : ''}
                  <span>{t('Address')}</span>
               </Form.Label>
               {loaded && !error && (
                  <GooglePlacesAutocomplete
                     inputClassName="hern-store-location-selector-main__location-input"
                     onSelect={data => formatAddress(data)}
                     apiKey={get_env('GOOGLE_API_KEY')}
                  />
               )}
            </section>
            {address &&
               (address.zipcode ? (
                  <div
                     className="hern-address__address-form"
                     ref={userAddressFormRef}
                  >
                     <Form.Field>
                        <Form.Label>
                           {t('Apartment/Building Info/Street info*')}
                           <span className="hern-address-warning">
                              {addressWarnings.line1
                                 ? t('fill this field')
                                 : null}
                           </span>
                        </Form.Label>
                        <Form.Text
                           type="text"
                           placeholder="Enter apartment/building info/street info"
                           value={address.line1 || ''}
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
                     <Form.Field>
                        <Form.Label>{t('Landmark')}</Form.Label>
                        <Form.Text
                           type="text"
                           value={address.landmark || ''}
                           placeholder="Enter landmark"
                           onChange={e =>
                              setAddress({
                                 ...address,
                                 landmark: e.target.value,
                              })
                           }
                        />
                     </Form.Field>

                     <Form.Field>
                        <Form.Label>{t('Label')}</Form.Label>
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
                        <Form.Label>{t('Dropoff Instructions')}</Form.Label>
                        <Form.TextArea
                           type="text"
                           value={address.notes || ''}
                           placeholder="Enter dropoff instructions"
                           onChange={e =>
                              setAddress({ ...address, notes: e.target.value })
                           }
                        />
                     </Form.Field>
                     <Spacer />
                  </div>
               ) : (
                  <>{showWarningPopup}</>
               ))}
         </>
      )
   }
   return (
      <Tunnel.Wrapper
         isOpen={state.address.tunnel}
         toggleTunnel={() => toggleTunnel(false)}
         size="sm"
      >
         <Tunnel.Header title={t('Add Address')}>
            <Button size="sm" onClick={() => toggleTunnel(false)}>
               <CloseIcon
                  size={20}
                  className="hern-delivery__address-tunnel__close-icon"
               />
            </Button>
         </Tunnel.Header>
         <Tunnel.Body>
            <section className="hern-delivery__address-tunnel__address-search">
               <Form.Label>{t('Search Address')}</Form.Label>
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
                        {t('Apartment/Building Info/Street info*')}
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
                     <Form.Label>{t('Line 2')}</Form.Label>
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
                     <Form.Label>{t('Landmark')}</Form.Label>
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
                     <Form.Label>{t('City*')}</Form.Label>
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
                     <Form.Label>{t('State')}</Form.Label>
                     <Form.Text readOnly value={address.state} />
                  </Form.Field>

                  <div className="hern-delivery__address-tunnel__country-zip-code">
                     <Form.Field>
                        <Form.Label>{t('Country')}</Form.Label>
                        <Form.Text readOnly value={address.country} />
                     </Form.Field>
                     <Form.Field>
                        <Form.Label>{t('Zipcode')}</Form.Label>
                        <Form.Text readOnly value={address.zipcode} />
                     </Form.Field>
                  </div>
                  <Form.Field>
                     <Form.Label>{t('Label')}</Form.Label>
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
                     <Form.Label>{t('Dropoff Instructions')}</Form.Label>
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
                     {formStatus === 'SAVING' ? (
                        <span>{t('Saving...')}</span>
                     ) : (
                        <span>{t('Save Address')}</span>
                     )}
                  </Button>
                  <Spacer />
               </>
            )}
         </Tunnel.Body>
      </Tunnel.Wrapper>
   )
}
