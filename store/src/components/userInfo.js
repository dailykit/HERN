import React, { useState } from 'react'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { get_env } from '../utils'
import { UserIcon } from '../assets/icons'
import { Button } from './button'
import { useUser, CartContext } from '../context'
import { useToasts } from 'react-toast-notifications'
import { UPDATE_PLATFORM_CUSTOMER } from '../graphql'
import { useMutation } from '@apollo/react-hooks'

export const UserInfo = props => {
   const { cart, editable = true } = props
   const { methods } = React.useContext(CartContext)
   const { user } = useUser()
   const { addToast } = useToasts()

   const [firstName, setFirstName] = useState(
      cart?.customerInfo?.customerFirstName ||
         user.platform_customer?.firstName ||
         ''
   )
   const [lastName, setLastName] = useState(
      cart?.customerInfo?.customerLastName ||
         user.platform_customer?.lastName ||
         ''
   )
   const [mobileNumber, setMobileNumber] = useState(
      cart?.customerInfo?.customerPhone ||
         user.platform_customer?.phoneNumber ||
         ''
   )
   const [updateCustomer] = useMutation(UPDATE_PLATFORM_CUSTOMER, {
      onCompleted: () => {
         console.log('updated')
      },
      onError: error => {
         console.error(error)
         addToast('Failed to save!', {
            appearance: 'error',
         })
      },
   })
   const [isOpen, setIsOpen] = useState(false)

   const handleSave = () => {
      methods.cart.update({
         variables: {
            id: cart.id,
            _set: {
               customerInfo: {
                  customerFirstName: firstName,
                  customerLastName: lastName,
                  customerPhone: mobileNumber,
               },
            },
         },
      })
      if (user?.keycloakId) {
         updateCustomer({
            variables: {
               keycloakId: user.keycloakId,
               _set: { firstName: firstName, lastName: lastName },
            },
         })
      }

      setIsOpen(false)
   }
   React.useEffect(() => {
      if (!firstName.length || !lastName.length || !mobileNumber.length) {
         setIsOpen(true)
      }
   }, [])
   return (
      <>
         {!isOpen ? (
            <div className="hern-user-info--closed">
               <div>
                  <span>
                     <UserIcon size={16} />
                  </span>
                  <div>
                     <span>{firstName + ' ' + lastName}</span>
                     <span className="hern-user-info--closed__phone-no">
                        {mobileNumber}
                     </span>
                  </div>
               </div>
               <button onClick={() => setIsOpen(true)}>Edit</button>
            </div>
         ) : (
            <div className="hern-user-info__wrapper">
               <div className="hern-user-info">
                  <div className="hern-user-info__header">
                     <div>
                        <UserIcon size={16} />
                        <h2 className="hern-user-info__heading">
                           User Details
                        </h2>
                     </div>
                     <Button
                        disabled={
                           !firstName.length ||
                           !lastName.length ||
                           !mobileNumber.length
                        }
                        onClick={handleSave}
                     >
                        save
                     </Button>
                  </div>
                  <div className="hern-user-info__name-field">
                     <fieldset className="hern-user-info__fieldset hern-user-info__fieldset-first-name">
                        <label className="hern-user-info__label">
                           First Name
                        </label>
                        <input
                           name="user-first-name"
                           type="text"
                           className="hern-user-info__input-field"
                           onChange={e => {
                              setFirstName(e.target.value)
                           }}
                           value={firstName}
                           placeholder="Enter your first name"
                           disabled={!editable}
                        />
                     </fieldset>
                     <fieldset className="hern-user-info__fieldset hern-user-info__fieldset-last-name">
                        <label className="hern-user-info__label">
                           Last Name
                        </label>
                        <input
                           name="user-last-name"
                           type="text"
                           className="hern-user-info__input-field"
                           onChange={e => {
                              setLastName(e.target.value)
                           }}
                           value={lastName}
                           placeholder="Enter your last name"
                           disabled={!editable}
                        />
                     </fieldset>
                  </div>
                  <fieldset className="hern-user-info__fieldset hern-user-info__fieldset-phone-number">
                     <label className="hern-user-info__label">
                        Phone Number
                     </label>
                     <PhoneInput
                        className={`hern-user-info__phone__input hern-user-info__phone__input${
                           !(mobileNumber && isValidPhoneNumber(mobileNumber))
                              ? '-invalid'
                              : '-valid'
                        }`}
                        initialValueFormat="national"
                        value={mobileNumber}
                        onChange={e => {
                           setMobileNumber(e)
                        }}
                        defaultCountry={get_env('COUNTRY_CODE')}
                        placeholder="Enter your phone number"
                        disabled={!editable}
                     />
                     <span className="hern-user-info__phone-number-warning">
                        {mobileNumber &&
                           !isValidPhoneNumber(mobileNumber) &&
                           'Invalid phone number'}
                     </span>
                  </fieldset>
               </div>
            </div>
         )}
      </>
   )
}
