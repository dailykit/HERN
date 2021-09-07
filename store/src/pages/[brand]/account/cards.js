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
import { useRouter } from 'next/router'
import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'

import {
   SEO,
   Layout,
   Button,
   Tunnel,
   Loader,
   HelperBar,
   ProfileSidebar,
} from '../../../components'
import { graphQLClient, useConfig } from '../../../lib'
import { getRoute, getSettings, get_env, isClient } from '../../../utils'
import { useUser } from '../../../context'
import { CloseIcon, DeleteIcon } from '../../../assets/icons'
import {
   BRAND,
   CREATE_STRIPE_PAYMENT_METHOD,
   DELETE_STRIPE_PAYMENT_METHOD,
   NAVIGATION_MENU,
   WEBSITE_PAGE,
} from '../../../graphql'

const ManageCards = props => {
   const router = useRouter()
   const { isAuthenticated, isLoading } = useUser()
   const { seo, settings, navigationMenus } = props
   React.useEffect(() => {
      if (!isAuthenticated && !isLoading) {
         isClient && localStorage.setItem('landed_on', location.href)
         router.push(getRoute('/get-started/register'))
      }
   }, [isAuthenticated, isLoading])

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO title="Manage Cards" />
         <Main>
            <ProfileSidebar />
            <Content />
         </Main>
      </Layout>
   )
}

export default ManageCards

