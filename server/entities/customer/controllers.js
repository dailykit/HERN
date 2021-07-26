import axios from 'axios'
import { get } from 'lodash'

import { client } from '../../lib/graphql'
import get_env from '../../../get_env'

const SECURE_DOMAIN = 'https://secure.dailykit.org/auth'
const SECURE_TOKEN_URL =
   SECURE_DOMAIN + '/realms/consumers/protocol/openid-connect/token'
const SECURE_USERS_URL = SECURE_DOMAIN + '/admin/realms/consumers/users'

export const create = async (req, res) => {
   try {
      const {
         email = '',
         source = '',
         password = '',
         brandId = null,
         withRegister = false,
         firstName = '',
         lastName = '',
         phoneNumber = ''
      } = req.body.input.input
      if (!email)
         return res.status(200).json({
            success: true,
            error: 'Email is required!'
         })
      if (!brandId)
         return res.status(200).json({
            success: false,
            error: 'Brand id is required!'
         })
      if (!source)
         return res.status(200).json({
            success: false,
            error: 'Source is required!'
         })

      const response = await client.request(CUSTOMERS, {
         email,
         brandId
      })

      const crmCustomerExists = get(response, 'customers[0].id', false)
      const crmBrandCustomerExists = get(
         response,
         'brandCustomers[0].id',
         false
      )
      const platformCustomerExists = get(
         response,
         'platform_customers[0].id',
         false
      )
      const platformProviderCustomerExists = get(
         response,
         'platform_provider_customers[0].id',
         false
      )

      if (!platformCustomerExists) {
         await client.request(CREATE_PLATFORM_CUSTOMER, {
            object: {
               email,
               lastName,
               firstName,
               phoneNumber,
               password: password.trim() || generatePassword()
            }
         })
      }

      await client.request(CREATE_PLATFORM_PROVIDER_CUSTOMER, {
         object: {
            provider: 'email_password',
            providerType: 'credentials',
            customerId: createPlatformCustomer.id,
            providerAccountId: createPlatformCustomer.id
         }
      })

      await client.request(CREATE_CRM_CUSTOMER, {
         brandId,
         object: {
            email,
            source,
            sourceBrandId: brandId,
            keycloakId: createPlatformCustomer.id,
            brandCustomers: {
               data: {
                  brandId,
                  keycloakId: createPlatformCustomer.id,
                  subscriptionOnboardStatus: 'SELECT_MENU'
               }
            }
         }
      })

      return res.status(200).json({
         data: {},
         success: true,
         message: 'Successfully created the customer!'
      })
   } catch (error) {
      return res.status(200).json({ success: false, error: error.message })
   }
}

export const getCustomer = async (req, res) => {
   try {
      const { email = '' } = req.params
      if (!email)
         return res
            .status(401)
            .json({ success: false, error: 'Email is required!' })
      const user = await getUserKeycloakDetails(email)
      return res.status(200).json({ success: true, data: user })
   } catch (error) {
      return res.status(500).json({ success: false, error })
   }
}

const generatePassword = () => {
   var length = 8,
      charset =
         'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      retVal = ''
   for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n))
   }
   return retVal
}

const REGISTER = `
   mutation register($email: String!, $password: String!) {
      register: registerCustomer(email: $email, password: $password) {
         message
         success
      }
   }
`

const CUSTOMERS = `
   query customers($email: String!, $brandId: Int!) {
      customers(where: { email: { _eq: $email } }) {
         id
      }
      brandCustomers(
         where: {
            customer: { email: { _eq: $email } }
            brandId: { _eq: $brandId }
         }
      ) {
         id
      }
      platform_customers: platform_customer_(
         where: { email: { _eq: $email } }
      ) {
         id: keycloakId
      }
      platform_provider_customers: platform_provider_customer(
         where: {
            provider: { _eq: "email_password" }
            customer: { email: { _eq: $email } }
         }
      ) {
         id
      }
   }
`

const CREATE_CUSTOMER = `
   mutation createCustomer(
      $brandId: Int!
      $object: crm_customer_insert_input!
   ) {
      createCustomer(object: $object) {
         id
         email
         keycloakId
         brandCustomers(where: { brandId: { _eq: $brandId } }) {
            id
         }
         platform_customer {
            firstName
            lastName
            phoneNumber
         }
      }
   }
`

