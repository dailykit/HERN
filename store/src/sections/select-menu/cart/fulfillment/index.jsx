import React from 'react'
import moment from 'moment'
import { isEmpty } from 'lodash'
import { useToasts } from 'react-toast-notifications'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import classNames from 'classnames'

import { useMenu } from '../../state'
import { useConfig } from '../../../../lib'
import { useTranslation, useUser } from '../../../../context'
import { Loader, Tunnel } from '../../../../components'
import { CheckIcon } from '../../../../assets/icons'
import { ZIPCODE, MUTATIONS, UPDATE_CART } from '../../../../graphql'
import { formatCurrency, normalizeAddress } from '../../../../utils'
import AddressList from '../../../../components/address_list'

const evalTime = (date, time) => {
   const [hour, minute] = time.split(':')
   return moment(date).hour(hour).minute(minute).second(0).toISOString()
}

const Fulfillment = () => {
   const { state, dispatch } = useMenu()
   const { user } = useUser()
   const { addToast } = useToasts()
   const { brand, configOf } = useConfig()
   const { t } = useTranslation()
   const [isAddressListOpen, setIsAddressListOpen] = React.useState(false)

   const store = configOf(
      'Store Availability',
      'availability'
   )?.storeAvailability

   const [updateOccurenceCustomer] = useMutation(
      MUTATIONS.OCCURENCE.CUSTOMER.UPDATE,
      { onError: error => console.log(error) }
   )
   const [createCart] = useMutation(MUTATIONS.CART.CREATE, {
      onCompleted: ({ createCart: { id = '' } = {} }) => {
         const isSkipped = state.occurenceCustomer?.isSkipped
         updateOccurenceCustomer({
            variables: {
               pk_columns: {
                  keycloakId: user.keycloakId,
                  brand_customerId: user.brandCustomerId,
                  subscriptionOccurenceId: state.week.id,
               },
               _set: { isSkipped: false, cartId: id },
            },
         }).then(({ data: { updateOccurenceCustomer = {} } = {} }) => {
            if (isSkipped !== updateOccurenceCustomer?.isSkipped) {
               addToast(t('This week has been unskipped'), {
                  appearance: 'info',
               })
            }
         })
         dispatch({ type: 'CART_STATE', payload: 'SAVED' })
      },
      onError: error => {
         dispatch({ type: 'CART_STATE', payload: 'SAVED' })
         console.log(error)
      },
   })
   const [updateCart] = useMutation(UPDATE_CART, {
      onCompleted: ({ updateCart: { id = '' } = {} }) => {
         const isSkipped = state.occurenceCustomer?.isSkipped
         updateOccurenceCustomer({
            variables: {
               pk_columns: {
                  keycloakId: user.keycloakId,
                  brand_customerId: user.brandCustomerId,
                  subscriptionOccurenceId: state.week.id,
               },
               _set: { isSkipped: false, cartId: id },
            },
         })
            .then(({ data: { updateOccurenceCustomer = {} } = {} }) => {
               if (isSkipped !== updateOccurenceCustomer?.isSkipped) {
                  addToast(t('This week has been unskipped'), {
                     appearance: 'info',
                  })
               }
            })
            .dispatch({ type: 'CART_STATE', payload: 'SAVED' })
      },
      onError: error => {
         dispatch({ type: 'CART_STATE', payload: 'SAVED' })
         console.log(error)
      },
   })
   const { loading, data: { zipcode = {} } = {} } = useSubscription(ZIPCODE, {
      variables: {
         subscriptionId: user?.subscriptionId,
         zipcode: user?.defaultAddress?.zipcode,
      },
   })

   const setFulfillment = mode => {
      let fulfillmentInfo = {}
      const fulfillmentDate = state.week.fulfillmentDate
      dispatch({ type: 'CART_STATE', payload: 'SAVING' })

      if (mode === 'DELIVERY') {
         const { from = '', to = '' } = zipcode?.deliveryTime
         if (from && to) {
            fulfillmentInfo = {
               type: 'PREORDER_DELIVERY',
               slot: {
                  from: evalTime(fulfillmentDate, from),
                  to: evalTime(fulfillmentDate, to),
               },
            }
         }
      } else if (mode === 'PICKUP') {
         const { from = '', to = '' } = zipcode?.pickupOption?.time
         if (from && to) {
            fulfillmentInfo = {
               type: 'PREORDER_PICKUP',
               slot: {
                  from: evalTime(fulfillmentDate, from),
                  to: evalTime(fulfillmentDate, to),
               },
               address: zipcode?.pickupOption?.address,
            }
         }
      }

      if (isEmpty(fulfillmentInfo)) {
         return addToast(t('Fulfillment mode is not available!'), {
            appearance: 'error',
         })
      }
      if (state.occurenceCustomer?.validStatus?.hasCart) {
         updateCart({
            variables: {
               id: state.occurenceCustomer?.cart?.id,
               _set: { fulfillmentInfo },
            },
         }).then(() =>
            addToast(t('Your fulfillment preference has been saved'), {
               appearance: 'success',
            })
         )
      } else {
         const customerInfo = {
            customerEmail: user?.platform_customer?.email || '',
            customerPhone: user?.platform_customer?.phoneNumber || '',
            customerLastName: user?.platform_customer?.lastName || '',
            customerFirstName: user?.platform_customer?.firstName || '',
         }

         createCart({
            variables: {
               object: {
                  customerInfo,
                  fulfillmentInfo,
                  brandId: brand.id,
                  status: 'CART_PENDING',
                  customerId: user.id,
                  source: 'subscription',
                  paymentStatus: 'PENDING',
                  address: user.defaultAddress,
                  customerKeycloakId: user.keycloakId,
                  subscriptionOccurenceId: state.week.id,
                  isTest: user?.isTest || !store?.isStoreLive?.value,
                  ...(user?.subscriptionPaymentMethodId && {
                     paymentMethodId: user?.subscriptionPaymentMethodId,
                  }),
                  paymentCustomerId: user?.platform_customer?.paymentCustomerId,
               },
            },
         }).then(() =>
            addToast(t('Your fulfillment preference has been saved'), {
               appearance: 'success',
            })
         )
      }
   }
   return (
      <>
         <section className="hern-cart-fulfillment">
            <h4 className="hern-cart-fulfillment__heading">
               {t('Fulfillment Mode')}
            </h4>
            {loading ? (
               <Loader inline />
            ) : (
               <section>
                  {zipcode.isDeliveryActive && (
                     <FulfillmentOption
                        type="DELIVERY"
                        state={state}
                        zipcode={zipcode}
                        setFulfillment={setFulfillment}
                        setIsAddressListOpen={setIsAddressListOpen}
                     />
                  )}
                  {zipcode.isPickupActive && zipcode?.pickupOptionId && (
                     <FulfillmentOption
                        type="PICKUP"
                        state={state}
                        zipcode={zipcode}
                        setFulfillment={setFulfillment}
                     />
                  )}
               </section>
            )}
         </section>
         <Tunnel
            isOpen={isAddressListOpen}
            toggleTunnel={setIsAddressListOpen}
            style={{ zIndex: 1030 }}
         >
            <AddressList
               closeTunnel={() => setIsAddressListOpen(false)}
               onSelect={address =>
                  updateCart({
                     variables: {
                        id: state.occurenceCustomer?.cart?.id,
                        _set: { address },
                     },
                  }).then(() => {
                     addToast(t('Address updated for delivery!'), {
                        appearance: 'success',
                     })
                     setIsAddressListOpen(false)
                  })
               }
            />
         </Tunnel>
      </>
   )
}

