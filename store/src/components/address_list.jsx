import { useQuery } from '@apollo/react-hooks'
import classNames from 'classnames'
import React, { useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import { CloseIcon, LocationIcon } from '../assets/icons'
import { CartContext, useTranslation, useUser } from '../context'
import { ZIPCODE_AVAILABILITY } from '../graphql'
import { Loader } from './loader'
import { Modal } from 'antd'
import { normalizeAddress } from '../utils'

const AddressList = ({
   closeTunnel,
   onSelect,
   zipCodes = true,
   tunnel = true,
   activeAddressId = null,
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
            {tunnel && (
               <button className="hern-address-list__close-btn">
                  <CloseIcon
                     size={20}
                     color={'rgba(51, 51, 51, 1)'}
                     stroke="currentColor"
                     onClick={closeTunnel}
                  />
               </button>
            )}
            <h3 className="hern-address-list__heading">
               {t('Your saved addresses')}
            </h3>
         </div>
         <div className="hern-address-list-container__address">
            {user?.keycloakId ? (
               addresses.map(address => {
                  const addressClasses = classNames(
                     'hern-address-list__address',
                     {
                        'hern-address-list__address--active':
                           activeAddressId === address.id,
                     }
                  )
                  return (
                     <div
                        key={address?.id}
                        tabIndex={1}
                        className={addressClasses}
                     >
                        <h4>Delivery at</h4>
                        <address onClick={() => selectAddress(address)}>
                           {normalizeAddress(address)}
                        </address>
                     </div>
                  )
               })
            ) : (
               <>
                  <h4>Delivery at</h4>
                  <address
                     key={addressByCart?.id || 1}
                     tabIndex={1}
                     className={classNames('hern-address-list__address', {
                        'hern-address-list__address--active':
                           localAddress === addressByCart,
                     })}
                     onClick={() => selectAddress(addressByCart)}
                  >
                     {normalizeAddress(addressByCart)}
                  </address>
               </>
            )}
         </div>
      </div>
   )
}

export default AddressList
