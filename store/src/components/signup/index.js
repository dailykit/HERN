import React, { useState } from 'react'
import Link from 'next/link'
import { useLazyQuery, useMutation } from '@apollo/client'
import jwtDecode from 'jwt-decode'
import { Wrapper, FormWrap } from './styles'
import Button from '../Button'
import Error from '../Error'
import Input from '../Input'
import InlineLoader from '../InlineLoader'
import { auth } from '../../authenticationApi'
import { useUser } from '../../Providers'
import { isClient, isEmpty, useWindowDimensions } from '../../utils'
import { useConfig } from '../../lib'
import {
   CUSTOMER_DETAILS,
   CREATE_CUSTOMER,
   CREATE_BRAND_CUSTOMER
} from '../../graphql'

export default function Signup({ authBtnClassName, ...props }) {
   const { width } = useWindowDimensions()
   const { login, register } = auth
   const { brand } = useConfig()
   const { user, dispatch } = useUser()
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState('')
   const [name, setName] = useState('')
   const [email, setEmail] = useState('')
   const [password, setPassword] = useState('')
   const [confirmPassword, setConfirmPassword] = useState('')

   const [create_brand_customer] = useMutation(CREATE_BRAND_CUSTOMER, {
      refetchQueries: ['CUSTOMER_DETAILS'],
      onCompleted: () => {
         if (isClient) {
            // setIsCategoryDrawerOpen(true);
            redirect()
         }
      },
      onError: error => {
         console.log(error)
      }
   })

   const [create, { loading: creatingCustomerLoading }] = useMutation(
      CREATE_CUSTOMER,
      {
         refetchQueries: ['CUSTOMER_DETAILS'],
         onCompleted: () => {
            dispatch({ type: 'SET_USER', payload: {} })
            // setIsCategoryDrawerOpen(true);
            redirect()
         },
         onError: error => console.log(error)
      }
   )

   const [customer, { loading: loadingCustomerDetails }] = useLazyQuery(
      CUSTOMER_DETAILS,
      {
         onCompleted: async ({ customer = {} }) => {
            const { email = '', sub: keycloakId = '' } = jwtDecode(
               localStorage.getItem('token')
            )
            if (isEmpty(customer)) {
               console.log('CUSTOMER DOESNT EXISTS')
               create({
                  variables: {
                     object: {
                        email,
                        keycloakId,
                        clientId:
                           isClient &&
                           ((process.browser &&
                              window?._env_?.NEXT_PUBLIC_CLIENTID) ||
                              process.env.NEXT_PUBLIC_CLIENTID)
                     }
                  }
               })
               return
            }
            console.log('CUSTOMER EXISTS')

            const user = {
               ...customer,
               ...customer?.platform_customer
            }
            dispatch({ type: 'SET_USER', payload: user })
            const { brandCustomers = [] } = customer
            if (brandCustomers.length) {
               console.log('BRAND_CUSTOMER DOESNT EXISTS')
               create_brand_customer({
                  variables: {
                     object: { keycloakId, brandId: brand.id }
                  }
               })
            }
         }
      }
   )

   const handleSubmit = async e => {
      try {
         e.preventDefault()
         setLoading(true)
         setError('')
         if (password !== confirmPassword) {
            throw new Error('Passwords do not match!')
         }
         const result = await register({
            name,
            email,
            password
         })
         if (result.success) {
            const token = await login({
               email,
               password
            })
            if (token?.sub) {
               customer({
                  variables: {
                     keycloakId: token?.sub
                  }
               })
            }
         }
      } catch (error) {
         console.log(error)
         if (error.includes('exists')) {
            return setError('Email is already in use!')
         }
         setError('Failed to register, please try again!')
      } finally {
         setLoading(false)
      }
   }

   return (
      <Wrapper {...props} onSubmit={handleSubmit}>
         <p className="redirectToLogin">
            Already have an account?{' '}
            <Link href="/login">
               <a>Log In</a>
            </Link>
         </p>
         <h1 className="heading">Sign Up</h1>
         <FormWrap {...props}>
            <Input
               type="text"
               placeholder="Your name"
               className="customInput"
               required
               value={name}
               onChange={e => setName(e.target.value)}
            />
            <Input
               type="email"
               placeholder="Your email"
               className="customInput"
               required
               value={email}
               onChange={e => setEmail(e.target.value)}
            />
            <Input
               type="password"
               placeholder="Enter password"
               className="customInput"
               required
               value={password}
               onChange={e => setPassword(e.target.value)}
               minLength={6}
            />
            <Input
               type="password"
               placeholder="Confirm password"
               className="customInput"
               required
               value={confirmPassword}
               onChange={e => setConfirmPassword(e.target.value)}
            />
            {error && <Error>{error}</Error>}
            <div className={`signupBtnWrap ${authBtnClassName}`}>
               <Button type="submit" className="signupBtn">
                  {loading ||
                  creatingCustomerLoading ||
                  loadingCustomerDetails ? (
                     <InlineLoader />
                  ) : (
                     'Sign Up'
                  )}
               </Button>
            </div>
         </FormWrap>
      </Wrapper>
   )
}

const redirect = () => {
   window.location.href = `${window.location.origin}/tags`
}
