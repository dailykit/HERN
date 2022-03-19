import React from 'react'
import { isEmpty } from 'lodash'
import { useToasts } from 'react-toast-notifications'
import { useMutation, useLazyQuery } from '@apollo/react-hooks'

import { useConfig } from '../../lib'
import { useTranslation, useUser } from '../../context'
import { CloseIcon, DeleteIcon } from '../../assets/icons'
import { useScript, isClient, get_env } from '../../utils'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import {
   BRAND,
   DELETE_CUSTOMER_ADDRESS,
   MUTATIONS,
   ZIPCODE_AVAILABILITY,
} from '../../graphql'
import {
   Form,
   Button,
   Spacer,
   Tunnel,
   HelperBar,
   ProfileSidebar,
   Loader,
} from '../../components'

export const Addresses = () => {
   return (
      <main className="hern-account-addresses__main">
         <ProfileSidebar />
         <Content />
      </main>
   )
}

const Content = () => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const { t } = useTranslation()
   const { brand, configOf } = useConfig()
   const [selected, setSelected] = React.useState(null)
   const [tunnel, toggleTunnel] = React.useState(false)
   const [deleteCustomerAddress] = useMutation(DELETE_CUSTOMER_ADDRESS, {
      onCompleted: () => {
         addToast(t('Successfully deleted the address.'), {
            appearance: 'success',
         })
      },
      onError: () => {
         addToast(t('Failed to delete the address'), { appearance: 'error' })
      },
   })
   const [updateBrandCustomer] = useMutation(BRAND.CUSTOMER.UPDATE, {
      onCompleted: () => {
         setSelected(null)
         addToast(t('Successfully changed default address.'), {
            appearance: 'success',
         })
      },
      onError: () => {
         addToast(t('Failed to change the default address'), {
            appearance: 'error',
         })
      },
   })

   const [checkZipcodeValidity] = useLazyQuery(ZIPCODE_AVAILABILITY, {
      fetchPolicy: 'network-only',
      onCompleted: ({ subscription_zipcode = [] }) => {
         if (isEmpty(subscription_zipcode)) {
            addToast(t('Sorry, this address is not deliverable on your plan.'), {
               appearance: 'warning',
            })
         } else {
            updateBrandCustomer({
               variables: {
                  where: {
                     keycloakId: {
                        _eq: user?.keycloakId,
                     },
                     brandId: {
                        _eq: brand.id,
                     },
                  },
                  _set: {
                     subscriptionAddressId: selected,
                  },
               },
            })
         }
      },
      onError: error => {
         addToast(t('Something went wrong'), { appearance: 'error' })
         console.log('checkZipcodeValidity -> zipcode -> error', error)
      },
   })

   const deleteAddress = id => {
      if (user?.subscriptionAddressId === id) {
         addToast(t('Can not delete a default address!'), { appearance: 'error' })
         return
      }
      deleteCustomerAddress({
         variables: { id },
      })
   }

   const makeDefault = async address => {
      setSelected(address.id)
      checkZipcodeValidity({
         variables: {
            subscriptionId: {
               _eq: user?.subscriptionId,
            },
            zipcode: {
               _eq: address.zipcode,
            },
         },
      })
   }
   const theme = configOf('theme-color', 'Visual')

   return (
      <div className="hern-account-addresses__content">
         <header className="hern-account-addresses__header">
            <h2
               className="hern-account-addresses__header__title"
               style={{
                  color: `${theme.accent ? theme.accent : 'rgba(5,150,105,1)'}`,
               }}
            >
               {t("Addresses")}
            </h2>
            {user?.platform_customer?.addresses.length > 0 && (
               <Button bg={theme?.accent} onClick={() => toggleTunnel(true)}>
                  {t("Add Address")}
               </Button>
            )}
         </header>
         {isEmpty(user?.platform_customer) ? (
            <Loader inline />
         ) : (
            <>
               {user?.platform_customer?.addresses.length > 0 ? (
                  <ul className="hern-account-addresses__address-list">
                     {user?.platform_customer?.addresses.map(address => (
                        <li
                           key={address.id}
                           className="hern-account-addresses__address-list-item"
                        >
                           <header className="hern-account-addresses__address-list-item__header">
                              {address.id === user?.subscriptionAddressId ? (
                                 <span className="hern-account-addresses__address-list-item__btn--default">
                                    {t("Default")}
                                 </span>
                              ) : (
                                 <button
                                    className="hern-account-addresses__address-list-item__btn--make-default"
                                    onClick={() => makeDefault(address)}
                                 >
                                    {t("Make Default")}
                                 </button>
                              )}
                              <button
                                 onClick={() => deleteAddress(address.id)}
                                 className="hern-account-addresses__address-list-item__btn--delete"
                              >
                                 <DeleteIcon
                                    size={16}
                                    className="hern-account-addresses__address-list-item__btn--delete-icon"
                                 />
                              </button>
                           </header>
                           <span>{address?.line1}</span>
                           <span>{address?.line2}</span>
                           <span>{address?.city}</span>
                           <span>{address?.state}</span>
                           <span>{address?.country}</span>
                           <span>{address?.zipcode}</span>
                        </li>
                     ))}
                  </ul>
               ) : (
                  <HelperBar type="info">
                     <HelperBar.SubTitle>
                        {t("Let's start with adding an address")}
                     </HelperBar.SubTitle>
                     <HelperBar.Button onClick={() => toggleTunnel(true)}>
                        {t('Add Address')}
                     </HelperBar.Button>
                  </HelperBar>
               )}
            </>
         )}
         {tunnel && (
            <AddressTunnel
               theme={theme}
               tunnel={tunnel}
               toggleTunnel={toggleTunnel}
            />
         )}
      </div>
   )
}

export const AddressTunnel = ({ theme, tunnel, toggleTunnel }) => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const { t } = useTranslation()
   const [formStatus, setFormStatus] = React.useState('PENDING')
   const [address, setAddress] = React.useState(null)
   const [createAddress] = useMutation(MUTATIONS.CUSTOMER.ADDRESS.CREATE, {
      onCompleted: () => {
         toggleTunnel(false)
         setFormStatus('SAVED')
         addToast(t('Address has been saved.'), {
            appearance: 'success',
         })
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
         `https://maps.googleapis.com/maps/api/geocode/json?key=${isClient ? get_env('GOOGLE_API_KEY') : ''
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

   return (
      <Tunnel.Wrapper
         size="sm"
         isOpen={tunnel}
         toggleTunnel={() => toggleTunnel(false)}
      >
         <Tunnel.Header title={t('Add Address')}>
            <Button size="sm" onClick={() => toggleTunnel(false)}>
               <CloseIcon size={20} stroke="currentColor" />
            </Button>
         </Tunnel.Header>
         <Tunnel.Body>
            <section className="hern-account-addresses__address-search">
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

                  <div className="hern-account-addresses__address-tunnel__country-zip-code">
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
                     bg={theme?.accent}
                     onClick={() => handleSubmit()}
                     disabled={
                        !address?.line1 ||
                        !address?.city ||
                        formStatus === 'SAVING'
                     }
                  >
                     {formStatus === 'SAVING' ? <span>{t('Saving...')}</span> : <span>{t('Save Address')}</span>}
                  </Button>
                  <Spacer />
               </>
            )}
         </Tunnel.Body>
      </Tunnel.Wrapper>
   )
}
