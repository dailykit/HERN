import React from 'react'
import axios from 'axios'
import tw, { styled } from 'twin.macro'
import { loadStripe } from '@stripe/stripe-js'
import { useMutation } from '@apollo/react-hooks'
import {
   Elements,
   useStripe,
   useElements,
   CardElement,
} from '@stripe/react-stripe-js'

import { useConfig, usePayment } from '../../../../lib'
import { get_env, isClient } from '../../../../utils'
import { useUser } from '../../../../context'
import { HelperBar } from '../../../helper_bar'
import { Loader } from '../../../loader'
import { BRAND, CREATE_CUSTOMER_PAYMENT_METHOD } from '../../../../graphql'
import { isConnectedIntegration } from '../../../../utils'
const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const CardForm = ({ intent }) => {
   const { user, dispatch: userDispatch } = useUser()
   const { setPaymentInfo } = usePayment()
   const { brand } = useConfig()
   const STRIPE_ACCOUNT_ID = get_env('STRIPE_ACCOUNT_ID')
   const isConnected = isConnectedIntegration()
   const [updateBrandCustomer] = useMutation(BRAND.CUSTOMER.UPDATE, {
      onError: error => console.error(error),
   })
   const [createCustomerPaymentMethod] = useMutation(
      CREATE_CUSTOMER_PAYMENT_METHOD,
      {
         onCompleted: ({ paymentMethod }) => {
            console.log('paymentMethod', paymentMethod)
            userDispatch({
               type: 'SET_PAYMENT_METHOD',
               payload: paymentMethod,
            })
         },
         onError: error => console.error(error),
      }
   )

   const handleResult = async ({ setupIntent }) => {
      try {
         if (setupIntent.status === 'succeeded') {
            const origin = isClient ? window.location.origin : ''
            const url = `${origin}/server/api/payment/payment-method/${setupIntent.payment_method}`
            const { data: { success, data = {} } = {} } = await axios.get(url)

            if (success) {
               await createCustomerPaymentMethod({
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
                           user.platform_customer?.paymentCustomerId,
                     },
                  },
               })
               if (!user.subscriptionPaymentMethodId) {
                  await updateBrandCustomer({
                     variables: {
                        where: {
                           keycloakId: { _eq: user.keycloakId },
                           brandId: { _eq: brand.id },
                        },
                        _set: { subscriptionPaymentMethodId: data.id },
                     },
                  })
               }

               // fb pixel  event for adding a card
               ReactPixel.track('AddPaymentInfo', {
                  cardHolderName: data.billing_details.name,
                  brand: data.card.brand,
               })

               setPaymentInfo({
                  tunnel: {
                     isVisible: false,
                  },
               })
            } else {
               throw "Couldn't complete card setup, please try again"
            }
         } else {
            throw "Couldn't complete card setup, please try again"
         }
      } catch (error) {
         console.log(error)
      }
   }
   const stripePromise = loadStripe(isClient ? get_env('STRIPE_KEY') : '', {
      ...(isConnected && {
         stripeAccount: STRIPE_ACCOUNT_ID,
      }),
   })

   if (!intent)
      return (
         <div>
            <HelperBar type="warning">
               <HelperBar.SubTitle>
                  Your account is not linked with Stripe.
               </HelperBar.SubTitle>
            </HelperBar>
         </div>
      )
   return (
      <div>
         <Elements stripe={stripePromise}>
            <CardSetupForm intent={intent} handleResult={handleResult} />
         </Elements>
      </div>
   )
}

const CardSetupForm = ({ intent, handleResult }) => {
   console.log('CardSetupForm', intent)
   const stripe = useStripe()
   const elements = useElements()
   const inputRef = React.useRef(null)
   const [name, setName] = React.useState('')
   const [error, setError] = React.useState('')
   const [submitting, setSubmitting] = React.useState(false)

   React.useEffect(() => {
      inputRef.current.focus()
   }, [])

   const handleSubmit = async event => {
      setError('')
      setSubmitting(true)
      event.preventDefault()

      if (!stripe || !elements) {
         return
      }
      const result = await stripe.confirmCardSetup(intent.client_secret, {
         payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
               name,
            },
         },
      })
      if (result.error) {
         setSubmitting(false)
         setError(result.error.message)
      } else {
         handleResult(result)
         setError('')
      }
   }

   return (
      <form onSubmit={handleSubmit}>
         <div tw="bg-white p-3 rounded-lg">
            <section tw="mb-4">
               <label
                  htmlFor="name"
                  tw="block text-sm text-gray-500 mb-2 font-semibold"
               >
                  Card Holder Name
               </label>
               <input
                  type="text"
                  name="name"
                  value={name}
                  ref={inputRef}
                  placeholder="Enter card holder's name"
                  onChange={e => setName(e.target.value)}
                  tw="w-full background[#F3F3F3] border-radius[8px] p-4 color[#8e9ead] focus:outline-none"
               />
            </section>
            <CardSection />
         </div>
         <button
            disabled={!stripe || submitting}
            css={[
               tw`mt-3 w-full h-10 background[rgb(56, 161, 105)] text-sm py-1 text-white uppercase font-medium tracking-wider rounded`,
               submitting && tw`cursor-not-allowed`,
            ]}
         >
            {submitting ? 'Saving...' : 'Save Card'}
         </button>
         {error && <span tw="block text-red-500 mt-2">{error}</span>}
      </form>
   )
}

const CARD_ELEMENT_OPTIONS = {
   style: {
      base: {
         color: '#8e9ead',
         fontSize: '16px',
         '::placeholder': {
            color: '#aab7c4',
         },
      },
      invalid: {
         color: '#fa755a',
         iconColor: '#fa755a',
      },
   },
}

const CardSection = () => {
   return (
      <CardSectionWrapper>
         <span tw="block text-sm text-gray-500 font-semibold mb-2">
            Card Details
         </span>
         <CardElement options={CARD_ELEMENT_OPTIONS} />
      </CardSectionWrapper>
   )
}

const CardSectionWrapper = styled.div`
   .StripeElement {
      width: 100%;
      color: #8e9ead;
      padding: 1rem;
      background-color: #f3f3f3;
      border-radius: 8px;
   }

   .StripeElement--invalid {
      border-color: #fa755a;
   }

   .StripeElement--webkit-autofill {
      background-color: #fefde5 !important;
   }
`
