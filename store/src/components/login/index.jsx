import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useLazyQuery, useMutation } from '@apollo/client'
import jwtDecode from 'jwt-decode'
import { Loader } from '@dailykit/ui'
import { Wrapper, FormWrap } from './styles'
import ForgotPassword from './forgotPassword'
import Button from '../Button'
import InlineLoader from '../InlineLoader'
import Error from '../Error'
import Input from '../Input'
import { auth } from '../../authenticationApi'
import { useUser } from '../../Providers'
import { useWindowDimensions, isClient, isEmpty } from '../../utils'
import { useConfig } from '../../lib'
import {
   CUSTOMER_DETAILS,
   CREATE_CUSTOMER,
   CREATE_BRAND_CUSTOMER
} from '../../graphql'

export default function LoginComp({ isClicked, authBtnClassName, ...rest }) {
   const router = useRouter()
   const { brand } = useConfig()
   const { dispatch } = useUser()

   const { width } = useWindowDimensions()
   const { login } = auth
   const [loading, setLoading] = useState(false)
   const [isForgotPasswordClicked, setIsForgotPasswordClicked] =
      React.useState(false)
   const [error, setError] = useState('')
   const [email, setEmail] = useState('')
   const [password, setPassword] = useState('')

   const [create_brand_customer] = useMutation(CREATE_BRAND_CUSTOMER, {
      refetchQueries: ['CUSTOMER_DETAILS'],
      onCompleted: () => {
         if (isClient) {
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
            if (isClient) {
               redirect()
            }
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
            if (brandCustomers.length === 0) {
               console.log('BRAND_CUSTOMER DOESNT EXISTS')
               create_brand_customer({
                  variables: {
                     object: { keycloakId, brandId: brand.id }
                  }
               })
            } else {
               redirect()
            }
         }
      }
   )

   const handleSubmit = async e => {
      try {
         e.preventDefault()
         setLoading(true)
         const token = await login({
            email: email,
            password: password
         })
         if (token?.sub) {
            customer({
               variables: {
                  keycloakId: token?.sub
               }
            })
         } else {
            setError('Failed to login, please try again!')
         }
      } catch (err) {
         console.error(err)
         setError('Email or password is incorrect!')
      } finally {
         setLoading(false)
      }
   }

   return (
      <>
         {!isForgotPasswordClicked ? (
            <Wrapper {...rest}>
               <p className="redirectToSignup">
                  Don't have an account?{' '}
                  <Link href="/signup">
                     <a>SIGN UP</a>
                  </Link>
               </p>
               <h1 className="heading">Log In</h1>
               <FormWrap {...rest} onSubmit={handleSubmit}>
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
                     value={password}
                     onChange={e => setPassword(e.target.value)}
                  />
                  {error && <Error>{error}</Error>}
                  <p
                     onClick={() => setIsForgotPasswordClicked(true)}
                     className="forgotPassword"
                  >
                     Forgot Password?
                  </p>

                  <div className={`loginBtnWrap ${authBtnClassName}`}>
                     <Button
                        disabled={
                           loading ||
                           loadingCustomerDetails ||
                           creatingCustomerLoading
                        }
                        type="submit"
                        className="loginBtn"
                     >
                        {loading ||
                        loadingCustomerDetails ||
                        creatingCustomerLoading ? (
                           <InlineLoader />
                        ) : (
                           'Log in'
                        )}
                     </Button>
                  </div>
               </FormWrap>
            </Wrapper>
         ) : (
            <ForgotPassword close={() => setIsForgotPasswordClicked(false)} />
         )}
      </>
   )
}

const redirect = () => {
   const inviteUrl = localStorage.getItem('bookingInviteUrl')
   if (inviteUrl) {
      window.location.href = inviteUrl
   } else {
      window.location.href = `${window.location.origin}/dashboard`
   }
}
