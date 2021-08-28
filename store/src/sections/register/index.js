import React from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import Link from 'next/link'
import tw, { styled } from 'twin.macro'
import Countdown from 'react-countdown'
import { useToasts } from 'react-toast-notifications'
import { useLazyQuery, useMutation, useSubscription } from '@apollo/react-hooks'
import { signIn, providers, getSession } from 'next-auth/client'

import { useConfig } from '../../lib'
import { getRoute, getSettings, get_env, isClient } from '../../utils'

import {
   FORGOT_PASSWORD,
   INSERT_OTP_TRANSACTION,
   INSERT_PLATFORM_CUSTOMER,
   MUTATIONS,
   OTPS,
   PLATFORM_CUSTOMERS,
   RESEND_OTP,
   SEND_SMS,
} from '../../graphql'
import {
   deleteStoredReferralCode,
   getStoredReferralCode,
   isReferralCodeValid,
   setStoredReferralCode,
} from '../../utils/referrals'
import { CloseIcon } from '../../assets/icons'
const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const Registration = props => {
   const [current, setCurrent] = React.useState('REGISTER')
   const [isViaOtp, setIsViaOtp] = React.useState(false)

   return (
      <Main tw="pt-8">
         <TabList>
            <Tab
               className={current === 'LOGIN' ? 'active' : ''}
               onClick={() => setCurrent('LOGIN')}
            >
               Login
            </Tab>
            <Tab
               className={current === 'REGISTER' ? 'active' : ''}
               onClick={() => setCurrent('REGISTER')}
            >
               Register
            </Tab>
         </TabList>
         {current === 'LOGIN' && <LoginPanel />}
         {current === 'REGISTER' && (
            <RegisterPanel
               setCurrent={setCurrent}
               providers={props.providers}
            />
         )}
         <div tw=" mx-auto" style={{ width: 360 }}>
            {props.providers &&
               Object.values(props.providers).map(provider => {
                  if (['Email', 'Credentials', 'OTP'].includes(provider.name)) {
                     return
                  }
                  return (
                     <div key={provider.name} tw="w-full">
                        <button
                           css={[
                              tw`w-full bg-gray-100 h-10 rounded`,
                              provider.name === 'Google' &&
                                 tw`bg-blue-500 text-white`,
                           ]}
                           onClick={() => signIn(provider.id)}
                        >
                           Sign in with {provider.name}
                        </button>
                     </div>
                  )
               })}
            <button
               css={[tw`mt-3 w-full bg-green-500 text-white h-10 rounded`]}
               onClick={() => setIsViaOtp(true)}
            >
               Sign in with Phone Number
            </button>
         </div>
         {isViaOtp && <OTP setIsViaOtp={setIsViaOtp} />}
      </Main>
   )
}

