import React from 'react'
import axios from 'axios'
import { loadStripe } from '@stripe/stripe-js'
import { useMutation } from '@apollo/client'
import { Elements } from '@stripe/react-stripe-js'
import { Wrapper } from './styles'
import PaymentCardForm from './components/PaymentCardForm'
import { useUser } from '../../Providers'
import { InlineLoader } from '../../components'
import { isClient, get_env, isConnectedIntegration } from '../../utils'
import { CREATE_STRIPE_PAYMENT_METHOD } from '../../graphql'

export default function PaymentForm({ intent, type = 'tunnel' }) {
   const { state, togglePaymentModal } = useUser()
   const { user, organization } = state
   const STRIPE_KEY = get_env('STRIPE_KEY')
   const STRIPE_ACCOUNT_ID = get_env('STRIPE_ACCOUNT_ID')
   const isConnected = isConnectedIntegration()
   const stripePromise = loadStripe(isClient ? STRIPE_KEY : '', {
      ...(isConnected && {
         stripeAccount: STRIPE_ACCOUNT_ID
      })
   })

   const [createPaymentMethod] = useMutation(CREATE_STRIPE_PAYMENT_METHOD, {
      refetchQueries: ['CUSTOMER_DETAILS']
   })
   const handleResult = async ({ setupIntent }) => {
      try {
         console.log(setupIntent)
         if (setupIntent.status === 'succeeded') {
            const origin = isClient ? window.location.origin : ''
            const url = `${origin}/server/api/payment/payment-method/${setupIntent.payment_method}`

            const { data: { success, data = {} } = {} } = await axios.get(url)

            if (success) {
               await createPaymentMethod({
                  variables: {
                     object: {
                        last4: data.card.last4,
                        brand: data.card.brand,
                        country: data.card.country,
                        funding: data.card.funding,
                        keycloakId: user.keycloakId,
                        expYear: data.card.exp_year,
                        cvcCheck: data.card.cvc_check,
                        expMonth: data.card.exp_month,
                        paymentMethodId: data.id,
                        cardHolderName: data.billing_details.name,
                        paymentCustomerId:
                           user.platform_customer?.paymentCustomerId
                     }
                  }
               })

               togglePaymentModal(false)
            } else {
               throw new Error("Couldn't complete card setup, please try again")
            }
         } else {
            throw new Error("Couldn't complete card setup, please try again")
         }
      } catch (error) {
         console.log(error)
      }
   }

   if (!intent) return <InlineLoader />
   return (
      <Wrapper>
         <Elements stripe={stripePromise}>
            <PaymentCardForm
               intent={intent}
               handleResult={handleResult}
               type={type}
            />
         </Elements>
      </Wrapper>
   )
}