const Content = () => {
   const { user } = useUser()
   console.log({ user })
   const { addToast } = useToasts()
   const { brand, configOf } = useConfig()
   const [tunnel, toggleTunnel] = React.useState(false)
   const [deleteStripePaymentMethod] = useMutation(
      DELETE_STRIPE_PAYMENT_METHOD,
      {
         onCompleted: () => {
            addToast('Successfully deleted the payment method.', {
               appearance: 'success',
            })
         },
         onError: () => {
            addToast('Failed to delete the payment method.', {
               appearance: 'error',
            })
         },
      }
   )
   const [updateBrandCustomer] = useMutation(BRAND.CUSTOMER.UPDATE, {
      onCompleted: () => {
         addToast('Successfully changed default payment method.', {
            appearance: 'success',
         })
      },
      onError: () => {
         addToast('Failed to change the default payment method.', {
            appearance: 'error',
         })
      },
   })

   const deletePaymentMethod = id => {
      if (user?.subscriptionPaymentMethodId === id) {
         addToast('Can not delete a default payment method!', {
            appearance: 'error',
         })
         return
      }
      deleteStripePaymentMethod({
         variables: { stripePaymentMethodId: id },
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
               subscriptionPaymentMethodId: method.stripePaymentMethodId,
            },
         },
      })
   }
   const theme = configOf('theme-color', 'Visual')

   return (
      <div tw="px-3">
         <header tw="mt-6 mb-3 flex items-center justify-between">
            <Title theme={theme}>Cards</Title>
            {user?.platform_customer?.paymentMethods.length > 0 && (
               <Button bg={theme?.accent} onClick={() => toggleTunnel(true)}>
                  Add Card
               </Button>
            )}
         </header>
         {isEmpty(user?.platform_customer) ? (
            <Loader inline />
         ) : (
            <>
               {user?.platform_customer?.paymentMethods.length > 0 ? (
                  <PaymentMethods>
                     {user?.platform_customer?.paymentMethods.map(method => (
                        <li
                           key={method.stripePaymentMethodId}
                           tw="flex border text-gray-700"
                        >
                           <section tw="p-2 w-full">
                              <header tw="mb-2 w-full flex justify-between items-center">
                                 {user.subscriptionPaymentMethodId ===
                                 method.stripePaymentMethodId ? (
                                    <span tw="rounded border bg-teal-200 border-teal-300 px-2 text-teal-700">
                                       Default
                                    </span>
                                 ) : (
                                    <button
                                       tw="mb-2 rounded border border-orange-300 px-2 text-teal-700 cursor-pointer hover:(bg-orange-300 text-orange-900)"
                                       onClick={() => makeDefault(method)}
                                    >
                                       Make Default
                                    </button>
                                 )}
                                 <button
                                    className="group"
                                    onClick={() =>
                                       deletePaymentMethod(
                                          method.stripePaymentMethodId
                                       )
                                    }
                                    tw="flex items-center justify-center border border-red-400 rounded h-6 w-6 hover:bg-red-400"
                                 >
                                    <DeleteIcon
                                       size={16}
                                       tw="stroke-current group-hover:text-white"
                                    />
                                 </button>
                              </header>
                              <div tw="flex items-center justify-between">
                                 <span tw="text-xl my-2">
                                    {method.cardHolderName}
                                 </span>
                                 <div tw="flex items-center">
                                    <span tw="font-medium">
                                       {method.expMonth}
                                    </span>
                                    &nbsp;/&nbsp;
                                    <span tw="font-medium">
                                       {method.expYear}
                                    </span>
                                 </div>
                              </div>
                              <span>
                                 <span tw="text-gray-500">Last 4:</span>{' '}
                                 {method.last4}
                              </span>
                           </section>
                        </li>
                     ))}
                  </PaymentMethods>
               ) : (
                  <HelperBar type="info">
                     <HelperBar.SubTitle>
                        Let's start with adding a card
                     </HelperBar.SubTitle>
                     <HelperBar.Button onClick={() => toggleTunnel(true)}>
                        Add Card
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
   const { organization } = useConfig()
   const [intent, setIntent] = React.useState(null)
   console.log('payment tunnel open')
   React.useEffect(() => {
      console.log('payment tunnel useEffect', user)
      if (user?.platform_customer?.stripeCustomerId && isClient) {
         ;(async () => {
            console.log('Calling createSetupIntent', {
               stripeCustomerId: user?.platform_customer?.stripeCustomerId,
               organization,
            })
            const intent = await createSetupIntent(
               user?.platform_customer?.stripeCustomerId,
               organization
            )
            setIntent(intent)
         })()
      }
   }, [user, organization])

   return (
      <Tunnel size="sm" isOpen={tunnel} toggleTunnel={toggleTunnel}>
         <Tunnel.Header title="Add Payment Method">
            <button
               onClick={() => toggleTunnel(false)}
               css={tw`border w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100`}
            >
               <CloseIcon size={20} tw="stroke-current text-green-800" />
            </button>
         </Tunnel.Header>
         <Tunnel.Body>
            <PaymentForm intent={intent} toggleTunnel={toggleTunnel} />
         </Tunnel.Body>
      </Tunnel>
   )
}

export const PaymentForm = ({ intent, toggleTunnel }) => {
   const { user } = useUser()
   const { brand, organization } = useConfig()
   const [updateBrandCustomer] = useMutation(BRAND.CUSTOMER.UPDATE, {
      onError: error => {
         console.error(error)
      },
   })
   const [createPaymentMethod] = useMutation(CREATE_STRIPE_PAYMENT_METHOD, {
      onError: error => {
         console.error(error)
      },
   })

   const handleResult = async ({ setupIntent }) => {
      try {
         if (setupIntent.status === 'succeeded') {
            const DATAHUB = isClient ? get_env('DATA_HUB_HTTPS') : ''
            let url = `https://dailyos-backend.ngrok.io/server/api/payment-method/${setupIntent.payment_method}`
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
                        keycloakId: user.keycloakId,
                        expYear: data.card.exp_year,
                        cvcCheck: data.card.cvc_check,
                        expMonth: data.card.exp_month,
                        stripePaymentMethodId: data.id,
                        cardHolderName: data.billing_details.name,
                        stripeCustomerId:
                           user.platform_customer?.stripeCustomerId,
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
               throw Error("Couldn't complete card setup, please try again")
            }
         } else {
            throw Error("Couldn't complete card setup, please try again")
         }
      } catch (error) {}
   }

   const stripePromise = loadStripe(isClient ? get_env('STRIPE_KEY') : '', {
      ...(organization.stripeAccountType === 'standard' &&
         organization.stripeAccountId && {
            stripeAccount: organization.stripeAccountId,
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
      <form onSubmit={handleSubmit}>
         <div tw="bg-gray-900 p-3 rounded-lg">
            <section className="mb-3">
               <label htmlFor="name" tw="block text-sm text-gray-500">
                  Card Holder Name
               </label>
               <input
                  type="text"
                  name="name"
                  value={name}
                  ref={inputRef}
                  placeholder="Enter card holder's name"
                  onChange={e => setName(e.target.value)}
                  tw="w-full bg-transparent border-b border-gray-800 h-10 text-white focus:outline-none"
               />
            </section>
            <CardSection setError={setError} />
         </div>
         <button
            disabled={!stripe || submitting}
            tw="mt-3 w-full h-10 bg-blue-600 text-sm py-1 text-white uppercase font-medium tracking-wider rounded"
         >
            {submitting ? 'Saving...' : 'Save'}
         </button>
         {error && <span tw="block text-red-500 mt-2">{error}</span>}
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
   return (
      <CardSectionWrapper>
         <span tw="block text-sm text-gray-500">Card Details</span>
         <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={({ error }) => setError(error?.message || '')}
         />
      </CardSectionWrapper>
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
      console.log({ customer, stripeAccountId })
      const DATAHUB = get_env('DATA_HUB_HTTPS')
      const url = `https://dailyos-backend.ngrok.io/server/api/setup-intent`
      const { data } = await axios.post(url, { customer, stripeAccountId })
      console.log({ data })
      return data.data
   } catch (error) {
      return error
   }
}
export const getStaticProps = async ({ params }) => {
   const client = await graphQLClient()
   const dataByRoute = await client.request(WEBSITE_PAGE, {
      domain: params.brand,
      route: '/account/cards',
   })
   // const domain =
   //    process.env.NODE_ENV === 'production'
   //       ? params.domain
   //       : 'test.dailykit.org'
   const domain = 'test.dailykit.org'
   const { seo, settings } = await getSettings(domain, '/account/cards')
   //navigation menu
   const navigationMenu = await client.request(NAVIGATION_MENU, {
      navigationMenuId:
         dataByRoute.website_websitePage[0]['website']['navigationMenuId'],
   })
   const navigationMenus = navigationMenu.website_navigationMenuItem
   return {
      props: {
         seo,
         settings,
         navigationMenus,
      },
      revalidate: 1,
   }
}
export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
const Main = styled.main`
   display: grid;
   grid-template-rows: 1fr;
   min-height: calc(100vh - 64px);
   grid-template-columns: 240px 1fr;
   @media (max-width: 768px) {
      display: block;
   }
`

const Title = styled.h2(
   ({ theme }) => css`
      ${tw`text-green-600 text-2xl`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const PaymentMethods = styled.ul`
   ${tw`
   grid
   gap-2
   sm:grid-cols-1
   md:grid-cols-2
   lg:grid-cols-3
`}
   grid-auto-rows: minmax(120px, auto);
`

const CardSectionWrapper = styled.div`
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
