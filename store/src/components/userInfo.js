import React, { useState } from 'react'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { get_env, isClient } from '../utils'
import { UserIcon } from '../assets/icons'
import { Button } from './button'
import { Tunnel } from '.'
import { useUser, CartContext, useTranslation } from '../context'
import { useToasts } from 'react-toast-notifications'
import { UPDATE_PLATFORM_CUSTOMER } from '../graphql'
import { useMutation } from '@apollo/react-hooks'
import classNames from 'classnames'

export const UserInfo = props => {
   const { t } = useTranslation()
   const [isTunnelOpen, setIsTunnelOpen] = useState(false)
   const [isUserFormOpen, setIsUserFormOpen] = useState(false)
   const [settingCartinfo, setSettingCartinfo] = useState(false)

   const isSmallerDevice = isClient && window.innerWidth < 768

   const handleEdit = () => {
      if (isSmallerDevice) {
         setIsTunnelOpen(true)
      } else {
         setIsUserFormOpen(true)
      }
   }
   const handleClose = () => {
      if (isSmallerDevice) {
         setIsTunnelOpen(false)
      } else {
         setIsUserFormOpen(false)
      }
   }

   return (
      <>
         {!isSmallerDevice ? (
            isUserFormOpen ? (
               <UserInfoForm
                  settingCartinfo={settingCartinfo}
                  setSettingCartinfo={setSettingCartinfo}
                  handleClose={handleClose}
                  {...props}
               />
            ) : (
               <UserDetails
                  settingCartinfo={settingCartinfo}
                  handleOpen={() => setIsUserFormOpen(true)}
                  handleEdit={handleEdit}
                  setSettingCartinfo={setSettingCartinfo}
               />
            )
         ) : (
            <>
               <UserDetails handleEdit={handleEdit} />
               <Tunnel.Right
                  title={
                     <div style={{ display: 'flex', alignItems: 'center' }}>
                        <UserIcon size={16} />
                        <h2 className="hern-user-info__heading">
                           {t('User Details')}
                        </h2>
                     </div>
                  }
                  visible={isTunnelOpen}
                  onClose={() => setIsTunnelOpen(false)}
               >
                  <UserInfoForm
                     tunnel={true}
                     handleClose={handleClose}
                     {...props}
                  />
               </Tunnel.Right>
            </>
         )}
      </>
   )
}
const UserInfoForm = props => {
   const {
      editable = true,
      tunnel = false,
      handleClose,
      settingCartinfo,
      setSettingCartinfo,
   } = props
   const { cartState, methods } = React.useContext(CartContext)
   const { user } = useUser()
   const { addToast } = useToasts()
   const { t } = useTranslation(
   )
   const { cart } = cartState
   const [savingUserInfo, setSavingUserInfo] = React.useState(false)
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

   const isSmallerDevice = isClient && window.innerWidth < 768

   const [updateCustomer] = useMutation(UPDATE_PLATFORM_CUSTOMER, {
      onCompleted: () => {
         console.log('updated')
      },
      onError: error => {
         console.error(error)
         addToast(<span>{t('Failed to save!')}</span>, {
            appearance: 'error',
         })
      },
   })

   const handleSave = async () => {
      setSavingUserInfo(true)
      await methods.cart.update({
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
         await updateCustomer({
            variables: {
               keycloakId: user.keycloakId,
               _set: { firstName: firstName, lastName: lastName },
            },
         })
      }
      setSavingUserInfo(false)
      if (!isSmallerDevice && cart?.customerInfo === null) {
         setSettingCartinfo(true)
      } else {
         handleClose()
      }
   }

   React.useEffect(() => {
      if (!isSmallerDevice && cart?.customerInfo !== null && settingCartinfo) {
         handleClose()
      }
   }, [cart])

   return (
      <div
         className={classNames('hern-user-info', {
            'hern-user-info__tunnel': tunnel,
         })}
      >
         <div className="hern-user-info__header">
            <div>
               <UserIcon size={16} />
               <h2 className="hern-user-info__heading">{t('User Details')}</h2>
            </div>
            <Button
               disabled={
                  !firstName?.length ||
                  !lastName?.length ||
                  !mobileNumber?.length ||
                  !isValidPhoneNumber(mobileNumber)
               }
               onClick={handleSave}
               loading={savingUserInfo}
            >
               {t('save')}
            </Button>
         </div>
         <div className="hern-user-info__name-field">
            <fieldset className="hern-user-info__fieldset hern-user-info__fieldset-first-name">
               <label className="hern-user-info__label">{t('First Name')}</label>
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
               <label className="hern-user-info__label">{t('Last Name')}</label>
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
            <label className="hern-user-info__label">{t('Phone Number')}</label>
            <PhoneInput
               className={`hern-user-info__phone__input hern-user-info__phone__input${!(mobileNumber && isValidPhoneNumber(mobileNumber))
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
                  t('Invalid phone number')}
            </span>
         </fieldset>
      </div>
   )
}
const UserDetails = ({
   handleEdit,
   handleOpen,
   settingCartinfo,
   setSettingCartinfo,
}) => {
   const { cartState } = React.useContext(CartContext)
   const isSmallerDevice = isClient && window.innerWidth < 768
   const { t } = useTranslation(
   )
   const hasUserInfo =
      cartState?.cart?.customerInfo?.customerFirstName?.length ||
      cartState?.cart?.customerInfo?.customerLastName?.length ||
      cartState?.cart?.customerInfo?.customerPhone?.length

   React.useEffect(() => {
      if (!isSmallerDevice && !hasUserInfo && !settingCartinfo) {
         handleOpen()
      }
   }, [])
   return (
      <>
         {isSmallerDevice && !hasUserInfo ? (
            <button
               onClick={handleEdit}
               className="hern-user-info-tunnel__open-btn"
            >
               {t('Add user info')}
            </button>
         ) : (
            <div className="hern-user-info--closed">
               <div>
                  <span>
                     <UserIcon size={16} />
                  </span>
                  <div>
                     <span>
                        {cartState?.cart?.customerInfo?.customerFirstName +
                           ' ' +
                           cartState?.cart?.customerInfo?.customerLastName}
                     </span>
                     <span className="hern-user-info--closed__phone-no">
                        {cartState?.cart?.customerInfo?.customerPhone}
                     </span>
                  </div>
               </div>
               <button
                  onClick={() => {
                     setSettingCartinfo && setSettingCartinfo(false)
                     handleEdit()
                  }}
               >
                  {t('Edit')}</button>
            </div>
         )}
      </>
   )
}
