import React, { useState, useEffect } from 'react'
import PhoneInput, {
   formatPhoneNumber,
   formatPhoneNumberIntl,
   isValidPhoneNumber,
} from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { detectCountry } from '../utils'
import { UPDATE_PLATFORM_CUSTOMER } from '../graphql'
import { UserIcon, CloseIcon, PhoneIcon } from '../assets/icons'
import { Button } from '.'
import { useUser, CartContext } from '../context'
import { useMutation } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

export const UserInfo = props => {
   const { cart } = props
   const { methods } = React.useContext(CartContext)
   const { user } = useUser()
   const { addToast } = useToasts()

   const [firstName, setFirstName] = useState(
      cart?.customerInfo?.customerFirstName ||
         user.platform_customer?.firstName ||
         'N/A'
   )
   const [lastName, setLastName] = useState(
      cart?.customerInfo?.customerLastName ||
         user.platform_customer?.lastName ||
         ''
   )
   const [mobileNumber, setMobileNumber] = useState(
      cart?.customerInfo?.customerPhone ||
         user.platform_customer?.phoneNumber ||
         'N/A'
   )
   const [isEdit, setIsEdit] = useState(false)
   const [countryCode, setCountryCode] = useState(null)

   const [updateCustomer] = useMutation(UPDATE_PLATFORM_CUSTOMER, {
      onCompleted: () => {
         console.log('updated')
      },
      onError: error => {
         addToast('Failed to save!', {
            appearance: 'error',
         })
      },
   })

   React.useEffect(() => {
      const detectedUserData = async () => {
         const data = await detectCountry()
         setCountryCode(data.countryCode)
      }
      detectedUserData()
   }, [])

   const onSaveData = () => {
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
      if (
         user?.keycloakId &&
         (!user?.platform_customer?.firstName ||
            !user?.platform_customer?.lastName)
      ) {
         updateCustomer({
            variables: {
               keycloakId: user.keycloakId,
               _set: {
                  firstName,
                  lastName,
               },
            },
         })
      }
      setIsEdit(false)
   }
   const UserInfoHeader = () => {
      return (
         <div
            style={{
               display: 'flex',
               alignItems: 'center',
               marginBottom: '10px',
               justifyContent: 'space-between',
            }}
         >
            <div style={{ display: 'flex', alignItems: 'center' }}>
               <UserIcon />
               <span className="hern-user-info__heading">User Details</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
               {!isEdit ? (
                  <Button onClick={() => setIsEdit(true)}>Edit</Button>
               ) : (
                  <>
                     <Button
                        className="hern-user-info__save-button"
                        disabled={!isValidPhoneNumber(mobileNumber)}
                        onClick={onSaveData}
                     >
                        Save
                     </Button>
                     <CloseIcon
                        stroke="currentColor"
                        style={{
                           color: '#404040',
                           cursor: 'pointer',
                        }}
                        onClick={() => {
                           setIsEdit(false)
                        }}
                     />
                  </>
               )}
            </div>
         </div>
      )
   }
   if (!isEdit) {
      return (
         <div className="hern-user-info">
            <UserInfoHeader />
            <div>
               <span className="hern-user-info_name">{firstName} </span>{' '}
               <span className="hern-user-info_name">{lastName}</span>
            </div>
            <div
               style={{ display: 'flex', alignItems: 'center' }}
               className="hern-user-info__phoneNumber"
            >
               <PhoneIcon stroke="currentColor" size={14} />
               {mobileNumber}
            </div>
         </div>
      )
   }
   return (
      <div className="hern-user-info">
         <UserInfoHeader />
         <div className="hern-user-info__name-field">
            <fieldset className="hern-user-info__fieldset hern-user-info__fieldset-first-name">
               <label className="hern-user-info__label">First Name</label>
               <input
                  name="user-first-name"
                  type="text"
                  className="hern-user-info__input-field"
                  onChange={e => {
                     setFirstName(e.target.value)
                  }}
                  value={firstName}
                  placeholder="Enter your first name"
               />
            </fieldset>
            <fieldset className="hern-user-info__fieldset hern-user-info__fieldset-last-name">
               <label className="hern-user-info__label">Last Name</label>
               <input
                  name="user-last-name"
                  type="text"
                  className="hern-user-info__input-field"
                  onChange={e => {
                     setLastName(e.target.value)
                  }}
                  value={lastName}
                  placeholder="Enter your last name"
               />
            </fieldset>
         </div>
         <fieldset className="hern-user-info__fieldset hern-user-info__fieldset-phone-number">
            <label className="hern-user-info__label">Phone Number</label>
            <PhoneInput
               className={`hern-user-info__phone__input hern-user-info__phone__input${
                  !(mobileNumber && isValidPhoneNumber(mobileNumber))
                     ? '-invalid'
                     : '-valid'
               }`}
               initialValueFormat="national"
               value={mobileNumber}
               onChange={e => {
                  setMobileNumber(e.target.value)
               }}
               defaultCountry={countryCode}
               placeholder="Enter your phone number"
            />
         </fieldset>
      </div>
   )
}
