import React, { useState, useEffect } from 'react'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { detectCountry, get_env } from '../utils'
import { UserIcon } from '../assets/icons'
import { useUser, CartContext } from '../context'
import { useToasts } from 'react-toast-notifications'
import { Tunnel } from './tunnel'
import classNames from 'classnames'
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
   const [openTunnel, setOpenTunnel] = useState(false)
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
      if (user?.keycloakId && type !== 'phoneNumber') {
         const nameData = type === 'firstName' ? { firstName } : { lastName }
         updateCustomer({
            variables: {
               keycloakId: user.keycloakId,
               _set: { ...nameData },
            },
         })
      }
   }
   const UserInfoHeader = ({ insideTunnel = false }) => {
      return (
         <div
            className={classNames('hern-user-info__header', {
               'hern-user-info__header--title': insideTunnel,
            })}
         >
            <UserIcon size={16} />
            <h2 className="hern-user-info__heading">User Details </h2>
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
   const UserInfoContent = ({ insideTunnel = false }) => {
      return (
         <div
            className={classNames('hern-user-info', {
               'hern-user-info__inside-tunnel': insideTunnel,
            })}
         >
            {!insideTunnel && <UserInfoHeader />}
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
                        if (
                           !(cart?.customerInfo?.customerLastName == lastName)
                        ) {
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
      )
   }
   return (
      <>
         <div className="hern-user-info--sm">
            <div>
               <span>
                  <UserIcon size={16} />
               </span>
               <div>
                  <span>{firstName + ' ' + lastName}</span>
                  <span className="hern-user-info--sm__phone-no">
                     {mobileNumber}
                  </span>
               </div>
            </div>
            <button onClick={() => setOpenTunnel(true)}>Edit</button>
         </div>
         <div className="hern-user-info__wrapper">
            <UserInfoContent />
         </div>

         <Tunnel.Bottom
            title={<UserInfoHeader insideTunnel={true} />}
            visible={openTunnel}
            className="hern-user-info__tunnel"
            onClose={() => setOpenTunnel(false)}
         >
            <UserInfoContent insideTunnel={true} />
         </Tunnel.Bottom>
      </>
   )
}
