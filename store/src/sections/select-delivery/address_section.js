import React from 'react'
import { isEmpty } from 'lodash'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import { useDelivery } from './state'
import { useConfig } from '../../lib'
import { useTranslation, useUser } from '../../context'
import { CheckIcon } from '../../assets/icons'
import { AddressTunnel } from './address_tunnel'
import { Button, HelperBar } from '../../components'
import { getRoute } from '../../utils'

export const AddressSection = () => {
   const router = useRouter()
   const { user } = useUser()
   const { configOf } = useConfig()
   const { state, dispatch } = useDelivery()
   const { t, dynamicTrans } = useTranslation()

   React.useEffect(() => {
      if (
         Array.isArray(user?.platform_customer?.addresses) &&
         !isEmpty(user?.platform_customer?.addresses)
      ) {
         const [address] = user?.platform_customer?.addresses
         addressSelection(address)
      }
   }, [dispatch, user])

   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [])

   const addressSelection = address => {
      dispatch({ type: 'SET_ADDRESS', payload: address })
   }

   const toggleTunnel = value => {
      dispatch({ type: 'TOGGLE_TUNNEL', payload: value })
   }

   //config properties
   const theme = configOf('theme-color', 'Visual')
   const addressLabelFromConfig = configOf('address', 'Select-Delivery')?.address?.selectAddress

   return (
      <>
         <header className="hern-delivery__address-section__header">
            <h3
               className="hern-delivery__section-title"
               style={{
                  color: theme?.accent ? theme.accent : 'rgba(5, 150, 105, 1)',
               }}
            >
               {<span data-translation="true" value={addressLabelFromConfig?.value}>{addressLabelFromConfig?.value}</span> || <span>{t('Select Address')}</span>}
            </h3>
            {user?.platform_customer?.addresses.length > 0 && (
               <Button bg={theme?.accent} onClick={() => toggleTunnel(true)}>
                  {t('Add Address')}
               </Button>
            )}
         </header>
         {state.address.error && (
            <HelperBar type="error">
               <HelperBar.SubTitle><span data-translation="true" value={state.address.error}>{state.address.error}</span></HelperBar.SubTitle>
               <HelperBar.Button
                  onClick={() =>
                     router.push(getRoute('/get-started/select-plan'))
                  }
               >
                  {t('Change Plan')}
               </HelperBar.Button>
            </HelperBar>
         )}
         {user?.platform_customer?.addresses.length > 0 ? (
            <ul className="hern-delivery__address-list">
               {user?.platform_customer?.addresses.map(address => {
                  const checkIconClasses = classNames(
                     'hern-delivery__address-list-item__check-icon',
                     {
                        'hern-delivery__address-list-item__check-icon--active':
                           state.address.selected?.id === address.id,
                     }
                  )
                  const addressListItem = classNames(
                     'hern-delivery__address-list-item',
                     {
                        'hern-delivery__address-list-item--active':
                           state.address.selected?.id === address.id,
                     }
                  )
                  return (
                     <li
                        key={address.id}
                        onClick={() => addressSelection(address)}
                        className={addressListItem}
                     >
                        <div className="hern-delivery__address-list-item__check-icon__wrapper">
                           <CheckIcon size={18} className={checkIconClasses} />
                        </div>
                        <label onClick={() => addressSelection(address)}>
                           <span>{address.line1}</span>
                           <span>{address.line2}</span>
                           <span>{address.city}</span>
                           <span>{address.state}</span>
                           <span>{address.country}</span>
                           <span>{address.zipcode}</span>
                        </label>
                     </li>
                  )
               })}
            </ul>
         ) : (
            <HelperBar type="info">
               <HelperBar.SubTitle>
                  {t("Let's start with adding an address")}
               </HelperBar.SubTitle>
               <HelperBar.Button onClick={() => toggleTunnel(true)}>
                  {t('Add Address')}
               </HelperBar.Button>
            </HelperBar>
         )}
         {state.address.tunnel && <AddressTunnel />}
      </>
   )
}
