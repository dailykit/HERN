import React from 'react'
import { isEmpty } from 'lodash'
import { useMutation } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { useMenu } from '../../state'
import { useUser } from '../../../../context'
import { Tunnel } from '../../../../components'
import CardList from '../../../../components/card_list'
import { MUTATIONS, UPDATE_CART } from '../../../../graphql'
import classNames from 'classnames'

const PaymentCard = () => {
   const { state, dispatch } = useMenu()
   const { user } = useUser()
   const { addToast } = useToasts()
   const [card, setCard] = React.useState(null)

   const [isCardListOpen, setIsCardListOpen] = React.useState(false)

   const [updateOccurenceCustomer] = useMutation(
      MUTATIONS.OCCURENCE.CUSTOMER.UPDATE,
      { onError: error => console.log(error) }
   )
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
         }).then(({ data: { updateOccurenceCustomer = {} } = {} }) => {
            if (isSkipped !== updateOccurenceCustomer?.isSkipped) {
               addToast('This week has been unskipped', { appearance: 'info' })
            }
         })

         dispatch({ type: 'CART_STATE', payload: 'SAVED' })
      },
      onError: error => {
         dispatch({ type: 'CART_STATE', payload: 'SAVED' })
         console.log(error)
      },
   })

   React.useEffect(() => {
      if (state.occurenceCustomer?.cart?.paymentMethodId) {
         const index = user?.platform_customer?.paymentMethods.findIndex(
            pm =>
               pm.stripePaymentMethodId ===
               state.occurenceCustomer?.cart?.paymentMethodId
         )
         if (index !== -1) {
            setCard(user?.platform_customer?.paymentMethods[index])
         }
      }
   }, [state.occurenceCustomer])

   if (!state.occurenceCustomer?.cart?.paymentMethodId) return null
   const optionClasses = classNames('hern-cart-payment-card__option ', {
      'hern-cart-payment-card__option--active': card && !isEmpty(card),
   })
   return (
      <div>
         <section className="hern-cart-payment-card">
            <h4 className="hern-cart-payment-card__heading">Payment Card</h4>
            <section>
               <div className={optionClasses}>
                  {card && !isEmpty(card) ? (
                     <>
                        <main>
                           <p className="hern-cart-payment-card__card-holder-name">
                              {card?.cardHolderName}
                           </p>
                           <p>XXXX XXXX XXXX {card?.last4}</p>
                           <p>
                              {card?.expMonth}/{card?.expYear}
                           </p>
                           <p className="hern-cart-payment-card__card-brand">
                              {card?.brand}
                           </p>
                        </main>
                        <span
                           className="hern-cart-payment-card__change"
                           onClick={e => {
                              e.stopPropagation()
                              setIsCardListOpen(true)
                           }}
                        >
                           Change
                        </span>
                     </>
                  ) : (
                     <>
                        <p className="hern-cart-payment-card__not-available">
                           Your linked payment method has been deleted. Please
                           change the payment method to avoid inconvenience.
                        </p>
                        <button
                           className="hern-cart-payment-card__change-method-btn"
                           onClick={e => {
                              e.stopPropagation()
                              setIsCardListOpen(true)
                           }}
                        >
                           Change Payment Method
                        </button>
                     </>
                  )}
               </div>
            </section>
         </section>
         <Tunnel
            isOpen={isCardListOpen}
            toggleTunnel={setIsCardListOpen}
            style={{ zIndex: 1030 }}
         >
            <CardList
               closeTunnel={() => setIsCardListOpen(false)}
               onSelect={card =>
                  updateCart({
                     variables: {
                        id: state.occurenceCustomer?.cart?.id,
                        _set: { paymentMethodId: card.stripePaymentMethodId },
                     },
                  }).then(() => {
                     addToast('Payment card updated!', {
                        appearance: 'success',
                     })
                     setIsCardListOpen(false)
                  })
               }
            />
         </Tunnel>
      </div>
   )
}

export default PaymentCard
