import React from 'react'
import { isEmpty } from 'lodash'
import { useToasts } from 'react-toast-notifications'
import { useMutation, useLazyQuery } from '@apollo/react-hooks'

import { useConfig } from '../../lib'
import { useTranslation, useUser } from '../../context'
import { CloseIcon, DeleteIcon, SearchIcon, LocationIcon } from '../../assets/icons'
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

      let confirmationForDelete = confirm("Are you sure you want to delete?");

      if(confirmationForDelete){
         deleteCustomerAddress({
            variables: { id },
         })
      }
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
            <h2 className="hern-account-addresses__header__title">
               {t("Manage Addresses")}
            </h2>
            {user?.platform_customer?.addresses.length > 0 && (
               <Button bg={theme?.accent} className="hern-account-addresses__header__add-addresses-button" onClick={() => toggleTunnel(true)}>
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
                              <div className='hern-account-addresses__address-list-item-header-div1'>
                                 <LocationIcon   />
                                 <h1 className="hern-account-addresses__address-list-item-label">
                                    {address.label ? `${address.label}` : ""}
                                 </h1>
                              </div>
                              <div>
                                 <button
                                    onClick={() => deleteAddress(address.id)}
                                    className="hern-account-addresses__address-list-item__btn--delete"
                                 >
                                    <DeleteIcon
                                       size={16}
                                       className="hern-account-addresses__address-list-item__btn--delete-icon"
                                    />
                                 </button>
                              </div>
                           </header>
                           <div>
                              <span>{address?.line1}</span>,
                              <span>{address?.line2}</span>,
                              <span>{address?.city}</span>,
                              <span>{address?.state}</span>,
                              <span>{address?.country}</span>,
                              <span>{address?.zipcode}</span>
                           </div>
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
                        </li>
                     ))}
                  </ul>
               ) : (
                  <>
                     <div className="hern-account-addresses__no_addresses_img">
                        <svg width="251" height="251" viewBox="0 0 251 251" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path fillRule="evenodd" clipRule="evenodd" d="M159.567 98.616C159.548 97.5321 160.392 96.4968 161.458 96.2927H185.159C186.377 96.2927 187.485 97.3992 187.485 98.616V131.143C187.485 132.36 186.377 133.467 185.159 133.467H161.894C160.675 133.467 159.567 132.36 159.567 131.143V98.616ZM171.2 100.939H164.22V112.556H171.2V100.939ZM182.832 100.939H175.853V112.556H182.832V100.939ZM171.2 117.204H164.22V128.82H171.2V117.204ZM182.832 117.204H175.853V128.82H182.832V117.204Z" fill="#ECECEC"/>
                           <path fillRule="evenodd" clipRule="evenodd" d="M157.171 52.0552C164.711 49.723 172.27 47.3852 179.78 45.1758L179.781 45.1786C182.389 45.1537 182.731 45.4998 183.714 46.4956C183.882 46.6658 184.069 46.8549 184.288 47.0644L235.469 116.768C236.489 118.148 236.65 120.11 235.871 121.638C235.091 123.165 233.406 124.197 231.689 124.175H215.403V144.713L237.959 154.083C239.272 154.681 240.217 155.949 240.541 157.348C240.883 158.238 240.97 159.223 240.727 160.148C240.177 162.244 237.994 163.782 235.831 163.599C228.12 162.71 220.806 162.163 213.815 161.93C159.961 162.863 101.976 187.248 61.2319 205.586C59.5993 206.314 57.5495 205.988 56.2231 204.788L32.9908 183.877C30.6563 181.777 31.4555 177.277 34.3708 176.108C35.0126 175.852 43.8771 171.798 52.7477 167.741C61.6013 163.693 70.461 159.641 71.1572 159.359C81.2151 155.287 93.9444 150.133 106.051 147.547V140.406H106.063V128.82H87.4505C85.6214 128.833 83.8392 127.663 83.128 125.98C82.4168 124.296 82.8202 122.205 84.1049 120.906L146.919 55.8476C147.457 55.2805 148.139 54.8512 148.883 54.613C151.641 53.7656 154.404 52.9108 157.171 52.0552ZM126.998 140.406H126.957V153.502L115.365 148.358V128.82H126.998V140.406ZM206.096 140.406H205.943V144.498C183.364 144.734 157.938 146.874 136.301 154.136V124.173C136.301 121.739 134.085 119.526 131.648 119.526H123.505L168.946 69.5005L206.096 120.98V140.406ZM222.526 114.882L180.143 57.1567L175.344 62.4614L213.148 114.882H222.526Z" fill="#ECECEC"/>
                           <g filter="url(#filter0_f_2325_41)">
                              <path d="M90.9934 179.648C99.808 173.142 102.558 161.865 97.1254 154.504C91.6924 147.142 80.1056 146.445 71.2909 152.951C66.7124 156.329 63.0539 162.626 59.8918 169.13C57.8821 173.263 56.105 177.495 54.6026 181.072C53.7408 183.124 52.9694 184.96 52.2964 186.44C51.923 187.259 52.4967 188.037 53.3899 187.922C55.0033 187.714 56.9878 187.518 59.2048 187.3C63.0647 186.918 67.6296 186.468 72.1693 185.766C79.3164 184.662 86.4146 183.027 90.9934 179.648Z" fill="#404040" fillOpacity="0.2"/>
                           </g>
                           <path d="M179.85 45.1758C169.584 48.1957 159.228 51.4555 148.952 54.613C148.208 54.8512 147.526 55.2805 146.989 55.8476L84.1744 120.906C82.8896 122.205 82.4862 124.296 83.1975 125.98C83.9087 127.663 85.6908 128.833 87.52 128.82H106.132H106.136L115.435 128.82L123.575 119.526L186.523 50.1192C183.181 45.5799 182.905 45.1494 179.851 45.1786L179.85 45.1758Z" fill="#404040" fillOpacity="0.2"/>
                           <path d="M45.1267 124.406C45.4588 124.61 45.7982 124.754 46.1448 124.837C46.4914 124.92 46.8137 124.935 47.1116 124.882C47.4082 124.819 47.6616 124.698 47.8718 124.521C48.0834 124.354 48.2309 124.125 48.3142 123.834C48.4079 123.546 48.4313 123.225 48.3843 122.871C48.3373 122.518 48.2242 122.165 48.0449 121.811C47.8761 121.459 47.6546 121.131 47.3802 120.827C47.1059 120.523 46.8027 120.269 46.4705 120.064C46.1369 119.85 45.7968 119.701 45.4502 119.617C45.1037 119.534 44.7821 119.524 44.4855 119.588C44.1876 119.641 43.9394 119.763 43.7412 119.953C43.5429 120.144 43.3968 120.384 43.303 120.672C43.2198 120.963 43.2016 121.285 43.2486 121.638C43.2957 121.992 43.4036 122.344 43.5723 122.696C43.7516 123.05 43.9717 123.367 44.2327 123.647C44.4951 123.938 44.7931 124.191 45.1267 124.406Z" fill="#404040" fillOpacity="0.6"/>
                           <path d="M43.8406 141.214C44.5218 141.979 45.3771 142.484 46.4063 142.732C47.1415 142.908 47.828 142.948 48.466 142.853C49.3432 142.721 50.096 142.343 50.7243 141.716C51.4649 140.94 52.0136 139.792 52.3704 138.271L51.0156 137.946C50.8684 138.75 50.5725 139.353 50.1276 139.754C49.9098 139.95 49.6585 140.087 49.3739 140.164C49.0984 140.232 48.8031 140.229 48.488 140.153C48.0259 140.042 47.6777 139.87 47.4434 139.638C47.2197 139.408 47.0779 139.068 47.018 138.619C46.961 138.19 46.956 137.847 47.003 137.589L47.8313 126.967L43.184 125.852L42.3984 135.877C42.3386 136.65 42.3501 137.348 42.4327 137.969C42.6079 139.286 43.0772 140.367 43.8406 141.214Z" fill="#404040" fillOpacity="0.6"/>
                           <path fillRule="evenodd" clipRule="evenodd" d="M14.9685 124.766C12.7056 107.761 24.431 97.188 41.1121 101.193C57.7931 105.198 73.1994 122.284 75.4623 139.289C76.6377 148.122 72.7418 157.228 67.9475 165.704C64.9009 171.09 61.4322 176.181 58.4997 180.485C56.8174 182.954 55.3116 185.164 54.1632 187.022C53.5278 188.053 51.7662 187.63 50.8056 186.216C49.0694 183.664 46.8547 180.558 44.3804 177.089C40.0723 171.047 34.9773 163.903 30.251 156.653C22.8107 145.24 16.144 133.599 14.9685 124.766ZM67.4026 137.354C65.744 124.89 54.4328 112.353 42.2066 109.418C29.9803 106.482 21.378 114.239 23.0366 126.703C24.6952 139.166 35.9977 151.702 48.224 154.637C60.4508 157.572 69.0612 149.818 67.4026 137.354Z" fill="#404040" fillOpacity="0.6"/>
                           <defs>
                              <filter id="filter0_f_2325_41" x="36.1807" y="132.493" width="79.7329" height="71.4404" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                 <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                                 <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                                 <feGaussianBlur stdDeviation="8" result="effect1_foregroundBlur_2325_41"/>
                              </filter>
                           </defs>
                        </svg>
                        <h1 className='hern-account-addresses-no-addresses-text'>
                           {t("Oops! You have not saved any  address yet")}
                        </h1>
                        <Button bg={theme?.accent} className="hern-account-addresses-no-addresses-add-addresses-button" onClick={() => toggleTunnel(true)}>
                           {t("Add Address")}
                        </Button>
                     </div>
                  </>
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
            <button  onClick={() => toggleTunnel(false)}>
               <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="4" fill="white"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M9.53553 9.53553C9.87843 9.19264 10.3435 9 10.8284 9C11.3134 9 11.7784 9.19264 12.1213 9.53553L16 13.4142L19.8787 9.53553C20.2216 9.19264 20.6866 9 21.1716 9C21.6565 9 22.1216 9.19264 22.4645 9.53553C22.8074 9.87843 23 10.3435 23 10.8284C23 11.3134 22.8074 11.7784 22.4645 12.1213L18.5858 16L22.4645 19.8787C22.8074 20.2216 23 20.6866 23 21.1716C23 21.6565 22.8074 22.1216 22.4645 22.4645C22.1216 22.8074 21.6565 23 21.1716 23C20.6866 23 20.2216 22.8074 19.8787 22.4645L16 18.5858L12.1213 22.4645C11.7784 22.8074 11.3134 23 10.8284 23C10.3435 23 9.87843 22.8074 9.53553 22.4645C9.19264 22.1216 9 21.6565 9 21.1716C9 20.6866 9.19264 20.2216 9.53553 19.8787L13.4142 16L9.53553 12.1213C9.19264 11.7784 9 11.3134 9 10.8284C9 10.3435 9.19264 9.87843 9.53553 9.53553Z" fill="#404040" fillOpacity="0.8"/>
                  <path d="M10.8284 8.9C10.317 8.9 9.82647 9.10317 9.46482 9.46482C9.10317 9.82647 8.9 10.317 8.9 10.8284C8.9 11.3399 9.10317 11.8304 9.46482 12.192L13.2728 16L9.46482 19.808C9.10317 20.1696 8.9 20.6601 8.9 21.1716C8.9 21.683 9.10317 22.1735 9.46482 22.5352C9.82647 22.8968 10.317 23.1 10.8284 23.1C11.3399 23.1 11.8304 22.8968 12.192 22.5352L16 18.7272L19.808 22.5352C20.1696 22.8968 20.6601 23.1 21.1716 23.1C21.683 23.1 22.1735 22.8968 22.5352 22.5352C22.8968 22.1735 23.1 21.683 23.1 21.1716C23.1 20.6601 22.8968 20.1696 22.5352 19.808L18.7272 16L22.5352 12.192C22.8968 11.8304 23.1 11.3399 23.1 10.8284C23.1 10.317 22.8968 9.82647 22.5352 9.46482C22.1735 9.10317 21.683 8.9 21.1716 8.9C20.6601 8.9 20.1696 9.10317 19.808 9.46482L16 13.2728L12.192 9.46482C11.8304 9.10317 11.3399 8.9 10.8284 8.9Z" stroke="#404040" stroke-opacity="0.8" strokeWidth="0.2"/>
               </svg>
            </button>
         </Tunnel.Header>
         <hr style={{color: "gray", padding: "0", margin: "0", border: "1px solid #E5E5E5"}} />
         <Tunnel.Body>
            <section className="hern-account-addresses__address-search">
               {loaded && !error && (
                  <GooglePlacesAutocomplete
                     onSelect={data => formatAddress(data)} placeholder="Search your Location"
                  />
               )}
               <span className="hern-account-addresses__address-input-search-icon">
                  <SearchIcon />
               </span>
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
