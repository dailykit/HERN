import React from 'react'
import axios from 'axios'
import styled from 'styled-components'
import { loadStripe } from '@stripe/stripe-js'
import { useMutation } from '@apollo/react-hooks'
import { Flex, Tunnels, Tunnel, TunnelHeader } from '@dailykit/ui'
import {
   Elements,
   useStripe,
   useElements,
   CardElement,
} from '@stripe/react-stripe-js'

import { useManual } from '../../../state'
import { MUTATIONS } from '../../../../../../graphql'
import { InlineLoader } from '../../../../../../../../shared/components'
import { get_env } from '../../../../../../../../shared/utils'

const AddPaymentTunnel = ({ tunnels, closeTunnel, onSave }) => {
   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel size="sm">
            <Content onSave={onSave} closeTunnel={closeTunnel} />
         </Tunnel>
      </Tunnels>
   )
}

export default AddPaymentTunnel

const Content = ({ onSave, closeTunnel }) => {
   const { customer, organization } = useManual()
   const [intent, setIntent] = React.useState(null)
   React.useEffect(() => {
      if (customer?.paymentCustomerId) {
         ;(async () => {
            const intent = await createSetupIntent(
               customer?.paymentCustomerId,
               organization
            )
            setIntent(intent)
         })()
      }
   }, [customer, organization])
   return (
      <>
         <TunnelHeader title="Add Method" close={() => closeTunnel(1)} />
         <Flex padding="16px" overflowY="auto" height="calc(100vh - 196px)">
            {!intent ? (
               <InlineLoader />
            ) : (
               <FormWrapper
                  intent={intent}
                  onSave={onSave}
                  closeTunnel={closeTunnel}
               />
            )}
         </Flex>
      </>
   )
}

const FormWrapper = ({ intent, onSave, closeTunnel }) => {
   const { customer, brand, organization } = useManual()

   const [updateBrandCustomer] = useMutation(MUTATIONS.BRAND.CUSTOMER.UPDATE)
   const [createPaymentMethod] = useMutation(
      MUTATIONS.STRIPE.PAYMENT_METHOD.CREATE
   )
   const handleResult = async ({ setupIntent }) => {
      try {
         if (setupIntent.status === 'succeeded') {
            const DATAHUB = get_env('REACT_APP_DATA_HUB_URI')
            let url = `${new URL(DATAHUB).origin}/api/payment-method/${
               setupIntent.payment_method
            }`
            if (
               organization.stripeAccountType === 'standard' &&
               organization.stripeAccountId
            ) {
               url += `?accountId=${organization.stripeAccountId}`
            }
            const { data: { success, data = {} } = {} } = await axios.get(url)

            if (success) {
               await createPaymentMethod({
                  variables: {
                     object: {
                        last4: data.card.last4,
                        brand: data.card.brand,
                        country: data.card.country,
                        funding: data.card.funding,
                        keycloakId: customer?.keycloakId,
                        expYear: data.card.exp_year,
                        cvcCheck: data.card.cvc_check,
                        expMonth: data.card.exp_month,
                        customerPaymentMethodId: data.id,
                        cardHolderName: data.billing_details.name,
                        paymentCustomerId: customer?.paymentCustomerId,
                     },
                  },
               })
               if (!customer.subscriptionPaymentMethodId) {
                  await updateBrandCustomer({
                     variables: {
                        where: {
                           keycloakId: { _eq: customer.keycloakId },
                           brandId: { _eq: brand.id },
                        },
                        _set: { subscriptionPaymentMethodId: data.id },
                     },
                  })
               }
               onSave()
               closeTunnel(1)
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

   const stripePromise = loadStripe(organization.stripePublishableKey, {
      ...(organization.stripeAccountType === 'standard' &&
         organization.stripeAccountId && {
            stripeAccount: organization.stripeAccountId,
         }),
   })
   return (
      <Elements stripe={stripePromise}>
         <CardForm intent={intent} handleResult={handleResult} />
      </Elements>
   )
}

const createSetupIntent = async (customer, organization = {}) => {
   try {
      let stripeAccountId = null
      if (
         organization?.stripeAccountType === 'standard' &&
         organization?.stripeAccountId
      ) {
         stripeAccountId = organization?.stripeAccountId
      }

      const DATAHUB = get_env('REACT_APP_DATA_HUB_URI')
      const url = `${new URL(DATAHUB).origin}/api/setup-intent`
      const { data } = await axios.post(url, { customer, stripeAccountId })
      return data.data
   } catch (error) {
      return error
   }
}

const CardForm = ({ intent, handleResult }) => {
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
         <Styles.CardWrapper>
            <section>
               <label htmlFor="name">Card Holder Name</label>
               <input
                  type="text"
                  name="name"
                  value={name}
                  ref={inputRef}
                  placeholder="Enter card holder's name"
                  onChange={e => setName(e.target.value)}
               />
            </section>
            <CardSection />
         </Styles.CardWrapper>
         <Styles.CardSubmitButton disabled={!stripe || submitting}>
            {submitting ? 'Saving...' : 'Save'}
         </Styles.CardSubmitButton>
         {error && <Styles.Error>{error}</Styles.Error>}
      </form>
   )
}

const CARD_ELEMENT_OPTIONS = {
   style: {
      base: {
         color: '#fff',
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
         <span>Card Details</span>
         <CardElement options={CARD_ELEMENT_OPTIONS} />
      </CardSectionWrapper>
   )
}

const Styles = {
   CardWrapper: styled.div`
      padding: 12px;
      border-radius: 8px;
      background: #111827;
      > section {
         margin-bottom: 12px;
         > label {
            display: block;
            font-size: 14px;
            color: #6b7280;
         }
         > input {
            width: 100%;
            height: 40px;
            border: none;
            color: #fff;
            background: transparent;
            border-bottom: 1px solid #1f2937;
            &:focus {
               outline: none;
            }
         }
      }
   `,
   CardSubmitButton: styled.button`
      border: none;
      width: 100%;
      height: 40px;
      color: #fff;
      font-size: 14px;
      margin-top: 12px;
      border-radius: 2px;
      font-weight: medium;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      background-color: #2563eb;
      [disabled] {
         cursor: not-allowed;
      }
   `,
   Error: styled.span`
      display: block;
      color: #ef4444;
      margin-top: 8px;
   `,
}

const CardSectionWrapper = styled.div`
   > span {
      display: block;
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 4px;
   }
   .StripeElement {
      height: 40px;
      width: 100%;
      color: #fff;
      padding: 10px 0;
      background-color: #1a202c;
      border-bottom: 1px solid #2d3748;
   }
   .StripeElement--invalid {
      border-color: #fa755a;
   }
   .StripeElement--webkit-autofill {
      background-color: #fefde5 !important;
   }
`
