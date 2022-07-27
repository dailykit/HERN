import React from 'react'
import { isEmpty } from 'lodash'
import { useRouter } from 'next/router'
import { useDelivery } from './state'
import { useTranslation, useUser } from '../../context'
import { AddressLabelIcon } from '../../assets/icons'
import { AddressTunnel } from './address_tunnel'
import { HelperBar } from '../../components'
import { getRoute, normalizeAddress } from '../../utils'
import { FaPlus } from 'react-icons/fa'

export const AddressSection = () => {
   const router = useRouter()
   const { user } = useUser()
   const { state, dispatch } = useDelivery()
   const { t, dynamicTrans, locale } = useTranslation()
   const [currentView, setCurrentView] = React.useState('address-list')

   //Customers previously selected address
   React.useEffect(() => {
      if (
         Array.isArray(user?.platform_customer?.addresses) &&
         !isEmpty(user?.platform_customer?.addresses)
      ) {
         const [address] = user?.platform_customer?.addresses
         addressSelection(address)
      }
   }, [dispatch])

   //Effect for setting current view to address form if there is no address
   React.useEffect(() => {
      if (isEmpty(user?.platform_customer?.addresses)) {
         setCurrentView('address-list')
      } else if (!isEmpty(state?.address)) {
         setCurrentView('selected-address')
      } else {
         setCurrentView('address-form')
      }
   }, [])

   //Language change
   const currentLang = React.useMemo(() => locale, [locale])
   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])

   //select address handler
   const addressSelection = address => {
      dispatch({ type: 'SET_ADDRESS', payload: address })
   }

   return (
      <div className="hern-delivery__address">
         <div className="hern-delivery__address__add-change-btn">
            {currentView === 'selected-address' && (
               <button
                  onClick={() => setCurrentView('address-list')}
                  className="hern-delivery__address__add-change-btn--change"
               >
                  Change
               </button>
            )}
            {currentView === 'address-list' && (
               <button
                  onClick={() => setCurrentView('address-form')}
                  className="hern-delivery__address__add-change-btn--add"
               >
                  <FaPlus color="var(--hern-accent)" /> Add address
               </button>
            )}
            {currentView === 'address-form' && (
               <button
                  onClick={() => setCurrentView('address-list')}
                  className="hern-delivery__address__add-change-btn--change"
               >
                  Saved Addresses
               </button>
            )}
         </div>

         {state.address.error && (
            <HelperBar type="error">
               <HelperBar.SubTitle>
                  <span data-translation="true" value={state.address.error}>
                     {state.address.error}
                  </span>
               </HelperBar.SubTitle>
               <HelperBar.Button
                  onClick={() =>
                     router.push(getRoute('/get-started/select-plan'))
                  }
               >
                  {t('Change Plan')}
               </HelperBar.Button>
            </HelperBar>
         )}
         {currentView === 'address-form' && (
            <div className="hern-delivery__address__tunnel">
               <AddressTunnel
                  onSubmitAddress={() => {}}
                  onSavingSuccess={() => setCurrentView('selected-address')}
                  outside={true}
               />
            </div>
         )}
         {currentView === 'address-list' && (
            <ul className="hern-delivery__address__list">
               {user?.platform_customer?.addresses.map(address => (
                  <AddressCard
                     key={address.id}
                     address={address}
                     addressSelection={addressSelection}
                     setCurrentView={setCurrentView}
                     selectedAddress={state?.address?.selected}
                  />
               ))}
            </ul>
         )}
         {currentView === 'selected-address' && (
            <AddressCard
               address={state.address.selected}
               addressSelection={addressSelection}
               isSelectedCard={true}
               setCurrentView={setCurrentView}
            />
         )}
      </div>
   )
}

const AddressCard = ({
   address,
   addressSelection,
   isSelectedCard = false,
   setCurrentView,
   selectedAddress,
}) => {
   const { t } = useTranslation()

   return (
      <li
         onClick={() => addressSelection(address)}
         className="hern-delivery__address__list-item"
         style={{
            border:
               address?.id === selectedAddress?.id &&
               '0.5px solid var(--hern-accent)',
            // boxShadow: isSelectedCard
            //    ? 'none'
            //    : '0px 0px 29px rgba(0, 0, 0, 0.08)',
            marginTop: isSelectedCard ? '45px' : 'none',
         }}
      >
         <div className="hern-delivery__address__list-item__header">
            <AddressLabelIcon label={address.label} />
            &nbsp;&nbsp;
            <span className="hern-delivery__address__list-item__header__title">
               {address.label ? address.label : address.line1}
            </span>
         </div>
         <div
            style={{ minHeight: isSelectedCard ? 'auto' : '30px' }}
            className="hern-delivery__address__list-item__address"
         >
            {normalizeAddress(address)}
         </div>
         {!isSelectedCard && (
            <button
               onClick={() => {
                  setCurrentView('selected-address')
                  addressSelection(address)
               }}
               className="hern-delivery__address__list-item__select-address-btn"
            >
               <span>{t('Select Address')}</span>
            </button>
         )}
      </li>
   )
}
