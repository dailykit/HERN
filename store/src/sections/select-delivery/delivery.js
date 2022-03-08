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
   const { state } = useDelivery()
   const { addToast } = useToasts()
   const { brand, configOf } = useConfig()
   const { t, dynamicTrans } = useTranslation()
   const [updateBrandCustomer] = useMutation(BRAND.CUSTOMER.UPDATE, {
      onCompleted: () => {
         addToast(t('Successfully saved delivery preferences.'), {
            appearance: 'success',
         })
         router.push(
            getRoute(
               `/get-started/select-menu/?date=${state.delivery_date.selected.fulfillmentDate
               }${state.skip_list.length > 0
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
   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [])
   const isValid = () => {
      if (Object.keys(state.delivery.selected).length === 0) return false
      if (Object.keys(state.address.selected).length === 0) return false
      if (Object.keys(state.delivery_date.selected).length === 0) return false
      if (state.address.error) return false
      return true
   }

   //config properties
   const theme = configOf('theme-color', 'Visual')
   const backgroundFromConfig = configOf('select-delivery-background', 'Select-Delivery')?.background
   const deliveryDayLabelFromConfig = configOf('delivery-day', 'Select-Delivery')?.Delivery?.deliveryDayLabel
   const firstDeliveryDayLabelFromConfig = configOf('first-delivery', 'Select-Delivery')?.firstDelivery?.firstDeliveryDayLabel

   const brandTextColor = {
      color: theme?.accent ? theme.accent : 'rgba(5, 150, 105, 1)',
   }
   return (
      <main className="hern-delivery__main" style={backgroundFromConfig && {
         backgroundImage: "url(" + backgroundFromConfig?.BackgroundImage?.value + ")",
         backgroundColor: backgroundFromConfig?.backgroundColor?.value
      }}>
         <header className="hern-delivery__header">
            <h2 className="hern-delivery__title" style={brandTextColor}>
               {t('Delivery')}
            </h2>
         </header>
         <AddressSection />
         <h3 className="hern-delivery__section-title" style={brandTextColor}>
            {<span data-translation="true" data-original-value={deliveryDayLabelFromConfig?.value}>{deliveryDayLabelFromConfig?.value}</span> || t('Delivery Day')}
         </h3>
         <DeliverySection />
         <h3 className="hern-delivery__section-title" style={brandTextColor}>
            {<span data-translation="true" data-original-value={firstDeliveryDayLabelFromConfig?.value}>{firstDeliveryDayLabelFromConfig?.value}</span> || t('Select your first delivery date')}
         </h3>
         <DeliveryDateSection />
         <div className="hern-delivery__continue">
            <Button bg={theme?.accent} onClick={nextStep}
               disabled={!isValid()}
            >
               {t('Continue')}
            </Button>
         </div>
      </main>
   )
}
