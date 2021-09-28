import React, { useState, useEffect } from 'react'
import { Flex } from '@dailykit/ui'
import { useMutation } from '@apollo/client'
import GooglePlacesAutocomplete, {
   geocodeByPlaceId,
   getLatLng
} from 'react-google-places-autocomplete'
import { Wrapper, AddressSearch } from './styles'
import Input from '../Input'
import Button from '../Button'
import { useAuth } from '../../Providers'
import { CREATE_ADDRESS } from '../../graphql'
import { theme } from '../../theme'
import { isClient, get_env } from '../../utils'

export default function AddressForm({
   defaultMutation = true,
   defaultActionButton = true,
   defaultAddress = null,
   isValidFunc = null,
   onSubmit,
   onChange = null
}) {
   const { state } = useAuth()
   const { user } = state
   const [isValid, setIsValid] = useState(false)
   const [formStatus, setFormStatus] = React.useState('PENDING')
   const [address, setAddress] = useState(null)
   const controlContainerCustomStyle = {
      background: theme.colors.mainBackground,
      marginTop: '8px',
      borderRadius: '4px',
      color: theme.colors.textColor4,
      border: 'none',
      boxShadow:
         '1px 1px 2px rgba(50, 56, 72, 0.3),-1px -1px 2px rgba(17, 19, 24, 0.5),inset -5px 5px 10px rgba(17, 19, 24, 0.2),inset 5px -5px 10px rgba(17, 19, 24, 0.2),inset -5px -5px 10px rgba(50, 56, 72, 0.9),inset 5px 5px 13px rgba(17, 19, 24, 0.9)'
   }
   const menuContainerCustomStyle = {
      background: theme.colors.mainBackground,
      margin: '8px 0',
      borderRadius: '4px',
      color: theme.colors.textColor4,
      border: 'none'
   }
   const optionCustomStyle = {
      background: theme.colors.mainBackground,
      '&:hover': {
         background: theme.colors.secondaryColor,
         color: theme.colors.textColor4,
         marginBottom: '8px'
      }
   }

   const [createAddress] = useMutation(CREATE_ADDRESS, {
      refetchQueries: ['CUSTOMER_DETAILS'],
      onCompleted: ({ platform_createCustomerAddress }) => {
         setFormStatus('SAVED')
         onSubmit(platform_createCustomerAddress)
      },
      onError: error => {
         console.log(error)
      }
   })

   const formatAddress = async address => {
      if (!isClient) return 'Runs only on client side.'
      const results = await geocodeByPlaceId(address?.value?.place_id)
      if (results.length > 0) {
         const [result] = results
         const { lat, lng } = await getLatLng(result)
         const address = {
            line2: '',
            lat: lat.toString(),
            lng: lng.toString()
         }

         console.log(result)

         result.address_components.forEach(node => {
            console.log(node.types.includes('street_number'))
            if (node.types.includes('street_number')) {
               address.line1 = `${node?.long_name || ''} `
            }
            if (node.types.includes('route')) {
               if (address.line1) {
                  address.line1 += node?.long_name || ''
               } else {
                  address.line1 = node?.long_name || ''
               }
            }
            if (node.types.includes('locality')) {
               address.city = node?.long_name || ''
            }
            if (node.types.includes('administrative_area_level_1')) {
               address.state = node?.long_name || ''
            }
            if (node.types.includes('country')) {
               address.country = node?.long_name || ''
            }
            if (node.types.includes('postal_code')) {
               address.zipcode = node?.long_name || ''
            }
         })
         setAddress(address)
         setFormStatus('IN_PROGRESS')
      }
   }

   const addressHandler = e => {
      const { value, name } = e.target
      const updatedAddressDetails = {
         ...address,
         [name]: value
      }
      setAddress(updatedAddressDetails)
   }

   const handleSubmit = async e => {
      e.preventDefault()
      setFormStatus('SAVING')
      if (defaultMutation) {
         createAddress({
            variables: {
               object: {
                  ...address,
                  keycloakId: user?.keycloakId
               }
            }
         })
      } else {
         onSubmit(address)
         setFormStatus('SAVED')
      }
   }

   useEffect(() => {
      if (
         !address?.line1 ||
         !address?.city ||
         !address?.state ||
         !address?.country ||
         !address?.zipcode ||
         formStatus === 'SAVING'
      ) {
         setIsValid(false)
      } else {
         setIsValid(true)
      }
   }, [address, formStatus])

   useEffect(() => {
      if (defaultAddress) {
         setAddress(defaultAddress)
      }
   }, [defaultAddress])

   useEffect(() => {
      if (onChange !== null) {
         onChange(address)
      }
   }, [address])

   useEffect(() => {
      if (isValidFunc !== null) {
         isValidFunc(isValid)
      }
   }, [isValid])

   return (
      <Wrapper defaultActionButton={defaultActionButton}>
         <AddressSearch>
            <label>Search Address</label>

            <GooglePlacesAutocomplete
               apiKey={get_env('MAPS_API_KEY')}
               selectProps={{
                  address,
                  onChange: data => formatAddress(data),
                  styles: {
                     control: provided => ({
                        ...provided,
                        ...controlContainerCustomStyle
                     }),
                     input: provided => ({
                        ...provided,
                        color: theme.colors.textColor4
                     }),
                     singleValue: provided => ({
                        ...provided,
                        color: theme.colors.textColor4
                     }),
                     menu: provided => ({
                        ...provided,
                        ...menuContainerCustomStyle
                     }),

                     option: provided => ({
                        ...provided,
                        ...optionCustomStyle
                     })
                  }
               }}
            />
         </AddressSearch>
         {address && (
            <form className="address_form_div" onSubmit={handleSubmit}>
               <Flex container flexDirection="column">
                  <label>Line 1*</label>
                  <Input
                     name="line1"
                     className="customAddressInput"
                     type="text"
                     placeholder="Enter line 1"
                     value={address?.line1 || ''}
                     onChange={addressHandler}
                     required
                  />
               </Flex>
               <Flex container flexDirection="column">
                  <label>Line 2</label>
                  <Input
                     name="line2"
                     className="customAddressInput"
                     type="text"
                     placeholder="Enter line 2"
                     value={address?.line2 || ''}
                     onChange={addressHandler}
                  />
               </Flex>
               <Flex container flexDirection="column">
                  <label>Landmark </label>
                  <Input
                     name="landmark"
                     className="customAddressInput"
                     type="text"
                     placeholder="Enter landmark"
                     value={address?.landmark || ''}
                     onChange={addressHandler}
                  />
               </Flex>
               <Flex container>
                  <Flex container flexDirection="column">
                     <label>City* </label>
                     <Input
                        name="city"
                        className="customAddressInput"
                        type="text"
                        placeholder="Enter city"
                        value={address?.city || ''}
                        onChange={addressHandler}
                        required
                     />
                  </Flex>
                  <Flex container flexDirection="column">
                     <label>State* </label>
                     <Input
                        name="state"
                        className="customAddressInput"
                        type="text"
                        placeholder="Enter state"
                        value={address?.state || ''}
                        onChange={addressHandler}
                        required
                     />
                  </Flex>
               </Flex>
               <Flex container>
                  <Flex container flexDirection="column">
                     <label>Country*</label>
                     <Input
                        name="country"
                        className="customAddressInput"
                        type="text"
                        placeholder="Enter country"
                        value={address?.country || ''}
                        onChange={addressHandler}
                        required
                     />
                  </Flex>
                  <Flex container flexDirection="column">
                     <label>Zipcode*</label>
                     <Input
                        name="zipcode"
                        className="customAddressInput"
                        type="text"
                        placeholder="Enter zipcode"
                        value={address?.zipcode || ''}
                        onChange={addressHandler}
                        required
                     />
                  </Flex>
               </Flex>
               <Flex container flexDirection="column">
                  <label>Label</label>
                  <Input
                     name="label"
                     className="customAddressInput"
                     type="text"
                     placeholder="Enter label for this address"
                     value={address?.label || ''}
                     onChange={addressHandler}
                  />
               </Flex>
               <Flex container flexDirection="column">
                  <label>Dropoff Instructions</label>
                  <Input
                     name="notes"
                     className="customAddressInput"
                     type="textarea"
                     placeholder="Enter dropoff instructions"
                     value={address?.notes || ''}
                     onChange={addressHandler}
                  />
               </Flex>

               {/* footer submit button  */}
               {defaultActionButton && (
                  <div className="footer-submit-btn-div">
                     <Button
                        disabled={!isValid}
                        type="submit"
                        className="custom-submit-button"
                     >
                        {formStatus === 'SAVING' ? 'Saving...' : 'Save Address'}
                     </Button>
                  </div>
               )}
            </form>
         )}
      </Wrapper>
   )
}
