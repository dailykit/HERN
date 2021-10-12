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
import Spacer from '../Spacer'
import { useUser } from '../../Providers'
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
   const { state } = useUser()
   const { user } = state
   const [isValid, setIsValid] = useState(false)
   const [formStatus, setFormStatus] = React.useState('PENDING')
   const [address, setAddress] = useState(null)
   const controlContainerCustomStyle = {
      background: theme.colors.lightBackground.grey,
      height: '48px',
      borderRadius: '8px',
      color: theme.colors.textColor5,
      border: 'none'
   }
   const menuContainerCustomStyle = {
      background: theme.colors.lightBackground.grey,
      margin: '8px 0',
      borderRadius: '4px',
      color: theme.colors.textColor5,
      border: 'none'
   }
   const optionCustomStyle = {
      background: theme.colors.lightBackground.grey,
      fontFamily: 'Proxima Nova',
      fontWeight: 600,
      fontSize: theme.sizes.h8,
      '&:hover': {
         background: theme.colors.lightestGrey,
         color: theme.colors.textColor5,
         marginBottom: '8px'
      }
   }
   const customInputStyle = {
      fontFamily: 'Proxima Nova',
      fontWeight: 600,
      fontSize: theme.sizes.h8,
      color: theme.colors.textColor5
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
                        ...customInputStyle
                     }),
                     singleValue: provided => ({
                        ...provided,
                        ...customInputStyle
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
                  <Spacer xAxis="1rem" />
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
                  <Spacer xAxis="1rem" />
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
                     style={{ height: '6rem' }}
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