const OTP = ({ setIsViaOtp }) => {
   const [error, setError] = React.useState('')
   const [loading, setLoading] = React.useState(false)
   const [hasOtpSent, setHasOtpSent] = React.useState(false)
   const [sendingOtp, setSendingOtp] = React.useState(false)
   const [form, setForm] = React.useState({ phone: '', otp: '', email: '' })
   const [otpId, setOtpId] = React.useState(null)
   const [otp, setOtp] = React.useState(null)
   const [resending, setResending] = React.useState(false)
   const [time, setTime] = React.useState(null)
   const [isNewUser, setIsNewUser] = React.useState(false)

   const [checkCustomerExistence] = useLazyQuery(PLATFORM_CUSTOMERS, {
      onCompleted: ({ customers = [] }) => {
         if (customers.length === 0) {
            setIsNewUser(true)
         }
      },
      onError: () => {},
   })

   const [resendOTP] = useMutation(RESEND_OTP, {
      onCompleted: () => {
         setResending(false)
         setTime(Date.now() + 120000)
      },
      onError: error => {
         console.error(error)
         setResending(false)
      },
   })

   const { loading: otpsLoading, data: { otps = [] } = {} } = useSubscription(
      OTPS,
      {
         skip: !otpId,
         fetchPolicy: 'network-only',
         variables: { where: { id: { _eq: otpId } } },
      }
   )

   React.useEffect(() => {
      if (otpId && !otpsLoading && otps.length > 0) {
         const [otp] = otps
         if (otp.isValid) {
            setOtp(otp)
         } else {
            setOtp(null)
            setHasOtpSent(false)
            setForm({ phone: '', otp: '', email: '' })
            setSendingOtp(false)
            setError('')
            setLoading(false)
            setOtpId(null)
            setResending(false)
            setTime(null)
         }
      }
   }, [otpId, otpsLoading, otps])

   const [sendSms] = useMutation(SEND_SMS, {
      onCompleted: () => {
         setHasOtpSent(true)
         setSendingOtp(false)
         setTime(Date.now() + 120000)
      },
      onError: error => {
         console.error(error)
         setSendingOtp(false)
         setError('Failed to send otp, please try again!')
      },
   })
   const [insertOtpTransaction] = useMutation(INSERT_OTP_TRANSACTION, {
      onCompleted: async ({ insertOtp = {} } = {}) => {
         if (insertOtp?.code) {
            setOtpId(insertOtp?.id)
            await sendSms({
               variables: {
                  phone: form.phone,
                  message: `Here's your OTP - ${insertOtp?.code}.`,
               },
            })
         } else {
            setSendingOtp(false)
         }
      },
      onError: error => {
         console.error(error)
         setSendingOtp(false)
         setError('Failed to send otp, please try again!')
      },
   })

   const onChange = e => {
      const { name, value } = e.target
      if (name === 'email' && error) {
         setError('')
      }
      setForm(form => ({
         ...form,
         [name]: value,
      }))
   }

   const submit = async e => {
      try {
         e.preventDefault()
         setLoading(true)
         if (!form.otp) {
            setError('Please enter the OTP!')
            setLoading(false)
            return
         }
         const emailRegex =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
         if (isNewUser && !emailRegex.test(form.email)) {
            setError('Please enter a valid email!')
            setLoading(false)
            return
         }

         setError('')
         const response = await signIn('otp', {
            redirect: false,
            ...form,
         })
         if (response?.status === 200) {
            const landedOn = localStorage.getItem('landed_on')
            if (landedOn) {
               localStorage.removeItem('landed_on')
               window.location.href = landedOn
            } else {
               window.location.href = getRoute('/menu')
            }
         } else {
            setLoading(false)
            setError('Entered OTP is incorrect, please try again!')
         }
      } catch (error) {
         setLoading(false)
         console.error(error)
         setError('Failed to log in, please try again!')
      }
   }

   const sendOTP = async () => {
      try {
         if (!form.phone) {
            setError('Phone number is required!')
            return
         }

         setSendingOtp(true)
         setError('')
         await checkCustomerExistence({
            variables: { where: { phoneNumber: { _eq: form.phone } } },
         })
         await insertOtpTransaction({
            variables: { object: { phoneNumber: form.phone } },
         })
      } catch (error) {
         setSendingOtp(false)
         setError('Failed to send otp, please try again!')
      }
   }

   const resend = async () => {
      setResending(true)
      setTime(null)
      await resendOTP({ variables: { id: otp?.id } })
   }

   return (
      <div
         tw="inset-0 fixed flex justify-center pt-12"
         style={{ zIndex: 1000, background: 'rgba(0,0,0,0.2)' }}
      >
         <div
            tw="h-auto bg-white rounded self-start p-3"
            style={{ width: 380 }}
         >
            <header tw="mb-3 flex items-center justify-between">
               <h3 tw="text-gray-600 text-xl font-medium">Sign In via OTP</h3>
               <button
                  onClick={() => setIsViaOtp(false)}
                  tw="p-2 hover:bg-gray-200 rounded"
               >
                  <CloseIcon size={18} tw="stroke-current" />
               </button>
            </header>
            {!hasOtpSent ? (
               <>
                  <FieldSet>
                     <Label htmlFor="phone">Phone Number*</Label>
                     <Input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={onChange}
                        placeholder="Enter your phone number"
                     />
                  </FieldSet>
                  <Submit
                     onClick={sendOTP}
                     disabled={sendingOtp || !form.phone}
                     className={sendingOtp || !form.phone ? 'disabled' : ''}
                  >
                     {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
                  </Submit>
               </>
            ) : (
               <>
                  {isNewUser && (
                     <FieldSet>
                        <Label htmlFor="email">Email*</Label>
                        <Input
                           name="email"
                           type="text"
                           onChange={onChange}
                           value={form.email}
                           placeholder="Enter your email"
                        />
                     </FieldSet>
                  )}
                  <FieldSet>
                     <Label htmlFor="otp">OTP*</Label>
                     <Input
                        name="otp"
                        type="text"
                        onChange={onChange}
                        value={form.otp}
                        placeholder="Enter the otp"
                     />
                  </FieldSet>
                  <Submit
                     onClick={submit}
                     disabled={
                        resending ||
                        loading ||
                        !form.otp ||
                        (isNewUser && !form.email)
                     }
                  >
                     Submit
                  </Submit>
                  {time && (
                     <Countdown
                        date={time}
                        renderer={({ minutes, seconds, completed }) => {
                           //otp?.id && otp?.isResendAllowed &&
                           if (completed) {
                              return (
                                 <button
                                    onClick={resend}
                                    disabled={resending}
                                    className={resending ? 'disabled' : ''}
                                    css={[
                                       tw`mt-2 text-gray-800 hover:bg-gray-200 rounded w-full h-10 uppercase tracking-wider`,
                                       resending &&
                                          tw`cursor-not-allowed hover:bg-white`,
                                    ]}
                                 >
                                    Resend OTP
                                 </button>
                              )
                           }
                           return (
                              <span tw="flex mt-2 text-center">
                                 Resend OTP in 0{minutes}:
                                 {seconds <= 9 ? '0' : ''}
                                 {seconds}
                              </span>
                           )
                        }}
                     />
                  )}
               </>
            )}
            {error && (
               <span tw="self-start block text-red-500 mt-2">{error}</span>
            )}
         </div>
      </div>
   )
}

const LoginPanel = () => {
   const router = useRouter()
   const [error, setError] = React.useState('')
   const [loading, setLoading] = React.useState(false)
   const [form, setForm] = React.useState({
      email: '',
      password: '',
   })

   const isValid = form.email && form.password

   const onChange = e => {
      const { name, value } = e.target
      setForm(form => ({
         ...form,
         [name]: value,
      }))
   }

   const submit = async () => {
      try {
         setError('')
         setLoading(true)
         const response = await signIn('email_password', {
            redirect: false,
            email: form.email,
            password: form.password,
         })
         setLoading(false)
         if (response?.status !== 200) {
            setError('Email or password is incorrect!')
         } else if (response?.status === 200) {
            const landedOn = isClient && localStorage.getItem('landed_on')
            if (isClient && landedOn) {
               localStorage.removeItem('landed_on')
               window.location.href = landedOn
            } else {
               router.push(getRoute('/menu'))
            }
         }
      } catch (error) {
         console.error(error)
      }
   }

   return (
      <Panel>
         <FieldSet>
            <Label htmlFor="email">Email*</Label>
            <Input
               type="email"
               name="email"
               value={form.email}
               onChange={onChange}
               placeholder="Enter your email"
            />
         </FieldSet>
         <FieldSet>
            <Label htmlFor="password">Password*</Label>
            <Input
               name="password"
               type="password"
               onChange={onChange}
               value={form.password}
               placeholder="Enter your password"
            />
         </FieldSet>
         <button
            tw="self-start mb-2 text-blue-500"
            onClick={() => router.push(getRoute('/forgot-password'))}
         >
            Forgot password?
         </button>
         <Submit
            className={!isValid || loading ? 'disabled' : ''}
            onClick={() => isValid && submit()}
         >
            {loading ? 'Logging in...' : 'Login'}
         </Submit>
         {error && <span tw="self-start block text-red-500 mt-2">{error}</span>}
      </Panel>
   )
}

function validateEmail(email) {
   const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
   return re.test(email)
}

const RegisterPanel = ({ setCurrent }) => {
   const { addToast } = useToasts()
   const { brand } = useConfig()

   const [emailExists, setEmailExists] = React.useState(false)
   const [hasAccepted, setHasAccepted] = React.useState(false)
   const [isReferralFieldVisible, setIsReferralFieldVisible] =
      React.useState(false)
   const [error, setError] = React.useState('')
   const [emailError, setEmailError] = React.useState('')
   const [passwordError, setPasswordError] = React.useState('')
   const [phoneError, setPhoneError] = React.useState('')
   const [forgotPasswordText, setForgotPasswordText] = React.useState('')
   const [loading, setLoading] = React.useState(false)
   const [form, setForm] = React.useState({
      email: '',
      password: '',
      phone: '',
      code: '',
   })

   const [applyReferralCode] = useMutation(MUTATIONS.CUSTOMER_REFERRAL.UPDATE, {
      onCompleted: () => {
         addToast('Referral code applied!', { appearance: 'success' })
         deleteStoredReferralCode()
      },
      onError: error => {
         console.log(error)
         addToast('Referral code not applied!', { appearance: 'error' })
      },
   })

   const [insertPlatformCustomer] = useMutation(INSERT_PLATFORM_CUSTOMER, {
      onCompleted: async ({ insertCustomer = {} } = {}) => {
         try {
            if (insertCustomer?.email) {
               const response = await signIn('email_password', {
                  email: form.email,
                  password: form.password,
                  redirect: false,
               })
               if (response?.status === 200) {
                  const session = await getSession()
                  const storedCode = getStoredReferralCode(null)
                  if (storedCode && session?.user?.id) {
                     await applyReferralCode({
                        variables: {
                           brandId: brand.id,
                           keycloakId: session?.user?.id,
                           _set: {
                              referredByCode: storedCode,
                           },
                        },
                     })
                  }

                  window.location.href =
                     window.location.origin +
                     getRoute('/get-started/select-plan')

                  setLoading(false)
               } else {
                  setLoading(false)
                  setError('Failed to register, please try again!')
               }
            }
         } catch (error) {
            console.error(error)
         }
      },
      onError: error => {
         setLoading(false)
         console.error(error)
      },
   })

   const [forgotPassword, { loading: forgotPasswordLoading }] = useMutation(
      FORGOT_PASSWORD,
      {
         onCompleted: ({ forgotPassword = {} } = {}) => {
            if (forgotPassword?.success) {
               setForgotPasswordText(
                  'An email has been sent to your provided email. Please check your  inbox.'
               )
               setTimeout(() => {
                  setForgotPasswordText('')
               }, 4000)
            }
            addToast('Successfully sent the set password email.', {
               appearance: 'success',
            })
         },
         onError: () => {
            addToast('Failed to send the set password email.', {
               appearance: 'error',
            })
         },
      }
   )

   const isValid =
      validateEmail(form.email) &&
      form.password &&
      form.password.length >= 6 &&
      form.phone &&
      form.phone.length > 0

   React.useEffect(() => {
      const storedReferralCode = getStoredReferralCode('')
      if (storedReferralCode) {
         setForm({ ...form, code: storedReferralCode })
         setIsReferralFieldVisible(true)
      }
   }, [])

   const onEmailBlur = async e => {
      const { value } = e.target
      if (validateEmail(value)) {
         setEmailError('')
         const url =
            new URL(get_env('DATA_HUB_HTTPS')).origin +
            '/server/api/customer/' +
            value
         const { status, data } = await axios.get(url)
         if (status === 200 && data?.success && data?.data?.id) {
            setEmailExists(true)
         } else {
            setEmailExists(false)
         }
      } else {
         setEmailError('Must be a valid email!')
      }
   }

   const onChange = e => {
      const { name, value } = e.target
      if (name === 'email' && validateEmail(value) && emailError) {
         setEmailError('')
      }
      if (name === 'password' && value.length >= 6 && passwordError) {
         setPasswordError('')
      }
      if (name === 'phone' && value.length > 0 && phoneError) {
         setPhoneError('')
      }
      setForm(form => ({
         ...form,
         [name]: value.trim(),
      }))
   }

   const submit = async () => {
      try {
         setError('')
         setLoading(true)
         const isCodeValid = await isReferralCodeValid(
            brand.id,
            form.code,
            true
         )
         if (!isCodeValid) {
            deleteStoredReferralCode()
            return setError('Referral code is not valid!')
         }
         if (form.code) {
            setStoredReferralCode(form.code)
         }

         const url = `${window.location.origin}/api/hash`
         const { data } = await axios.post(url, { password: form.password })

         if (data?.success && data?.hash) {
            // fb pixel integration after successfull registration
            ReactPixel.trackCustom('signup', {
               email: form.email,
               phone: form.phone,
               code: form.code,
            })

            await insertPlatformCustomer({
               variables: {
                  object: {
                     password: data?.hash,
                     email: form.email,
                     phoneNumber: form.phone,
                  },
               },
            })
         }
      } catch (error) {
         console.log(error)
         setLoading(false)
         setError('Failed to register, please try again!')
      }
   }

   return (
      <Panel>
         <FieldSet css={[emailError && tw`mb-1`]}>
            <Label htmlFor="email">Email*</Label>
            <Input
               type="email"
               name="email"
               value={form.email}
               onChange={onChange}
               placeholder="Enter your email"
               onBlur={onEmailBlur}
            />
         </FieldSet>
         {emailError && (
            <span tw="self-start block text-red-500 mb-2">{emailError}</span>
         )}
         {!emailExists ? (
            <>
               <FieldSet css={[passwordError && tw`mb-1`]}>
                  <Label htmlFor="password">Password*</Label>
                  <Input
                     name="password"
                     type="password"
                     onChange={onChange}
                     value={form.password}
                     placeholder="Enter your password"
                     onBlur={e =>
                        e.target.value.length < 6
                           ? setPasswordError(
                                'Password must be atleast 6 letters long!'
                             )
                           : setPasswordError('')
                     }
                  />
               </FieldSet>
               {passwordError && (
                  <span tw="self-start block text-red-500 mb-2">
                     {passwordError}
                  </span>
               )}
               <FieldSet css={[phoneError && tw`mb-1`]}>
                  <Label htmlFor="phone">Phone Number*</Label>
                  <Input
                     type="text"
                     name="phone"
                     value={form.phone}
                     onChange={onChange}
                     placeholder="Eg. 9879879876"
                     onBlur={e =>
                        e.target.value.length === 0
                           ? setPhoneError('Must be a valid phone number!')
                           : setPhoneError('')
                     }
                  />
               </FieldSet>
               {phoneError && (
                  <span tw="self-start block text-red-500 mb-2">
                     {phoneError}
                  </span>
               )}
               {isReferralFieldVisible ? (
                  <FieldSet>
                     <Label htmlFor="code">Referral Code</Label>
                     <Input
                        name="code"
                        type="text"
                        onChange={onChange}
                        value={form.code}
                        placeholder="Enter referral code"
                     />
                  </FieldSet>
               ) : (
                  <button
                     tw="self-start mb-1 text-blue-500"
                     onClick={() => setIsReferralFieldVisible(true)}
                  >
                     Got a referral code?
                  </button>
               )}
               <section tw="self-start mt-2 mb-3">
                  <input
                     tw="mr-2"
                     type="checkbox"
                     name="terms&conditions"
                     id="terms&conditions"
                     onChange={() => setHasAccepted(!hasAccepted)}
                  />
                  <label htmlFor="terms&conditions" tw="text-gray-600">
                     I accept{' '}
                     <Link href={getRoute('/terms-and-conditions')}>
                        <a tw="text-blue-500">terms and conditions.</a>
                     </Link>
                  </label>
               </section>
               <Submit
                  className={
                     !hasAccepted || !isValid || loading ? 'disabled' : ''
                  }
                  onClick={() => isValid && submit()}
               >
                  {loading ? 'Registering' : 'Register'}
               </Submit>
               <button
                  tw="self-start mt-2 text-blue-500"
                  onClick={() => setCurrent('LOGIN')}
               >
                  Login instead?
               </button>
            </>
         ) : (
            <>
               <p tw="text-gray-600 mb-4">
                  Looks like your email already exists. If you remember your
                  password then go to&nbsp;
                  <button
                     tw="text-blue-500"
                     onClick={() => setCurrent('LOGIN')}
                  >
                     login
                  </button>
                  &nbsp;or
               </p>
               <Submit
                  onClick={() =>
                     forgotPassword({
                        variables: {
                           email: form.email,
                           origin: location.origin,
                           type: 'set_password',
                           ...(isClient &&
                              localStorage.getItem('landed_on') && {
                                 redirectUrl: localStorage.getItem('landed_on'),
                              }),
                        },
                     })
                  }
                  className={
                     !form.email || forgotPasswordLoading ? 'disabled' : ''
                  }
               >
                  {forgotPasswordLoading
                     ? 'Sending email...'
                     : 'Send Login Email'}
               </Submit>
               {forgotPasswordText && (
                  <p tw="text-green-600 mt-3">{forgotPasswordText}</p>
               )}
            </>
         )}
         {error && <span tw="self-start block text-red-500 mt-2">{error}</span>}
      </Panel>
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

const TabList = styled.ul`
   ${tw`border-b flex justify-center space-x-3`}
`

const Tab = styled.button`
   ${tw`h-8 px-3`}
   &.active {
      ${tw`border-b border-green-500 border-b-2`}
   }
`

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
   &[disabled] {
      ${tw`cursor-not-allowed bg-gray-300 text-gray-700`}
   }
`
export const getStaticProps = async context => {
   const domain = 'test.dailykit.org'
   const { seo, settings } = await getSettings(domain, '/get-started/register')

   const { req, res } = context
   const session = await getSession({ req })

   if (session && res && session.accessToken) {
      return {
         props: {
            session,
            seo,
            settings,
            revalidate: 60,
            providers: await providers(context),
         },
      }
   }

   return {
      props: {
         session: null,
         seo,
         settings,
         revalidate: 60,
         providers: await providers(context),
      },
   }
}

export const getStaticPaths = () => {
   return {
      paths: [],
      fallback: 'blocking',
   }
}
