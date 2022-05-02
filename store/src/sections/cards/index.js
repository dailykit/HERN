import React from 'react'
import axios from 'axios'
import { loadStripe } from '@stripe/stripe-js'
import { useMutation } from '@apollo/react-hooks'
import {
   Elements,
   useStripe,
   useElements,
   CardElement,
} from '@stripe/react-stripe-js'
import { isEmpty } from 'lodash'
import { useToasts } from 'react-toast-notifications'

import {
   Button,
   Tunnel,
   Loader,
   HelperBar,
   ProfileSidebar,
} from '../../components'
import { useConfig } from '../../lib'
import { get_env, isClient, isConnectedIntegration } from '../../utils'
import { useTranslation, useUser } from '../../context'
import { CloseIcon, DeleteIcon } from '../../assets/icons'
import {
   BRAND,
   CREATE_CUSTOMER_PAYMENT_METHOD,
   DELETE_STRIPE_PAYMENT_METHOD,
} from '../../graphql'

export const ManageCards = () => {
   return (
      <main className="hern-cards__main">
         <ProfileSidebar />
         <Content />
      </main>
   )
}

const Content = () => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const { t } = useTranslation()
   const { brand, configOf } = useConfig()
   const [tunnel, toggleTunnel] = React.useState(false)
   const [deleteStripePaymentMethod] = useMutation(
      DELETE_STRIPE_PAYMENT_METHOD,
      {
         onCompleted: () => {
            addToast(t('Successfully deleted the payment method.'), {
               appearance: 'success',
            })
         },
         onError: () => {
            addToast(t('Failed to delete the payment method.'), {
               appearance: 'error',
            })
         },
      }
   )
   const [updateBrandCustomer] = useMutation(BRAND.CUSTOMER.UPDATE, {
      onCompleted: () => {
         addToast(t('Successfully changed default payment method.'), {
            appearance: 'success',
         })
      },
      onError: () => {
         addToast(t('Failed to change the default payment method.'), {
            appearance: 'error',
         })
      },
   })

   const deletePaymentMethod = id => {
      if (user?.subscriptionPaymentMethodId === id) {
         addToast(t('Can not delete a default payment method!'), {
            appearance: 'error',
         })
         return
      }
      deleteStripePaymentMethod({
         variables: { paymentMethodId: id },
      })
   }

   const makeDefault = method => {
      updateBrandCustomer({
         variables: {
            where: {
               keycloakId: {
                  _eq: user?.keycloakId,
               },
               brandId: {
                  _eq: brand.id,
               },
            },
            _set: {
               subscriptionPaymentMethodId: method.paymentMethodId,
            },
         },
      })
   }
   const theme = configOf('theme-color', 'Visual')

   return (
      <div className="hern-cards__content">
         <header className="hern-cards__header">
            <h2
               className="hern-cards__header__title"
               style={{
                  color: `${theme?.accent ? theme?.accent : 'rgba(5,150,105,1)'
                     }`,
               }}
            >
               {t('Cards')}
            </h2>
            {user?.platform_customer?.paymentMethods.length > 0 && (
               <Button bg={theme?.accent} onClick={() => toggleTunnel(true)}>
                  {t('Add Card')}
               </Button>
            )}
         </header>
         {isEmpty(user?.platform_customer) ? (
            <Loader inline />
         ) : (
            <>
               {user?.platform_customer?.paymentMethods.length > 0 ? (
                  <ul className="hern-cards__card-list">
                     {user?.platform_customer?.paymentMethods.map(method => (
                        <li
                           key={method.paymentMethodId}
                           className="hern-cards__card-list-item"
                        >
                           <section className="hern-cards__card">
                              <header className="hern-cards__card__header">
                                 {user.subscriptionPaymentMethodId ===
                                    method.paymentMethodId ? (
                                    <span className="hern-cards__card__default-tag">
                                       {t('Default')}
                                    </span>
                                 ) : (
                                    <button
                                       className="hern-cards__card__makedefault-btn"
                                       onClick={() => makeDefault(method)}
                                    >
                                       {t('Make Default')}
                                    </button>
                                 )}
                                 <button
                                    className="hern-cards__card__delete-btn group"
                                    onClick={() =>
                                       deletePaymentMethod(
                                          method.paymentMethodId
                                       )
                                    }
                                 >
                                    <DeleteIcon size={16} />
                                 </button>
                              </header>
                              <div className="hern-cards__card__body">
                                 <span className="hern-cards__card__name">
                                    {method.cardHolderName}
                                 </span>
                                 <div className="hern-cards__card__exp">
                                    <span className="hern-cards__card__exp-month">
                                       {method.expMonth}
                                    </span>
                                    &nbsp;/&nbsp;
                                    <span className="hern-cards__card__exp-year">
                                       {method.expYear}
                                    </span>
                                 </div>
                              </div>
                              <span className="hern-cards__card__last-4">
                                 <span>{t("Last 4:")}</span>
                                 {method.last4}
                              </span>
                           </section>
                        </li>
                     ))}
                  </ul>
               ) : (
                  <HelperBar type="info">
                     <HelperBar.SubTitle>
                        {t("Let's start with adding a card")}
                     </HelperBar.SubTitle>
                     <HelperBar.Button onClick={() => toggleTunnel(true)}>
                        {t('Add Card')}
                     </HelperBar.Button>
                  </HelperBar>
               )}
            </>
         )}
         {tunnel && (
            <PaymentTunnel tunnel={tunnel} toggleTunnel={toggleTunnel} />
         )}
      </div>
   )
}

