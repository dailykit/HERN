import React, { useState, useEffect } from 'react'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { detectCountry } from '../utils'
import { UserIcon } from '../assets/icons'
import { useUser, CartContext } from '../context'
import { useToasts } from 'react-toast-notifications'

export const UserInfo = props => {
   const { cart, editable = true } = props
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
   const [countryCode, setCountryCode] = useState(null)

   React.useEffect(() => {
      const detectedUserData = async () => {
         const data = await detectCountry()
         setCountryCode(data.countryCode)
      }
      detectedUserData()
   }, [])

   const onBlurData = type => {
      let infoToBeSend
      switch (type) {
         case 'firstName':
            infoToBeSend = {
               customerFirstName: firstName,
            }
            break
         case 'lastName':
            infoToBeSend = {
               customerLastName: lastName,
            }
            break
         case 'phoneNumber':
            infoToBeSend = {
               customerPhone: mobileNumber,
            }
            break
      }
      methods.cart.update({
         variables: {
            id: cart.id,
            _set: {
               customerInfo: {
                  ...cart?.customerInfo,
                  ...infoToBeSend,
               },
            },
         },
      })
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
         </div>
      )
   }
   // if (!isEdit) {
   //    return (
   //       <div className="hern-user-info">
   //          <UserInfoHeader />
   //          <div>
   //             <span className="hern-user-info_name">{firstName} </span>{' '}
   //             <span className="hern-user-info_name">{lastName}</span>
   //          </div>
   //          <div
   //             style={{ display: 'flex', alignItems: 'center' }}
   //             className="hern-user-info__phoneNumber"
   //          >
   //             <PhoneIcon stroke="currentColor" size={14} />
   //             {mobileNumber}
   //          </div>
   //       </div>
   //    )
   // }
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
                  onBlur={() => {
                     if (
                        !(cart?.customerInfo?.customerFirstName == firstName)
                     ) {
                        onBlurData('firstName')
                     }
                  }}
                  disabled={!editable}
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
                  onBlur={() => {
                     if (!(cart?.customerInfo?.customerLastName == lastName)) {
                        onBlurData('lastName')
                     }
                  }}
                  disabled={!editable}
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
                  setMobileNumber(e)
               }}
               onBlur={() => {
                  if (
                     mobileNumber &&
                     isValidPhoneNumber(mobileNumber) &&
                     !(cart?.customerInfo?.customerPhone == mobileNumber)
                  ) {
                     onBlurData('phoneNumber')
                  }
               }}
               defaultCountry={countryCode}
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
   )
}