export default Fulfillment

const FulfillmentOption = ({
   state,
   type,
   zipcode,
   user,
   setFulfillment,
   setIsAddressListOpen,
}) => {
   const { t } = useTranslation()
   const isActive = state.occurenceCustomer?.validStatus?.hasCart
      ? state.occurenceCustomer?.cart?.fulfillmentInfo?.type?.includes(type)
      : state?.fulfillment?.type?.includes(type)
   const fulfillmentClasses = classNames(
      'hern-cart-fulfillment__fulfillment-option',
      { 'hern-cart-fulfillment__fulfillment-option--active': isActive }
   )
   return (
      <section
         className={fulfillmentClasses}
         onClick={() => setFulfillment(type)}
      >
         <aside className="hern-cart-fulfillment__check-icon">
            <CheckIcon size={18} stroke="currentColor" active={isActive} />
         </aside>
         <main>
            {type === 'DELIVERY' && (
               <>
                  {zipcode.deliveryPrice === 0 ? (
                     <h3>{t('Free Delivery')}</h3>
                  ) : (
                     <h3>
                        <span>{t('Delivery at')}</span>
                        {formatCurrency(zipcode.deliveryPrice)}
                     </h3>
                  )}
                  <p className="hern-cart-fulfillment__delivery-details">
                     <span>{t('Your box will be delivered on')}</span>
                     <span>
                        {moment(state?.week?.fulfillmentDate).format('MMM D')}
                        &nbsp;<span>{t('between')}</span>
                        {zipcode?.deliveryTime?.from}
                        &nbsp;-&nbsp;
                        {zipcode?.deliveryTime?.to}
                     </span>
                     <span>{t('at')}</span>
                     <span>
                        {normalizeAddress(
                           state?.occurenceCustomer?.cart?.address ||
                              user?.defaultAddress
                        )}
                     </span>
                  </p>
               </>
            )}
            {type === 'PICKUP' && (
               <>
                  <h3>{t('Pick Up')}</h3>
                  <p className="hern-cart-fulfillment__pickup-details">
                     <span> {t('Pickup your box in between')} </span>
                     {moment(state?.week?.fulfillmentDate).format(
                        'MMM D'
                     )}, {zipcode?.pickupOption?.time?.from} -{' '}
                     {zipcode?.pickupOption?.time?.to} <span> {t('from')}</span>{' '}
                     {normalizeAddress(zipcode?.pickupOption?.address)}
                  </p>
               </>
            )}
         </main>
         {type === 'DELIVERY' && (
            <span
               className="hern-cart-fulfillment__change-btn"
               onClick={e => {
                  e.stopPropagation()
                  setIsAddressListOpen(true)
               }}
            >
               {t('Change')}
            </span>
         )}
      </section>
   )
}
