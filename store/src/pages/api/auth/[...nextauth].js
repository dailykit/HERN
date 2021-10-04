import { gql } from '@apollo/client'
import bcrypt from 'bcrypt'
import { get } from 'lodash'
import NextAuth from 'next-auth'
import { graphqlClient } from '../../../lib'
import Providers from 'next-auth/providers'

const auth = {
   credentials: {
      id: 'email_password',
      name: 'Credentials',
      credentials: {
         email: { label: 'Email', type: 'text' },
         password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
         try {
            const client = await graphqlClient()
            const {
               data: { customers = [] }
            } = await client.query({
               query: CUSTOMERS,
               variables: {
                  where: { email: { _eq: credentials.email } }
               }
            })

            // console.log('next-auth', { customers })

            if (customers.length > 0) {
               const [customer] = customers
               const matches = await bcrypt.compare(
                  credentials.password,
                  customer.password
               )
               if (matches) {
                  return customer
               }
               return null
            }

            return null
         } catch (error) {
            console.error(error)
            return null
         }
      }
   },
   otp: {
      id: 'otp',
      name: 'OTP',
      credentials: {
         phone: { label: 'Phone Number', type: 'text' },
         otp: { label: 'OTP', type: 'text' }
      },
      async authorize(credentials) {
         try {
            const client = await graphqlClient()
            const {
               data: { otps = [] }
            } = await client.query({
               query: OTPS,
               variables: {
                  where: { phoneNumber: { _eq: credentials.phone } }
               }
            })

            // console.log('next-auth', { otps })

            if (otps.length > 0) {
               const [otp] = otps
               if (Number(credentials.otp) === otp.code) {
                  const {
                     data: { platform_customer = [] }
                  } = await client.query({
                     query: PLATFORM_CUSTOMER,
                     variables: {
                        where: { phoneNumber: { _eq: credentials.phone } }
                     }
                  })
                  // console.log('next-auth', { platform_customer })
                  if (platform_customer.length > 0) {
                     const [customer] = platform_customer
                     return customer
                  } else {
                     const {
                        data: { insertCustomer = {} }
                     } = await client.mutate({
                        mutation: INSERT_CUSTOMER,
                        variables: {
                           object: {
                              ...(credentials.email && {
                                 email: credentials.email
                              }),
                              phoneNumber: credentials.phone
                           }
                        }
                     })
                     return insertCustomer
                  }
               }
               return null
            }

            return null
         } catch (error) {
            console.error(error)
            return null
         }
      }
   }
}

let providers = []

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
   if (providers.length === 0) {
      providers.push(Providers.Credentials(auth.credentials))
      providers.push(Providers.Credentials(auth.otp))
      const client = await graphqlClient()
      const { data } = await client.query({ query: PROVIDERS })
      // console.log('next-auth', { providerData: data.providers })
      if (data.providers.length > 0) {
         data.providers.forEach(provider => {
            if (provider.title === 'google') {
               providers.push(Providers.Google(provider.value))
            }
         })
      }
   }

   return NextAuth(req, res, {
      providers,
      pages: { signIn: '/login' },
      callbacks: {
         async signIn(user, account) {
            try {
               // console.log('from sigin callback', { user, account })
               const client = await graphqlClient()
               const {
                  data: { provider_customers = [] }
               } = await client.query({
                  query: PROVIDER_CUSTOMERS,
                  variables: {
                     where: { providerAccountId: { _eq: user.id } }
                  }
               })

               // console.log('next-auth', { provider_customers })

               if (provider_customers.length > 0) {
                  return true
               }

               let customer = {}
               if (account.type === 'oauth') {
                  // console.log('next-auth', { user })
                  const name = user.name.split(' ')
                  const {
                     0: firstName = '',
                     [name.length - 1]: lastName = ''
                  } = name
                  customer.firstName = firstName
                  customer.lastName = lastName
                  customer.email = user.email
                  customer.avatar = user.image
               }

               await client.mutate({
                  mutation: INSERT_PROVIDER_CUSTOMER,
                  variables: {
                     object: {
                        providerType: account.type,
                        providerAccountId: user.id || null,
                        provider:
                           account.provider || account.id || 'credentials',
                        ...(account.type === 'credentials' && {
                           customerId: user.id
                        }),

                        ...(Object.keys(customer).length > 0 && {
                           customer: {
                              data: customer,
                              on_conflict: {
                                 update_columns: [],
                                 constraint: 'customer__email_key'
                              }
                           }
                        })
                     }
                  }
               })
               return true
            } catch (error) {
               console.error(error)
               return false
            }
         },
         async session(session, token) {
            const id = get(token, 'sub')
            const client = await graphqlClient()
            const {
               data: { provider_customers = [] }
            } = await client.query({
               query: PROVIDER_CUSTOMERS,
               variables: {
                  where: {
                     _or: [
                        { providerAccountId: { _eq: id } },
                        { customerId: { _eq: id } }
                     ]
                  }
               }
            })
            // console.log('next-auth', {
            //    sessionProviderCustomer: provider_customers
            // })
            if (provider_customers.length > 0) {
               const [customer] = provider_customers
               session.user.email = customer.customer.email
               session.user.id = customer.customerId
            }
            return session
         }
      }
   })
}

const OTPS = gql`
   query otps($where: platform_otp_transaction_bool_exp = {}) {
      otps: platform_otp_transaction(
         where: $where
         order_by: { created_at: desc }
      ) {
         id
         code
      }
   }
`

const INSERT_PROVIDER_CUSTOMER = gql`
   mutation insertProviderCustomer(
      $object: platform_provider_customer_insert_input!
   ) {
      insertProviderCustomer: insert_platform_provider_customer_one(
         on_conflict: { constraint: provider_customer_pkey, update_columns: [] }
         object: $object
      ) {
         id
      }
   }
`
const PROVIDERS = gql`
   query providers {
      providers: settings_authProvider {
         title
         value
      }
   }
`

const CUSTOMERS = gql`
   query customers($where: platform_customer_bool_exp = {}) {
      customers: platform_customer(where: $where) {
         email
         password
         fullName
         id: keycloakId
      }
   }
`

const INSERT_CUSTOMER = gql`
   mutation insertCustomer($object: platform_customer_insert_input!) {
      insertCustomer: insert_platform_customer_one(object: $object) {
         id: keycloakId
      }
   }
`

const PLATFORM_CUSTOMER = gql`
   query platform_customer($where: platform_customer_bool_exp = {}) {
      platform_customer: platform_customer(where: $where) {
         id: keycloakId
      }
   }
`

const PROVIDER_CUSTOMERS = gql`
   query provider_customers($where: platform_provider_customer_bool_exp = {}) {
      provider_customers: platform_provider_customer(where: $where) {
         id
         customerId
         customer {
            email
         }
      }
   }
`