export const PaymentTunnel = ({ tunnel, toggleTunnel }) => {
   const { user } = useUser()
   const [intent, setIntent] = React.useState(null)
   const { t } = useTranslation()
   React.useEffect(() => {
      if (user?.platform_customer?.paymentCustomerId && isClient) {
         ; (async () => {
            const setup_intent = await createSetupIntent(
               user?.platform_customer?.paymentCustomerId
            )
            setIntent(setup_intent)
         })()
      }
   }, [user])

   return (
      <Tunnel.Wrapper size="sm" isOpen={tunnel} toggleTunnel={toggleTunnel}>
         <Tunnel.Header title={t("Add Payment Method")}>
            <button
               onClick={() => toggleTunnel(false)}
               className="hern-cards__payment-tunnel__close-btn"
            >
               <CloseIcon size={20} />
            </button>
         </Tunnel.Header>
         <Tunnel.Body>
            <PaymentForm intent={intent} toggleTunnel={toggleTunnel} />
         </Tunnel.Body>
      </Tunnel.Wrapper>
   )
}

export const PaymentForm = ({ intent, toggleTunnel }) => {
   const { user } = useUser()
   const { brand } = useConfig()
   const { t } = useTranslation()
   const STRIPE_ACCOUNT_ID = get_env('STRIPE_ACCOUNT_ID')
   const isConnected = isConnectedIntegration()
   const [updateBrandCustomer] = useMutation(BRAND.CUSTOMER.UPDATE, {
      onError: error => {
         console.error(error)
      },
   })
   const [createCustomerPaymentMethod] = useMutation(
      CREATE_CUSTOMER_PAYMENT_METHOD,
      {
         onError: error => {
            console.error(error)
         },
      }
   )

   const handleResult = async ({ setupIntent }) => {
      try {
         if (setupIntent.status === 'succeeded') {
            const origin = isClient ? get_env('BASE_BRAND_URL') : ''
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
                           keycloakId: {
                              _eq: user.keycloakId,
                           },
                           brandId: {
                              _eq: brand.id,
                           },
                        },
                        _set: {
                           subscriptionPaymentMethodId: data.id,
                        },
                     },
                  })
               }

               toggleTunnel(false)
            } else {
               throw Error(t("Couldn't complete card setup, please try again"))
            }
         } else {
            throw Error(t("Couldn't complete card setup, please try again"))
         }
      } catch (error) { }
   }

   const stripePromise = loadStripe(isClient ? get_env('STRIPE_KEY') : '', {
      ...(isConnected && {
         stripeAccount: STRIPE_ACCOUNT_ID,
      }),
   })

   if (!intent) return <Loader inline />
   return (
      <div>
         <Elements stripe={stripePromise}>
            <CardSetupForm intent={intent} handleResult={handleResult} />
         </Elements>
      </div>
   )
}

const CardSetupForm = ({ intent, handleResult }) => {
   const stripe = useStripe()
   const elements = useElements()
   const { t } = useTranslation()
   const inputRef = React.useRef(null)
   const [name, setName] = React.useState('')
   const [error, setError] = React.useState('')
   const [submitting, setSubmitting] = React.useState(false)

   React.useEffect(() => {
      inputRef.current.focus()
   }, [])

   const handleSubmit = async event => {
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
      }
   }

   return (
      <form onSubmit={handleSubmit} className="hern-cards__setup-form">
         <div className="hern-cards__setup-form__body">
            <section className="hern-cards__setup-form__card-holder-name">
               <label
                  className="hern-cards__setup-form__card-holder-name__label"
                  htmlFor="name"
               >
                  {t('Card Holder Name')}
               </label>
               <input
                  className="hern-cards__setup-form__card-holder-name__input"
                  type="text"
                  name="name"
                  value={name}
                  ref={inputRef}
                  placeholder="Enter card holder's name"
                  onChange={e => setName(e.target.value)}
               />
            </section>
            <CardSection setError={setError} />
         </div>
         <button
            className="hern-cards__setup-form__submit-btn"
            disabled={!stripe || submitting}
         >
            {submitting ? t('Saving...') : t('Save')}
         </button>
         {error && (
            <span className="hern-cards__setup-form__error">{error}</span>
         )}
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

const CardSection = ({ setError }) => {
   const { t } = useTranslation()
   return (
      <div className="hern-cards__payment-tunnel__card-section">
         <h6 className="hern-cards__payment-tunnel__card-section__heading">
            {t('Card Details')}
         </h6>
         <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={({ error }) => setError(error?.message || '')}
         />
      </div>
   )
}

const createSetupIntent = async customer => {
   try {
      const origin = isClient ? get_env('BASE_BRAND_URL') : ''
      const url = `${origin}/server/api/payment/setup-intent`
      const { data } = await axios.post(url, { customer })
      return data.data
   } catch (error) {
      return error
   }
}