const CREATE_BRAND_CUSTOMER = `
   mutation createBrandCustomer($object: crm_brand_customer_insert_input!) {
      createBrandCustomer(object: $object) {
         id
         customer {
            id
            email
            keycloakId
         }
      }
   }
`

const UPDATE_PLATFORM_CUSTOMER = `
   mutation updateCustomer(
      $keycloakId: String!
      $_set: platform_customer_set_input = {}
   ) {
      updateCustomer: platform_updateCustomer(
         pk_columns: { keycloakId: $keycloakId }
         _set: $_set
      ) {
         firstName
         lastName
         phoneNumber
      }
   }
`
const CREATE_CRM_CUSTOMER = `
   mutation createCustomer($brandId: Int!, $object: crm_customer_insert_input!) {
      createCustomer(object: $object) {
         id
         email
         keycloakId
         brandCustomers(where: { brandId: { _eq: $brandId } }) {
            id
         }
         platform_customer: platform_customer_ {
            firstName
            lastName
            phoneNumber
         }
      }
   }
`

const CREATE_PLATFORM_PROVIDER_CUSTOMER = `
   mutation createProviderCustomer(
      $object: platform_provider_customer_insert_input!
   ) {
      createProviderCustomer: insert_platform_provider_customer_one(
         object: $object
      ) {
         id
      }
   }
`

const CREATE_PLATFORM_CUSTOMER = `
   mutation createPlatformCustomer($object: platform_customer__insert_input!) {
      createPlatformCustomer: insert_platform_customer__one(object: $object) {
         id: keycloakId
      }
   }
`

/*
      const user = await getUserKeycloakDetails(email)

      if (!user && withRegister) {
         const { register = {} } = await client.request(REGISTER, {
            email: email.trim(),
            password: password.trim() || generatePassword()
         })
         if (!register.success) {
            res.status(400).json({
               success: false,
               error: 'Failed to register customer'
            })
         }
      }

      const _user = await getUserKeycloakDetails(email)

      if (_user && 'id' in _user && _user.id) {
         const { customer } = await client.request(CUSTOMER, {
            brandId,
            keycloakId: _user.id
         })

         const response = {}

         if (customer && 'id' in customer && customer.id) {
            // CUSTOMER EXISTS
            if (customer.brandCustomers.length > 0) {
               // BRAND CUSTOMER EXISTS
               response.success = true
               response.data = customer
               response.message = 'Customer already exists!'
            } else {
               // CREATE BRAND CUSTOMER
               const { createBrandCustomer } = await client.request(
                  CREATE_BRAND_CUSTOMER,
                  {
                     object: {
                        brandId: brandId,
                        keycloakId: _user.id
                     }
                  }
               )
               const { id, customer: _customer } = createBrandCustomer

               response.success = true
               response.data = { ..._customer, brandCustomers: [{ id: id }] }
               response.message = 'Sucessfully created the brand customer!'
            }
         } else {
            // CREATE CUSTOMER & BRAND CUSTOMER
            const { createCustomer } = await client.request(CREATE_CUSTOMER, {
               brandId,
               object: {
                  email,
                  source,
                  clientId,
                  keycloakId: _user.id,
                  sourceBrandId: brandId,
                  brandCustomers: { data: { brandId: brandId } }
               }
            })
            response.success = true
            response.message = 'Successfully created the customer!'
            response.data = createCustomer
         }

         let _customer = {
            firstName:
               get(customer, 'platform_customer.firstName') ||
               firstName.trim() ||
               '',
            lastName:
               get(customer, 'platform_customer.lastName') ||
               lastName.trim() ||
               '',
            phoneNumber:
               get(customer, 'platform_customer.phoneNumber') ||
               phoneNumber.trim() ||
               ''
         }

         await sleep(2000)

         await client.request(UPDATE_PLATFORM_CUSTOMER, {
            keycloakId: _user.id,
            _set: _customer
         })
         return res.status(200).json(response)
      }
      */
