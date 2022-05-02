import { useQuery } from '@apollo/react-hooks'
import classNames from 'classnames'
import React, { useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import { CloseIcon, LocationIcon } from '../assets/icons'
import { CartContext, useTranslation, useUser } from '../context'
import { ZIPCODE_AVAILABILITY } from '../graphql'
import { Loader } from './loader'
import { Modal } from 'antd'

const AddressList = ({
   closeTunnel,
   onSelect,
   zipCodes = true,
   tunnel = true,
}) => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const { t } = useTranslation()
   const { cartState } = React.useContext(CartContext)

   const addresses = user?.platform_customer?.addresses || []

   const addressByCart = cartState.cart?.address

   const [availableZipcodes, setAvailableZipcodes] = React.useState([])
   const [localAddress, setLocalAddress] = useState(null)

   const { loading } = useQuery(ZIPCODE_AVAILABILITY, {
      fetchPolicy: 'network-only',
      variables: {
         subscriptionId: {
            _eq: user?.subscriptionId,
         },
         zipcode: {},
      },
      onCompleted: ({ subscription_zipcode = [] }) => {
         if (zipCodes && subscription_zipcode.length) {
            setAvailableZipcodes(subscription_zipcode.map(z => z.zipcode))
         }
      },
      onError: error => {
         addToast(t('Something went wrong'), { appearance: 'error' })
         console.log('checkZipcodeValidity -> zipcode -> error', error)
      },
   })

   const selectAddress = address => {
      if (zipCodes && availableZipcodes.includes(address.zipcode)) {
         onSelect(address)
      } else {
         if (!address.zipcode) {
            showWarningPopup()
            return
         }
         setLocalAddress(address)
         onSelect(address)
      }
   }
   const showWarningPopup = () => {
      Modal.warning({
         title: `Please select a precise location. Try typing a landmark near your house.`,
         maskClosable: true,
         centered: true,
      })
   }
   if (loading) return <Loader />

   return (
      <div className="hern-address-list">
         <div className="hern-address-list__header">
            <h3 className="hern-address-list__heading">
               {t('Your saved addresses')}
            </h3>
            {tunnel && (
               <button className="hern-address-list__close-btn">
                  <CloseIcon
                     size={16}
                     color={'var(--hern-accent)'}
                     stroke="currentColor"
                     onClick={closeTunnel}
                  />
               </button>
            )}
         </div>
         <div className="hern-address-list-container__address">
            {user?.keycloakId ? (
               addresses.map(address => {
                  const addressClasses = classNames(
                     'hern-address-list__address',
                     {
                        'hern-address-list__address--active': localAddress,
                     }
                  )
                  return (
                     <address
                        key={address?.id}
                        className={addressClasses}
                        tabIndex={1}
                        onClick={() => selectAddress(address)}
                     >
                        <div className="hern-address-list__address-landmark">
                           {address?.landmark}
                        </div>
                        <p>{address?.line1}</p>
                        <p>{address?.line2}</p>
                        <span>{address?.city} </span>
                        <span>{address?.state} </span>
                        <span>
                           {address?.country}
                           {', '}
                        </span>
                        <span>{address?.zipcode}</span>
                     </address>
                  )
               })
            ) : (
               <address
                  key={addressByCart?.id || 1}
                  tabIndex={1}
                  className={classNames('hern-address-list__address', {
                     'hern-address-list__address--active':
                        localAddress === addressByCart,
                  })}
                  onClick={() => selectAddress(addressByCart)}
               >
                  <p>{addressByCart?.line1}</p>
                  <p>{addressByCart?.line2}</p>
                  <span>{addressByCart?.city} </span>
                  <span>{addressByCart?.state} </span>
                  <span>
                     {addressByCart?.country}
                     {', '}
                  </span>
                  <span>{addressByCart?.zipcode}</span>
               </address>
            )}
         </div>
      </div>
   )
}

export default AddressList
export const AddressListHeader = () => {
   const { t } = useTranslation()
   return (
      <div
         style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
         }}
      >
         <LocationIcon />
         <label
            className={'hern-address-list-header__label'}
            htmlFor="address-list-header"
         >
            {t('Delivery Area')}
         </label>
      </div>
   )
}
