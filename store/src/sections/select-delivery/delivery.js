import React from 'react'
import { useRouter } from 'next/router'
import { useMutation } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { useTranslation, useUser } from '../../context'
import { BRAND } from '../../graphql'
import { useConfig } from '../../lib'
import { Button } from '../../components'
import { getRoute } from '../../utils'
import { DeliveryDateSection } from './delivery_date_section'
import { DeliveryProvider, useDelivery } from './state'
import { AddressSection } from './address_section'
import { DeliverySection } from './delivery_section'
import { SectionTitle } from './section_title'

export const Delivery = () => {
   return (
      <DeliveryProvider>
         <DeliveryContent />
      </DeliveryProvider>
   )
}
const DeliveryContent = () => {
   const router = useRouter()
   const { user } = useUser()
   const { state, dispatch } = useDelivery()
   const { addToast } = useToasts()
   const { brand, configOf } = useConfig()
   const { t, dynamicTrans, locale } = useTranslation()
   const [updateBrandCustomer] = useMutation(BRAND.CUSTOMER.UPDATE, {
      onCompleted: () => {
         addToast(t('Successfully saved delivery preferences.'), {
            appearance: 'success',
         })
         router.push(
            getRoute(
               `/get-started/select-menu/?date=${
                  state.delivery_date.selected.fulfillmentDate
               }${
                  state.skip_list.length > 0
                     ? `&previous=${state.skip_list}`
                     : ''
               }`
            )
         )
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })
   const nextStep = () => {
      updateBrandCustomer({
         variables: {
            where: {
               keycloakId: { _eq: user?.keycloakId },
               brandId: { _eq: brand.id },
            },
            _set: {
               subscriptionOnboardStatus: 'SELECT_MENU',
               subscriptionId: state.delivery.selected.id,
               subscriptionAddressId: state.address.selected.id,
            },
         },
      })
   }
   const currentLang = React.useMemo(() => locale, [locale])

   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])

   const isValid = () => {
      if (Object.keys(state.delivery.selected).length === 0) return false
      if (Object.keys(state.address.selected).length === 0) return false
      if (Object.keys(state.delivery_date.selected).length === 0) return false
      if (state.address.error) return false
      return true
   }

   //config properties
   const theme = configOf('theme-color', 'Visual')
   const backgroundFromConfig = configOf(
      'select-delivery-background',
      'Select-Delivery'
   )?.background
   const deliveryDayLabelFromConfig = configOf(
      'delivery-day',
      'Select-Delivery'
   )?.Delivery?.deliveryDayLabel
   const firstDeliveryDayLabelFromConfig = configOf(
      'first-delivery',
      'Select-Delivery'
   )?.firstDelivery?.firstDeliveryDayLabel

   const addressLabelFromConfig = configOf('address', 'Select-Delivery')
      ?.address?.selectAddress

   const toggleTunnel = value => {
      dispatch({ type: 'TOGGLE_TUNNEL', payload: value })
   }
   return (
      <main
         className="hern-delivery__main"
         style={
            backgroundFromConfig && {
               backgroundImage:
                  'url(' + backgroundFromConfig?.BackgroundImage?.value + ')',
               backgroundColor: backgroundFromConfig?.backgroundColor?.value,
            }
         }
      >
         <section className="hern-delivery__section">
            <header className="hern-delivery__address-section__header">
               <SectionTitle
                  count={1}
                  title={
                     addressLabelFromConfig?.value ? (
                        <p data-translation="true">
                           {addressLabelFromConfig?.value}
                        </p>
                     ) : (
                        t('Select a delivery Address')
                     )
                  }
               />

               <Button bg={theme?.accent} onClick={() => toggleTunnel(true)}>
                  {t('Add Address')}
               </Button>
            </header>
            <AddressSection />
         </section>
         <section className="hern-delivery__section">
            <SectionTitle
               count={2}
               title={
                  deliveryDayLabelFromConfig?.value ? (
                     <p data-translation="true">
                        {deliveryDayLabelFromConfig?.value}
                     </p>
                  ) : (
                     t('Select a delivery day to get started')
                  )
               }
            />
            <DeliverySection />
         </section>
         <section className="hern-delivery__section">
            <SectionTitle
               count={3}
               title={
                  firstDeliveryDayLabelFromConfig?.value ? (
                     <p data-translation="true">
                        {firstDeliveryDayLabelFromConfig?.value}
                     </p>
                  ) : (
                     t('Select your first delivery date')
                  )
               }
            />
            <DeliveryDateSection />
         </section>
         <div className="hern-delivery__continue">
            <Button bg={theme?.accent} onClick={nextStep} disabled={!isValid()}>
               {t('Continue')}
            </Button>
         </div>
      </main>
   )
}
