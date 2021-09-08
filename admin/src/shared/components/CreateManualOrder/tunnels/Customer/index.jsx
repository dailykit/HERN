import React from 'react'
import axios from 'axios'
import { get } from 'lodash'
import { toast } from 'react-toastify'
import { GraphQLClient } from 'graphql-request'
import { useLazyQuery, useMutation, useQuery } from '@apollo/react-hooks'
import {
   Form,
   Flex,
   List,
   Spacer,
   Tunnel,
   Tunnels,
   ListItem,
   useTunnel,
   ListSearch,
   TextButton,
   ButtonTile,
   ListHeader,
   ListOptions,
   TunnelHeader,
   useSingleList,
} from '@dailykit/ui'

import { InlineLoader } from '../../../'
import { useManual } from '../../state'
import { logger } from '../../../../utils'
import { get_env } from '../../../../../shared/utils'
import { MUTATIONS, QUERIES } from '../../graphql'

export const CustomerTunnel = () => {
   const [search, setSearch] = React.useState('')
   const [customers, setCustomers] = React.useState([])
   const { mode, methods, brand, tunnels, dispatch } = useManual()
   const [isCustomersLoading, setIsCustomersLoading] = React.useState(true)
   const [customerTunnels, openCustomerTunnel, closeCustomerTunnel] =
      useTunnel(1)

   useQuery(QUERIES.CUSTOMER.LIST, {
      variables: {
         where: { ...(brand?.id && { brandId: { _eq: brand?.id } }) },
      },
      onCompleted: ({ customers = [] }) => {
         if (customers.length > 0) {
            setCustomers(customers)
         }
         setIsCustomersLoading(false)
      },
      onError: () => {
         setIsCustomersLoading(false)
         toast.error('Failed to load customers list, please try again.')
      },
   })
   const [list, current, selectOption] = useSingleList(customers)

   const onSave = async () => {
      dispatch({
         type: 'SET_CUSTOMER',
         payload: current,
      })
      if (mode === 'ONDEMAND') {
         await methods.cart.create.mutate(current)
      } else {
         tunnels.open(4)
      }
   }

   return (
      <>
         <TunnelHeader
            title="Select Customer"
            close={() => tunnels.close(3)}
            right={{
               action: () => onSave(),
               disabled: !current?.id,
               isLoading: methods.cart.create.loading,
               title: mode === 'ONDEMAND' ? 'Save' : 'Next',
            }}
         />
         <Flex padding="16px" overflowY="auto" height="calc(100vh - 196px)">
            {isCustomersLoading ? (
               <InlineLoader />
            ) : (
               <>
                  <ButtonTile
                     noIcon
                     type="secondary"
                     text="Create Customer"
                     onClick={() => openCustomerTunnel(1)}
                  />
                  <Spacer size="14px" />
                  <List>
                     {Object.keys(current).length > 0 ? (
                        <ListItem
                           type="SSL2"
                           content={{
                              description: current.customer?.email,
                              title: current.customer?.platform_customer
                                 ?.fullName,
                           }}
                        />
                     ) : (
                        <ListSearch
                           onChange={value => setSearch(value)}
                           placeholder="type what you’re looking for..."
                        />
                     )}
                     <ListHeader type="SSL2" label="Customers" />
                     <ListOptions
                        style={{ height: '320px', overflowY: 'auto' }}
                     >
                        {list
                           .filter(option =>
                              option?.customer?.platform_customer?.fullName
                                 .toLowerCase()
                                 .includes(search)
                           )
                           .map(option => (
                              <ListItem
                                 type="SSL2"
                                 key={option.id}
                                 isActive={option.id === current.id}
                                 onClick={() => selectOption('id', option.id)}
                                 content={{
                                    description: option.customer?.email,
                                    title: option.customer?.platform_customer
                                       ?.fullName,
                                 }}
                              />
                           ))}
                     </ListOptions>
                  </List>
               </>
            )}
         </Flex>
         <Tunnels tunnels={customerTunnels}>
            <Tunnel size="sm">
               <CreateCustomer closeCustomerTunnel={closeCustomerTunnel} />
            </Tunnel>
         </Tunnels>
      </>
   )
}

const CUSTOMERS = `
   query customers($where: platform_customer_bool_exp = {}) {
      customers: platform_customer(where: $where) {
         id: keycloakId
         firstName
         lastName
      }
   }
`

const EMAIL_REGEX =
   /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const validateEmail = email => {
   const text = email.trim()
   let isValid = true
   let errors = []
   if (text.length === 0) {
      isValid = false
      errors = [...errors, 'Email is required.']
   }
   if (!EMAIL_REGEX.test(text)) {
      isValid = false
      errors = [...errors, 'Must be a valid email.']
   }
   return { isValid, errors }
}

const client = new GraphQLClient(get_env('REACT_APP_DATA_HUB_URI'), {
   headers: {
      'x-hasura-admin-secret': get_env('REACT_APP_HASURA_GRAPHQL_ADMIN_SECRET'),
   },
})

