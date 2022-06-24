import { useLazyQuery, useQuery } from '@apollo/react-hooks'
import classNames from 'classnames'
import React, { useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import { CloseIcon } from '../assets/icons'
import { useTranslation, useUser } from '../context'
import { GET_AVAILABLE_ZIP_CODES_BY_SUBSCRIPTION_ID } from '../graphql'
import { normalizeAddress } from '../utils'

const AddressList = ({
   closeTunnel,
   onSelect,
   tunnel = true,
   activeAddressId = null,
}) => {
   const { user } = useUser()
   const { t } = useTranslation()
   const { addToast } = useToasts()
   const addresses = user?.platform_customer?.addresses || []
   const [showZipCodeError, setShowZipCodeError] = React.useState(null)
   const { data, error, loading } = useQuery(
      GET_AVAILABLE_ZIP_CODES_BY_SUBSCRIPTION_ID,
      {
         variables: {
            subscriptionId: Number(user?.subscriptionId),
         },

         onError: error => {
            console.error(error)
            addToast(t('Failed to fetch zip code '), {
               appearance: 'error',
            })
         },
      }
   )
   const availableZipCodes =
      data?.subscription_subscription[0]?.availableZipcodes?.map(
         z => z.zipcode
      ) || []

   const selectAddress = address => {
      if (availableZipCodes.includes(address.zipcode)) {
         onSelect(address)
      } else {
         setShowZipCodeError(address.zipcode)
         addToast(t('This address is not available'), {
            appearance: 'error',
         })
      }
   }

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
            {addresses.map(address => {
               const addressClasses = classNames('hern-address-list__address', {
                  'hern-address-list__address--active':
                     activeAddressId === address.id,
                  'hern-address-list__address--invalid':
                     showZipCodeError === address.zipcode,
               })
               return (
                  <>
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

                     {showZipCodeError === address.zipcode && (
                        <p className="hern-address-list__address--invalid__message">
                           {t(
                              'This Delivery area is not available for this Plan. '
                           )}
                        </p>
                     )}
                  </>
               )
            })}
         </div>
      </div>
   )
}

export default AddressList
