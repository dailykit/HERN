import React from 'react'
import { isEmpty } from 'lodash'
import jwtDecode from 'jwt-decode'

import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { signIn, getSession } from 'next-auth/client'

import { Loader } from '../../components'
import { getRoute, get_env, isClient, processUser } from '../../utils'
import { useMutation, useLazyQuery } from '@apollo/react-hooks'
import {
   RESET_PASSWORD,
   VERIFY_RESET_PASSWORD_TOKEN,
   MUTATIONS,
   BRAND,
   CUSTOMER,
} from '../../graphql'
import { useConfig } from '../../lib'
import { useQueryParams } from '../../utils/useQueryParams'
import { useRouter } from 'next/router'
import { useUser } from '../../context'

export const ResetPassword = () => {
   const router = useRouter()
   const { addToast } = useToasts()
   const { dispatch } = useUser()
   const { brand, configOf, organization } = useConfig()
   const params = useQueryParams()
   const theme = configOf('theme-color', 'Visual')

   const [type, setType] = React.useState('reset_password')
   const [token, setToken] = React.useState(null)
   const [isVerified, setIsVerified] = React.useState(false)
   const [error, setError] = React.useState('')
   const [form, setForm] = React.useState({
      password: '',
      confirmPassword: '',
   })

   const isValid = form.password && form.confirmPassword

   const [create_brand_customer] = useMutation(BRAND.CUSTOMER.CREATE, {
      onCompleted: () => {
         if (isClient) {
            window.location.href =
               window.location.origin + '/get-started/select-plan'
         }
      },
      onError: error => {
         console.log(error)
      },
   })
   const [create] = useMutation(MUTATIONS.CUSTOMER.CREATE, {
      onCompleted: () => {
         dispatch({ type: 'SET_USER', payload: {} })
         if (isClient) {
            window.location.href =
               window.location.origin + '/get-started/select-plan'
         }
      },
      onError: () =>
         addToast('Something went wrong!', {
            appearance: 'error',
         }),
   })
   const [customer] = useLazyQuery(CUSTOMER.DETAILS_QUERY, {
      onCompleted: async ({ customer = {} }) => {
         const { email = '', keycloakId = '' } = jwtDecode(token)
         if (isEmpty(customer)) {
            console.log('CUSTOMER DOESNT EXISTS')
            create({
               variables: {
                  object: {
                     email,
                     keycloakId,
                     source: 'subscription',
                     sourceBrandId: brand.id,
                     brandCustomers: { data: { brandId: brand.id } },
                  },
               },
            })
            return
         }
         console.log('CUSTOMER EXISTS')

         const user = await processUser(
            customer,
            organization?.stripeAccountType
         )
         dispatch({ type: 'SET_USER', payload: user })

         const { brandCustomers = {} } = customer
         if (isEmpty(brandCustomers)) {
            console.log('BRAND_CUSTOMER DOESNT EXISTS')
            create_brand_customer({
               variables: {
                  object: { keycloakId, brandId: brand.id },
               },
            })
         } else if (customer.isSubscriber && brandCustomers[0].isSubscriber) {
            console.log('BRAND_CUSTOMER EXISTS & CUSTOMER IS SUBSCRIBED')
            isClient && localStorage.removeItem('plan')
            const landedOn = isClient ? localStorage.getItem('landed_on') : null
            if (isClient && landedOn) {
               localStorage.removeItem('landed_on')
               window.location.href = landedOn
            } else {
               window.location.href = getRoute('/menu')
            }
         } else {
            console.log('CUSTOMER ISNT SUBSCRIBED')
            if (isClient) {
               const landedOn = localStorage.getItem('landed_on')
               if (landedOn) {
                  localStorage.removeItem('landed_on')
                  window.location.href = landedOn
               } else {
                  window.location.href =
                     window.location.origin +
                     getRoute('/get-started/select-plan')
               }
            }
         }
      },
   })

   const [verifyResetPasswordToken, { loading: verifying }] = useMutation(
      VERIFY_RESET_PASSWORD_TOKEN,
      {
         onCompleted: data => {
            if (data?.verifyResetPasswordToken?.success) {
               setIsVerified(true)
            } else {
               addToast(
                  'Seems like token has either expired or is invalid, please try again!',
                  { appearance: 'error' }
               )
               router.push(getRoute('/get-started/register'))
            }
         },
         onError: error => {
            addToast(
               'Seems like token has either expired or is invalid, please try again!',
               { appearance: 'error' }
            )
            router.push(getRoute('/get-started/register'))
         },
      }
   )

   const [resetPassword, { loading }] = useMutation(RESET_PASSWORD, {
      onCompleted: async () => {
         addToast('Password changed successfully!', { appearance: 'success' })
         const parsedToken = jwtDecode(params['token'])
         await signIn('email_password', {
            email: parsedToken.email,
            password: form.password,
            redirect: false,
         })

         const session = await getSession()
         if (token?.sub) {
            customer({
               variables: {
                  keycloakId: session?.user?.id,
                  brandId: brand.id,
               },
            })
         } else {
            router.push(getRoute('/get-started/register'))
         }
      },
      onError: error => {
         addToast(error.message, { appearance: 'error' })
      },
   })
   React.useEffect(() => {
      if (params) {
         const token = params['token']
         console.log({ token })
         if (token) {
            setToken(token)
            const { type = '', redirectUrl = '' } = jwtDecode(token)
            if (type) {
               setType(type)
            }
            if (isClient && redirectUrl) {
               localStorage.setItem('landed_on', redirectUrl)
            }
         } else {
            router.push(getRoute('/get-started/register'))
         }
      }
   }, [params])

   React.useEffect(() => {
      if (token) {
         verifyResetPasswordToken({ variables: { token } })
      }
   }, [token])

   const onChange = e => {
      const { name, value } = e.target
      setForm(form => ({
         ...form,
         [name]: value.trim(),
      }))
   }

   const submit = async () => {
      try {
         setError('')
         if (form.password.length < 6) {
            return setError('Passwords should contain at least 6 characters!')
         }
         if (form.password !== form.confirmPassword) {
            return setError('Passwords do not match!')
         }
         if (isClient) {
            resetPassword({
               variables: {
                  token,
                  password: form.password,
               },
            })
         }
      } catch (error) {
         if (error?.code === 401) {
            setError('Token or password is missing!')
         }
      }
   }

   if (verifying) return <Loader />
   return (
      <Main tw="pt-8">
         <Title theme={theme}>
            {type === 'set_password' ? 'Set' : 'Reset'} Password
         </Title>
         {isVerified ? (
            <Panel>
               <FieldSet>
                  <Label htmlFor="email">Password</Label>
                  <Input
                     type="password"
                     name="password"
                     value={form.password}
                     onChange={onChange}
                     placeholder="Enter new password"
                  />
               </FieldSet>
               <FieldSet>
                  <Label htmlFor="email">Confirm Password</Label>
                  <Input
                     type="password"
                     name="confirmPassword"
                     value={form.confirmPassword}
                     onChange={onChange}
                     placeholder="Confirm new password"
                  />
               </FieldSet>
               <Submit
                  className={!isValid || loading ? 'disabled' : ''}
                  onClick={() => isValid && submit()}
               >
                  Change Password
               </Submit>
               {error && (
                  <span tw="self-start block text-red-500 mt-2">{error}</span>
               )}
            </Panel>
         ) : (
            <span tw="self-start block text-red-500 mt-2 text-center">
               Token not verified!
            </span>
         )}
      </Main>
   )
}

const Main = styled.main`
   margin: auto;
   overflow-y: auto;
   max-width: 1180px;
   width: calc(100vw - 40px);
   min-height: calc(100vh - 128px);
   > section {
      width: 100%;
      max-width: 360px;
   }
`

const Panel = styled.section`
   ${tw`flex mx-auto justify-center items-center flex-col py-4`}
`

const Title = styled.h2(
   ({ theme }) => css`
      ${tw`text-green-600 text-2xl text-center`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const FieldSet = styled.fieldset`
   ${tw`w-full flex flex-col mb-4`}
`

const Label = styled.label`
   ${tw`text-gray-600 mb-1`}
`

const Input = styled.input`
   ${tw`w-full block border h-10 rounded px-2 outline-none focus:border-2 focus:border-blue-400`}
`

const Submit = styled.button`
   ${tw`bg-green-500 rounded w-full h-10 text-white uppercase tracking-wider`}
   &.disabled {
      ${tw`cursor-not-allowed bg-gray-300 text-gray-700`}
   }
`
