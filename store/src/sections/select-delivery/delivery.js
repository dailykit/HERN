import React from 'react'
import { useRouter } from 'next/router'
import { useMutation } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { useTranslation, useUser } from '../../context'
import { BRAND } from '../../graphql'
import { useConfig } from '../../lib'
import { getRoute } from '../../utils'
import { DeliveryDateSection } from './delivery_date_section'
import { DeliveryProvider, useDelivery } from './state'
import { AddressSection } from './address_section'
import { DeliverySection } from './delivery_section'
import classNames from 'classnames'
import { isEmpty } from 'lodash'
import { DeliveryTitleIcons } from '../../assets/icons'

export const Delivery = ({ config }) => {
   return (
      <DeliveryProvider>
         <DeliveryContent config={config} />
      </DeliveryProvider>
   )
}
const DeliveryContent = ({ config }) => {
   console.log('cfg', config)
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
   const moduleConfig = {
      title: {
         address: config?.data?.address?.title?.value || t('Address'),
         deliveryDay:
            config?.data?.deliveryDay?.title?.value || t('Delivery Day'),
         deliveryDate:
            config?.data?.deliveryDate?.title?.value || t('Delivery Date'),
      },
      showIcon: config?.informationVisibility?.showIconOnTitle?.value ?? false,
   }

   const deliveryCardContent = [
      {
         id: 1,
         count: 1,
         title: moduleConfig.title.address,
         content: <AddressSection />,
         identifier: 'address',
         isActive: !isEmpty(state?.address?.selected),
      },
      {
         id: 2,
         count: 2,
         title: moduleConfig.title.deliveryDay,
         content: <DeliverySection />,
         identifier: 'delivery-day',
         isActive: !isEmpty(state?.delivery?.selected),
      },
      {
         id: 3,
         count: 3,
         title: moduleConfig.title.deliveryDate,
         content: <DeliveryDateSection />,
         identifier: 'delivery-date',
         isActive: !isEmpty(state?.delivery_date?.selected),
      },
   ]
   return (
      <main className="hern-delivery__main">
         {deliveryCardContent.map(content => (
            <DeliverySectionCard
               key={content.id}
               content={content}
               config={moduleConfig}
            />
         ))}
         <button
            className={classNames('hern-delivery__continue-btn', {
               'hern-delivery__continue-btn--disabled': !isValid(),
            })}
            onClick={nextStep}
            disabled={!isValid()}
         >
            {t('Continue')}
         </button>
      </main>
   )
}
const DeliverySectionCard = ({ content, config }) => {
   const Icon = content.Icon
   return (
      <div className="hern-delivery__card">
         <div
            className={classNames('hern-delivery__card__counter', {
               'hern-delivery__card__counter--active': content.isActive,
            })}
         >
            <span>{content.count}</span>
         </div>
         <div className="hern-delivery__card__content__wrapper">
            <div
               className={classNames('hern-delivery__card__content__header', {
                  'hern-delivery__card__content__header--active':
                     content.isActive,
               })}
            >
               {config.showIcon && (
                  <DeliveryTitleIcons
                     identifier={content.identifier}
                     color={
                        content.isActive ? '#333333' : 'rgba(51, 51, 51, 0.4)'
                     }
                  />
               )}
               &nbsp;{content.title}
            </div>

            <div className="hern-delivery__card__content">
               {content.content}
            </div>
         </div>
      </div>
   )
}
