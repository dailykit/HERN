import fs from 'fs'
import bcrypt from 'bcrypt'
import { get } from 'lodash'
import NextAuth from 'next-auth'
import { GraphQLClient } from 'graphql-request'
import Providers from 'next-auth/providers'
import { getRoute, get_env } from '../../../utils'

const client = async () => {
   try {
      const content = await fs.readFileSync(
         process.cwd() + '/public/env-config.js',
         'utf-8'
      )
      const config = JSON.parse(content.replace('window._env_ = ', ''))

      return new GraphQLClient(config['DATA_HUB_HTTPS'], {
         headers: {
            'x-hasura-admin-secret': config['ADMIN_SECRET'],
         },
      })
   } catch (error) {
      console.error('error', error)
   }
}

const auth = {
   credentials: {
      id: 'email_password',
      name: 'Credentials',
      credentials: {
         email: { label: 'Email', type: 'text' },
         password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
         try {
            const _client = await client()
            const { customers = [] } = await _client.request(CUSTOMERS, {
               where: { email: { _eq: credentials.email } },
            })

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
      },
   },
   otp: {
      id: 'otp',
      name: 'OTP',
      credentials: {
         phone: { label: 'Phone Number', type: 'text' },
         otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
         try {
            const _client = await client()
            const { otps = [] } = await _client.request(OTPS, {
               where: { phoneNumber: { _eq: credentials.phone } },
            })

            if (otps.length > 0) {
               const [otp] = otps
               if (Number(credentials.otp) === otp.code) {
                  const { platform_customer = [] } = await _client.request(
                     PLATFORM_CUSTOMER,
                     {
                        where: { phoneNumber: { _eq: credentials.phone } },
                     }
                  )
                  if (platform_customer.length > 0) {
                     const [customer] = platform_customer
                     return customer
                  } else {
                     const { insertCustomer = {} } = await _client.request(
                        INSERT_CUSTOMER,
                        {
                           object: {
                              ...(credentials.email && {
                                 email: credentials.email,
                              }),
                              phoneNumber: credentials.phone,
                           },
                        }
                     )
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
      },
   },
}

let providers = []

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
   if (providers.length === 0) {
      providers.push(Providers.Credentials(auth.credentials))
      providers.push(Providers.Credentials(auth.otp))

      const _client = await client()
      const data = await _client.request(PROVIDERS)

      if (data.providers.length > 0) {
         data.providers.forEach(provider => {
            if (provider.title === 'google') {
               providers.push(Providers.Google(provider.value))
            }
            if (provider.title === 'facebook') {
               providers.push(Providers.Facebook(provider.value))
            }
         })
      }
   }

   return NextAuth(req, res, {
      providers,
      pages: { signIn: getRoute('/login') },
      callbacks: {
         async signIn(user, account) {
            try {
               const _client = await client()

               const { provider_customers = [] } = await _client.request(
                  PROVIDER_CUSTOMERS,
                  {
                     where: { providerAccountId: { _eq: user.id } },
                  }
               )

               if (provider_customers.length > 0) {
                  return true
               }

               let customer = {}
               if (account.type === 'oauth') {
                  const name = user.name.split(' ')
                  const {
                     0: firstName = '',
                     [name.length - 1]: lastName = '',
                  } = name
                  customer.firstName = firstName
                  customer.lastName = lastName
                  customer.email = user.email
                  customer.avatar = user.image
               }

               await _client.request(INSERT_PROVIDER_CUSTOMER, {
                  object: {
                     providerType: account.type,
                     providerAccountId: user.id || null,
                     provider: account.provider || account.id || 'credentials',
                     ...(account.type === 'credentials' && {
                        customerId: user.id,
                     }),

                     ...(Object.keys(customer).length > 0 && {
                        customer: {
                           data: customer,
                           on_conflict: {
                              update_columns: [],
                              constraint: 'customer__email_key',
                           },
                        },
                     }),
                  },
               })
               return true
            } catch (error) {
               console.error(error)
               return false
            }
         },
         async session(session, token) {
            const id = get(token, 'sub')
            const _client = await client()
            const { provider_customers = [] } = await _client.request(
               PROVIDER_CUSTOMERS,
               {
                  where: {
                     _or: [
                        { providerAccountId: { _eq: id } },
                        { customerId: { _eq: id } },
                     ],
                  },
               }
            )
            if (provider_customers.length > 0) {
               const [customer] = provider_customers
               session.user.email = customer.customer.email
               session.user.id = customer.customerId
               session.user.phoneNumber = customer.customer.phoneNumber || 'N/A'
               session.user.firstName = customer.customer.firstName || 'N/A'
               session.user.lastName = customer.customer.lastName || ''
            }
            return session
         },
      },
   })
}

const OTPS = `
   query otps($where: platform_otp_transaction_bool_exp = {}) {
      otps: platform_otp_transaction(where: $where, order_by: {created_at: desc}) {
         id
         code
      }
   }
`

const INSERT_PROVIDER_CUSTOMER = `
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
const PROVIDERS = `
   query providers {
      providers: settings_authProvider {
         title
         value
      }
   }
`

const CUSTOMERS = `
   query customers($where: platform_customer_bool_exp = {}) {
      customers: platform_customer(where: $where) {
         email
         password
         fullName
         id: keycloakId
      }
   }
`

const INSERT_CUSTOMER = `
   mutation insertCustomer($object: platform_customer_insert_input!) {
      insertCustomer: insert_platform_customer_one(object: $object) {
         id: keycloakId
      }
   }
`

const PLATFORM_CUSTOMER = `
   query platform_customer($where: platform_customer_bool_exp = {}) {
      platform_customer: platform_customer(where: $where) {
         id: keycloakId
      }
   }
`

const PROVIDER_CUSTOMERS = `
   query provider_customers($where: platform_provider_customer_bool_exp = {}) {
      provider_customers: platform_provider_customer(where: $where) {
         id
         customerId
         customer {
            email
            phoneNumber
            firstName
            lastName
         }
      }
   }
`
