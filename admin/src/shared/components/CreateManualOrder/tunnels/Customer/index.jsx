import React from 'react'
import axios from 'axios'
import { get } from 'lodash'
import { toast } from 'react-toastify'
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
   const [customerTunnels, openCustomerTunnel, closeCustomerTunnel] = useTunnel(
      1
   )

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
                              title:
                                 current.customer?.platform_customer?.fullName,
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
                                    title:
                                       option.customer?.platform_customer
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

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

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

const CreateCustomer = ({ closeCustomerTunnel }) => {
   const [email, setEmail] = React.useState({
      value: '',
      meta: {
         errors: [],
         isValid: false,
         isTouched: false,
      },
   })
   const [form, setForm] = React.useState({
      firstName: '',
      lastName: '',
      phoneNumber: '',
   })
   const { mode, brand, methods, tunnels, dispatch } = useManual()
   const [updatePlatformCustomer] = useMutation(
      MUTATIONS.UPDATE_PLATFORM_CUSTOMER,
      {
         onError: error => logger(error),
      }
   )

   const [fetchCustomer, { loading: loadingCustomer }] = useLazyQuery(
      QUERIES.CUSTOMER.ONE,
      {
         onCompleted: async ({ brandCustomer = {} } = {}) => {
            dispatch({
               type: 'SET_CUSTOMER',
               payload: brandCustomer,
            })
            if (brandCustomer.customer?.platform_customer?.id) {
               const _customer = {
                  firstName:
                     get(
                        brandCustomer,
                        'customer.platform_customer.firstName'
                     ) || form.firstName,
                  lastName:
                     get(
                        brandCustomer,
                        'customer.platform_customer.lastName'
                     ) || form.lastName,
                  phoneNumber:
                     get(
                        brandCustomer,
                        'customer.platform_customer.phoneNumber'
                     ) || form.phoneNumber,
               }
               await updatePlatformCustomer({
                  variables: {
                     keycloakId: brandCustomer.keycloakId,
                     _set: _customer,
                  },
               })
            } else {
               const _customer = {
                  firstName: form.firstName,
                  lastName: form.lastName,
                  phoneNumber: form.phoneNumber,
               }
               await updatePlatformCustomer({
                  variables: {
                     keycloakId: brandCustomer.keycloakId,
                     _set: _customer,
                  },
               })
            }
            if (mode === 'ONDEMAND') {
               await methods.cart.create.mutate(brandCustomer)
            } else {
               tunnels.open(4)
            }
            closeCustomerTunnel(1)
            toast.success('Successfully created the customer.')
         },
         onError: error => {
            logger(error)
            toast.error('Failed to create the customer.')
         },
      }
   )
   const [create, { loading }] = useMutation(
      MUTATIONS.REGISTER_AND_CREATE_BRAND_CUSTOMER,
      {
         onCompleted: async ({ registerAndCreateBrandCustomer = {} } = {}) => {
            if (registerAndCreateBrandCustomer.success) {
               const {
                  brandCustomers = [],
               } = registerAndCreateBrandCustomer.data
               if (brandCustomers.length > 0) {
                  const [brandCustomer] = brandCustomers
                  await fetchCustomer({ variables: { id: brandCustomer.id } })
               } else {
                  toast.error('Failed to create the customer.')
               }
            } else {
               toast.error('Failed to create the customer.')
            }
         },
         onError: error => {
            logger(error)
            toast.error('Failed to create the customer.')
         },
      }
   )

   const onBlur = e => {
      const { value } = e.target
      setEmail(existing => ({
         ...existing,
         meta: {
            isTouched: true,
            errors: validateEmail(value).errors,
            isValid: validateEmail(value).isValid,
         },
      }))
   }

   const onChange = e => {
      const { value } = e.target
      setEmail(existing => ({ ...existing, value }))
   }

   const onFormChange = e => {
      const { name, value } = e.target
      setForm(existing => ({ ...existing, [name]: value }))
   }

   const handleSubmit = async () => {
      create({
         variables: {
            input: {
               brandId: brand.id,
               email: email.value,
               withRegister: true,
               source: mode === 'SUBCRIPTION' ? 'subscription' : 'a-la-carte',
               clientId:
                  get_env('REACT_APP_KEYCLOAK_REALM') +
                  `${mode === 'SUBSCRIPTION' ? '-subscription' : ''}`,
               ...(form.firstName.trim() && { firstName: form.firstName }),
               ...(form.lastName.trim() && { lastName: form.lastName }),
               ...(form.phoneNumber.trim() && {
                  phoneNumber: form.phoneNumber,
               }),
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
                  onBlur={onBlur}
                  onChange={onChange}
                  value={email.value}
                  placeholder="enter customer's email"
                  hasError={email.meta.isTouched && !email.meta.isValid}
               />
               {email.meta.isTouched &&
                  !email.meta.isValid &&
                  email.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer size="14px" />
            <Form.Group>
               <Form.Label htmlFor="firstName" title="firstName">
                  First Name
               </Form.Label>
               <Form.Text
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={onFormChange}
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
                  value={form.lastName}
                  onChange={onFormChange}
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
                  value={form.phoneNumber}
                  onChange={onFormChange}
                  placeholder="enter customer's phone number"
               />
            </Form.Group>
            <Spacer size="16px" />
            <TextButton
               size="sm"
               type="solid"
               onClick={handleSubmit}
               disabled={!email.meta.isValid}
               isLoading={loading || loadingCustomer}
            >
               Create
            </TextButton>
         </Flex>
      </>
   )
}
