import React from 'react'
import axios from 'axios'
import { loadStripe } from '@stripe/stripe-js'
import { useMutation } from '@apollo/client'
import { Elements } from '@stripe/react-stripe-js'
import { Wrapper } from './styles'
import PaymentCardForm from './components/PaymentCardForm'
import { useAuth } from '../../Providers'
import { InlineLoader } from '../../components'
import { isClient } from '../../utils'
import { CREATE_STRIPE_PAYMENT_METHOD } from '../../graphql'

export default function PaymentForm({ intent, type = 'tunnel' }) {
   const { state, togglePaymentModal } = useAuth()
   const { user, organization } = state

   const stripePromise = loadStripe(
      (process.browser && window?._env_?.STRIPE_KEY) || process.env.STRIPE_KEY,
      {
         ...(organization.stripeAccountType === 'standard' &&
            organization?.stripeAccountId && {
               stripeAccount: organization.stripeAccountId
            })
      }
   )

   const [createPaymentMethod] = useMutation(CREATE_STRIPE_PAYMENT_METHOD, {
      refetchQueries: ['CUSTOMER_DETAILS']
   })
   const handleResult = async ({ setupIntent }) => {
      try {
         console.log(setupIntent)
         if (setupIntent.status === 'succeeded') {
            console.log(setupIntent)
            const ORIGIN = isClient
               ? (process.browser &&
                    window?._env_?.NEXT_PUBLIC_PAYMENTS_API_URL) ||
                 process.env.NEXT_PUBLIC_PAYMENTS_API_URL
               : ''
            let URL = `${ORIGIN}/api/payment-method/${setupIntent.payment_method}`
            console.log(URL)
            if (
               organization.stripeAccountType === 'standard' &&
               organization?.stripeAccountId
            ) {
               URL += `?accountId=${organization.stripeAccountId}`
            }
            const { data: { success, data = {} } = {} } = await axios.get(URL)
            console.log(data)

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
                        stripePaymentMethodId: data.id,
                        cardHolderName: data.billing_details.name,
                        organizationStripeCustomerId:
                           user.CustomerByClients[0]
                              ?.organizationStripeCustomerId
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