const CreateCustomer = ({ closeCustomerTunnel }) => {
   const { mode, brand, dispatch, methods, tunnels } = useManual()
   const [errors, setErrors] = React.useState([])
   const [form, setForm] = React.useState({
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
   })

   const [fetchCustomer, { loading: fetchingCustomer }] = useLazyQuery(
      QUERIES.CUSTOMER.ONE,
      {
         onCompleted: async ({ brandCustomer = {} } = {}) => {
            dispatch({
               type: 'SET_CUSTOMER',
               payload: brandCustomer,
            })
            if (mode === 'ONDEMAND') {
               await methods.cart.create.mutate(brandCustomer)
            } else {
               tunnels.open(4)
            }
            closeCustomerTunnel(1)
         },
      }
   )

   const [createCustomer, { loading: creatingCustomer }] = useMutation(
      MUTATIONS.INSERT_CUSTOMER,
      {
         onCompleted: async ({ createCustomer = {} } = {}) => {
            toast.success('Customer created successfully.')
            if (createCustomer?.brandCustomers.length > 0) {
               const [brandCustomer] = createCustomer.brandCustomers
               await fetchCustomer({ variables: { id: brandCustomer.id } })
            }
         },
         onError: error => {
            logger(error)
            toast.error('Failed to create customer!')
         },
      }
   )
   const [createProviderCustomer, { loading: creatingProviderCustomer }] =
      useMutation(MUTATIONS.INSERT_PLATFORM_PROVIDER_CUSTOMER, {
         onCompleted: async ({ createPlatformCustomer = {} } = {}) => {
            const { customerId = '' } = createPlatformCustomer
            if (customerId) {
               await createCustomer({
                  variables: {
                     object: {
                        email: form.email,
                        sourceBrandId: brand.id,
                        keycloakId: customerId,
                        source:
                           mode === 'SUBSCRIPTION'
                              ? 'subscription'
                              : 'a-la-carte',
                        brandCustomers: {
                           data: {
                              brandId: brand.id,
                              subscriptionOnboardStatus: 'SELECT_MENU',
                           },
                        },
                     },
                  },
               })
            }
         },
         onError: error => {
            logger(error)
            toast.error('Failed to create customer!')
         },
      })

   const onChange = e => {
      const { name, value } = e.target
      setForm({ ...form, [name]: value })
   }

   const handleSubmit = async () => {
      const { email, firstName, lastName, phoneNumber } = form

      const { isValid, errors } = validateEmail(email)
      if (!isValid && errors.length > 0) {
         setErrors(errors)
         return
      }

      const customersViaEmail = await client.request(CUSTOMERS, {
         where: { email: { _eq: form.email } },
      })

      if (customersViaEmail?.customers.length > 0) {
         setErrors(['Email is already taken!'])
         return
      }

      const customersViaPhone = await client.request(CUSTOMERS, {
         where: { phoneNumber: { _eq: form.phoneNumber } },
      })

      if (customersViaPhone?.customers.length > 0) {
         setErrors(['Phone number is already taken!'])
         return
      }

      setErrors([])

      await createProviderCustomer({
         variables: {
            object: {
               providerType: 'credentials',
               provider: 'email_password',
               customer: { data: { email, firstName, lastName, phoneNumber } },
            },
         },
      })
   }

   return (
      <>
         <TunnelHeader
            title="Create Customer"
            close={() => closeCustomerTunnel(1)}
         />
         <Flex padding="16px" overflowY="auto" height="calc(100vh - 196px)">
            <Form.Group>
               <Form.Label htmlFor="email" title="email">
                  Email*
               </Form.Label>
               <Form.Text
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="enter customer's email"
               />
            </Form.Group>
            <Spacer size="14px" />
            <Form.Group>
               <Form.Label htmlFor="firstName" title="firstName">
                  First Name
               </Form.Label>
               <Form.Text
                  id="firstName"
                  name="firstName"
                  onChange={onChange}
                  value={form.firstName}
                  placeholder="enter customer's first name"
               />
            </Form.Group>
            <Spacer size="14px" />
            <Form.Group>
               <Form.Label htmlFor="lastName" title="lastName">
                  Last Name
               </Form.Label>
               <Form.Text
                  id="lastName"
                  name="lastName"
                  onChange={onChange}
                  value={form.lastName}
                  placeholder="enter customer's last name"
               />
            </Form.Group>
            <Spacer size="14px" />
            <Form.Group>
               <Form.Label htmlFor="phoneNumber" title="phoneNumber">
                  Phone Number
               </Form.Label>
               <Form.Text
                  id="phoneNumber"
                  name="phoneNumber"
                  onChange={onChange}
                  value={form.phoneNumber}
                  placeholder="enter customer's phone number"
               />
            </Form.Group>
            <Spacer size="16px" />
            {errors.map(error => (
               <Form.Error>{error}</Form.Error>
            ))}
            <Spacer size="16px" />
            <TextButton
               size="sm"
               type="solid"
               onClick={handleSubmit}
               disabled={!form.email}
               isLoading={
                  fetchingCustomer ||
                  creatingCustomer ||
                  creatingProviderCustomer
               }
            >
               Create
            </TextButton>
         </Flex>
      </>
   )
}
