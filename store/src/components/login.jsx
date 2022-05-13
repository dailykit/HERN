import { Button } from '.'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useConfig } from '../lib'
import classNames from 'classnames'
import React, { useState } from 'react'
import Countdown from 'react-countdown'
import { signIn, getSession } from 'next-auth/client'
import { getRoute, get_env, isClient, useQueryParams } from '../utils'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { useToasts } from 'react-toast-notifications'
import { CheckBoxIcon, FacebookIcon, GoogleIcon } from '../assets/icons'
import {
   FORGOT_PASSWORD,
   INSERT_OTP_TRANSACTION,
   INSERT_PLATFORM_CUSTOMER,
   MUTATIONS,
   OTPS,
   PLATFORM_CUSTOMERS,
   RESEND_OTP,
} from '../graphql'
import {
   useApolloClient,
   useLazyQuery,
   useMutation,
   useQuery,
   useSubscription,
} from '@apollo/react-hooks'
import axios from 'axios'

import {
   deleteStoredReferralCode,
   isReferralCodeValid,
   setStoredReferralCode,
   getStoredReferralCode,
} from '../utils/referrals'
import gql from 'graphql-tag'
import { useTranslation } from '../context'
import { useForm } from 'react-hook-form'

const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const Login = props => {
   //props
   const {
      loginBy = 'email',
      forceLogin = false,
      singleLoginMethod = false,
      callbackURL,
      socialLogin = true,
      showBackground = false,
   } = props

   //loginBy --> initial login method ('email', 'otp' , 'signup', 'forgotPassword').
   //forceLogin --> disable close icon and only close when successfully signup or login.
   //singleLoginMethod --> only use one method for log in either email or phone num. (based on loginBy).
   //callbackURL --> callback url for signIn (string)
   //socialLogin --> need social login or not

   //component state
   const [defaultLogin, setDefaultLogin] = useState(loginBy)
   const { t } = useTranslation()
   const showCreateOne = React.useMemo(() => {
      if (singleLoginMethod) {
         if (loginBy === 'email') {
            return true
         } else {
            return false
         }
      } else {
         return true
      }
   }, [singleLoginMethod])

   return (
      <div
         style={
            showBackground
               ? {
                    background: 'transparent',
                    boxShadow: 'none',
                 }
               : {}
         }
         className="hern-login-v1-content"
      >
         <div className="hern-login-v1-header">
            {(defaultLogin === 'email' || defaultLogin === 'otp') && (
               <span>{t('Log In')}</span>
            )}
            {defaultLogin === 'signup' && <span>{t('Sign Up')}</span>}
         </div>
         {forceLogin && (
            <div className="hern-login-v1__custom-warning">
               {t('You must login first to access this page.')}
               <span
                  onClick={() => {
                     if (isClient) {
                        window.location.href =
                           get_env('BASE_BRAND_URL') + getRoute('/')
                     }
                  }}
               >
                  {t('Go To Home')}
               </span>
            </div>
         )}
         <section>
            {/* email login  or phone number login*/}
            {defaultLogin === 'email' && (
               <Email
                  setDefaultLogin={setDefaultLogin}
                  callbackURL={callbackURL}
               />
            )}
            {defaultLogin === 'otp' && <OTPLogin callbackURL={callbackURL} />}
            {defaultLogin === 'forgotPassword' && <ForgotPassword />}
            {defaultLogin === 'signup' && (
               <Signup
                  setDefaultLogin={setDefaultLogin}
                  callbackURL={callbackURL}
               />
            )}

            {!singleLoginMethod && (
               <>
                  <DividerBar />
                  <div style={{ margin: '1em' }}>
                     <Button
                        className="hern-login-login-switcher-btn"
                        variant="outline"
                        onClick={() => {
                           defaultLogin === 'email'
                              ? setDefaultLogin('otp')
                              : setDefaultLogin('email')
                        }}
                     >
                        {defaultLogin === 'email' ? (
                           <span>{t('Log in with Phone Number')}</span>
                        ) : (
                           <span> {t('Log in with Email')}</span>
                        )}
                     </Button>
                  </div>
               </>
            )}

            {/* google or facebook */}
            {socialLogin && <SocialLogin callbackURL={callbackURL} />}
         </section>
         {defaultLogin !== 'signup' && showCreateOne && (
            <footer className="hern-login-v1__footer">
               <span>{t('No account?')} </span>
               <button
                  className="hern-login-v1__create-one-btn"
                  onClick={() => {
                     setDefaultLogin('signup')
                  }}
               >
                  {t('Create one')}
               </button>
            </footer>
         )}
         {defaultLogin === 'signup' && (
            <footer className="hern-login-v1__footer">
               <span>{t('Already have an account ?')} </span>
               <button
                  className="hern-login-v1__create-one-btn"
                  onClick={() => setDefaultLogin('email')}
               >
                  {t('Login')}
               </button>
            </footer>
         )}
      </div>
   )
}

//email log in
const Email = props => {
   //props
   const { setDefaultLogin, callbackURL } = props
   const { addToast } = useToasts()
   const router = useRouter()
   //component state
   const [loading, setLoading] = React.useState(false)
   const [error, setError] = React.useState('')
   const [form, setForm] = React.useState({
      email: '',
      password: '',
   })
   const [showPassword, setShowPassword] = useState(false)

   const isValid = React.useMemo(() => form.email && form.password, [form])
   const { t } = useTranslation()
   //handle input field change
   const onChange = e => {
      const { name, value } = e.target
      setForm(form => ({
         ...form,
         [name]: value,
      }))
   }

   //login click
   const submit = async () => {
      try {
         setError('')
         setLoading(true)
         const response = await signIn('email_password', {
            redirect: false,
            email: form.email,
            password: form.password,
            ...(callbackURL && { callbackUrl: callbackURL }),
         })
         setLoading(false)
         if (response?.status !== 200) {
            setError(
               <>
                  <span>{t('Email or password is incorrect')}</span>
                  <span>{'!'}</span>
               </>
            )
            addToast(
               <>
                  <span>{t('Email or password is incorrect')}</span>
                  <span>{'!'}</span>
               </>,
               {
                  appearance: 'error',
               }
            )
         } else if (response?.status === 200) {
            // fb pixel integration for tracking customer login
            ReactPixel.trackCustom('login', {
               email: form.email,
               phone: form.phone,
            })
            addToast(t('Login successfully!'), { appearance: 'success' })
            if (isClient) {
               const landedOn = localStorage.getItem('landed_on')
               if (landedOn) {
                  const route = landedOn.replace(window.location.origin, '')
                  localStorage.removeItem('landed_on')
                  router.push(getRoute(route))
               } else {
                  router.push(getRoute('/order'))
               }
            }
         }
      } catch (error) {
         console.error(error)
         addToast(t('Login failed'), {
            appearance: 'error',
         })
      }
   }
   const handleKeyPressLogin = event => {
      if (event.key === 'Enter') {
         isValid && submit()
      }
   }
   return (
      <div className="hern-login-v1__email">
         <fieldset className="hern-login-v1__fieldset">
            <label className="hern-login-v1__label" htmlFor="email">
               {t('Email')}
            </label>

            <input
               type="email"
               name="email"
               className="hern-login-v1__input"
               value={form.email}
               onChange={onChange}
               placeholder="Enter your email"
               required
               onKeyPress={handleKeyPressLogin}
            />
         </fieldset>
         <fieldset className="hern-login-v1__fieldset">
            <label className="hern-login-v1__label" htmlFor="password">
               {t('Password')}
            </label>

            <input
               name="password"
               type={showPassword ? 'text' : 'password'}
               className="hern-login-v1__input"
               onChange={onChange}
               value={form.password}
               placeholder="Enter your password"
               required
               onKeyPress={handleKeyPressLogin}
            />
         </fieldset>
         <div className="hern-login-v1__password-config">
            <div className="hern-login-v1__show-password">
               <CheckBoxIcon
                  showTick={showPassword}
                  size={18}
                  onClick={() => {
                     setShowPassword(prevState => !prevState)
                  }}
                  style={{ cursor: 'pointer' }}
               />
               <span>{t('Show password')}</span>
            </div>
            <span
               className="hern-login-v1__forgot-password"
               onClick={() => {
                  setDefaultLogin('forgotPassword')
               }}
            >
               <span>{t('Forgot password')}</span>
               {'?'}
            </span>
         </div>
         {error && <span className="hern-login-v1__error">{error}</span>}

         <Button
            className={classNames('hern-login-v1__login-btn', {
               'hern-login-v1__login-btn--disabled': !isValid || loading,
            })}
            onClick={() => isValid && submit()}
         >
            {loading ? <span>{t('LOGGING IN')}</span> : t('LOGIN')}
         </Button>
      </div>
   )
}

//  login with otp
const OTPLogin = props => {
   //props
   const { callbackURL } = props
   const { addToast } = useToasts()
   const { t } = useTranslation()
   const router = useRouter()
   const { brand } = useConfig()
   //component state
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
   const params = useQueryParams()
   const [isReferralFieldVisible, setIsReferralFieldVisible] =
      React.useState(false)
   React.useEffect(() => {
      if (params['invite-code']) {
         const setInviteCode = async () => {
            const isCodeValid = await isReferralCodeValid(
               brand.id,
               params['invite-code'],
               true
            )

            if (isCodeValid) {
               setIsReferralFieldVisible(true)
               setForm({ ...form, code: params['invite-code'] })
            }
         }
         setInviteCode()
      }
   }, [params])

   //check user already exist
   const [checkCustomerExistence] = useLazyQuery(PLATFORM_CUSTOMERS, {
      onCompleted: ({ customers = [] }) => {
         if (customers.length === 0) {
            setIsNewUser(true)
         }
      },
      onError: () => {},
   })

   const apolloClient = useApolloClient()

   //resend otp
   const [resendOTP] = useMutation(RESEND_OTP, {
      onCompleted: () => {
         setResending(false)
         setTime(Date.now() + 120000)
         addToast(t('OTP has been sent!'), { appearance: 'success' })
      },
      onError: error => {
         console.error(error)
         addToast(t('Failed to send OTP!'), { appearance: 'error' })
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

   //insert a entry of phone number in table and get otp code then send sms
   const [insertOtpTransaction] = useMutation(INSERT_OTP_TRANSACTION, {
      onCompleted: async ({ insertOtp = {} } = {}) => {
         if (insertOtp?.id) {
            setOtpId(insertOtp?.id)
            setHasOtpSent(true)
            setSendingOtp(false)
            setTime(Date.now() + 120000)
            addToast(t('OTP has been sent!'), { appearance: 'success' })
         } else {
            setSendingOtp(false)
         }
      },
      onError: error => {
         console.error(error)
         setSendingOtp(false)
         setError('Failed to send otp, please try again!')
         addToast(t('Failed to send OTP!'), { appearance: 'error' })
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

   //handle submit btn to submit email(if new user) and otp
   const submit = async e => {
      try {
         e.preventDefault()
         setLoading(true)
         if (!form.otp) {
            setError('Please enter the OTP!')
            addToast(t('Please enter the OTP!'), {
               appearance: 'error',
            })
            setLoading(false)
            return
         }
         const emailRegex =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
         if (isNewUser) {
            if (!emailRegex.test(form.email)) {
               setError('Please enter a valid email!')
               addToast(t('Please enter a valid email!'), {
                  appearance: 'error',
               })
               setLoading(false)
               return
            }
            const data = await apolloClient.query({
               query: PLATFORM_CUSTOMERS,
               variables: { where: { email: { _eq: form.email } } },
            })
            const { customers } = data.data
            if (customers.length > 0) {
               setError('This email is already in use!')
               addToast(t('This email is already in use!'), {
                  appearance: 'error',
               })
               setLoading(false)
               return
            }
         }

         setError('')
         const isCodeValid = await isReferralCodeValid(
            brand.id,
            form.code,
            true
         )
         if (!isCodeValid) {
            deleteStoredReferralCode()
            return setError(
               <>
                  <span>{t('Referral code is not valid')}</span>
                  <span>{'!'}</span>
               </>
            )
         }
         if (form.code) {
            setStoredReferralCode(form.code)
         }

         const response = await signIn('otp', {
            redirect: false,
            ...form,
            ...(callbackURL && { callbackUrl: callbackURL }),
         })
         if (response?.status === 200) {
            addToast(t('Login successfully!'), { appearance: 'success' })
            if (isClient) {
               const landedOn = localStorage.getItem('landed_on')
               if (landedOn) {
                  const route = landedOn.replace(window.location.origin, '')
                  localStorage.removeItem('landed_on')
                  router.push(getRoute(route))
               } else {
                  router.push(getRoute('/order'))
               }
            }
         } else {
            setLoading(false)
            setError(t('Entered OTP is incorrect, please try again!'))
            addToast(t('Entered OTP is incorrect!'), {
               appearance: 'error',
            })
         }
      } catch (error) {
         setLoading(false)
         console.error(error)
         addToast(t('Failed to log in, please try again!'), {
            appearance: 'error',
         })
         setError(t('Failed to log in, please try again!'))
      }
   }

   //handle send otp btn to send otp on phone number
   const sendOTP = async () => {
      try {
         if (!form.phone) {
            setError(t('Phone number is required!'))
            return
         }

         setSendingOtp(true)
         setError('')
         await checkCustomerExistence({
            variables: { where: { phoneNumber: { _eq: form.phone } } },
         })
         await insertOtpTransaction({
            variables: {
               object: {
                  phoneNumber: form.phone,
                  domain: isClient ? window.location.host : '',
               },
            },
         })
      } catch (error) {
         setSendingOtp(false)
         console.log('error is this', error)
         setError(t('Failed to send otp, please try again!'))
         addToast(t('Failed to send OTP!'), { appearance: 'error' })
      }
   }

   //handle resend otp btn
   const resend = async () => {
      setResending(true)
      setTime(null)
      await resendOTP({ variables: { id: otp?.id } })
   }
   const handleSendOTPKeyPress = event => {
      if (event.key === 'Enter') {
         if (form.phone && isValidPhoneNumber(form.phone)) {
            sendOTP()
         }
      }
   }
   const handleSubmitOTPKeyPress = event => {
      if (
         (event.which != 8 && event.which != 0 && event.which < 48) ||
         event.which > 57
      ) {
         event.preventDefault()
      }
      if (event.key !== 'Enter' && form.otp.length >= 6) {
         event.preventDefault()
      }
      if (event.key === 'Enter') {
         if (
            !(resending || loading || !form.otp || (isNewUser && !form.email))
         ) {
            submit(event)
         }
      }
   }

   return (
      <div className="hern-login-v1__otp">
         {!hasOtpSent ? (
            <>
               <fieldset className="hern-login-v1__fieldset">
                  <label className="hern-login-v1__label">
                     {t('Phone Number')}
                  </label>
                  <PhoneInput
                     autoFocus
                     className={`hern-login-v1__otp__phone__input hern-login-v1__otp__phone__input${
                        !(form.phone === '' || form.phone === undefined) &&
                        !(
                           (form.phone && isValidPhoneNumber(form.phone)) ||
                           sendingOtp
                        )
                           ? '-invalid'
                           : '-valid'
                     }`}
                     initialValueFormat="national"
                     value={form.phone}
                     onChange={e => {
                        setForm(form => ({
                           ...form,
                           ['phone']: e,
                        }))
                     }}
                     defaultCountry={get_env('COUNTRY_CODE')}
                     placeholder={'Enter your phone number'}
                     onKeyPress={handleSendOTPKeyPress}
                  />
               </fieldset>
               {form.phone !== '' &&
                  form.phone !== undefined &&
                  !(form.phone && isValidPhoneNumber(form.phone)) && (
                     <label class="hern-login-v1__otp__phone__error">
                        Please enter a valid phone number
                     </label>
                  )}
               <button
                  className={`hern-login-v1__otp-submit ${
                     !(
                        form.phone &&
                        isValidPhoneNumber(form.phone) &&
                        !sendingOtp
                     )
                        ? 'hern-login-v1__otp-submit--disabled'
                        : ''
                  }`}
                  onClick={sendOTP}
                  disabled={
                     !(
                        form.phone &&
                        isValidPhoneNumber(form.phone) &&
                        !sendingOtp
                     )
                  }
                  style={{ height: '40px' }}
               >
                  {sendingOtp ? (
                     <>
                        <span>{t('SENDING OTP')}</span>
                     </>
                  ) : (
                     t('SEND OTP')
                  )}
               </button>
            </>
         ) : (
            <>
               {isNewUser && (
                  <fieldset className="hern-login-v1__fieldset">
                     <label className="hern-login-v1__label">
                        {t('Email')}
                     </label>
                     <input
                        className="hern-login-v1__input"
                        name="email"
                        type="text"
                        onChange={onChange}
                        value={form.email}
                        placeholder="Enter your email"
                        autoFocus
                     />
                  </fieldset>
               )}
               <fieldset className="hern-login-v1__fieldset">
                  <label className="hern-login-v1__label">{t('OTP')}</label>
                  <input
                     className={classNames(
                        'hern-login-v1__input',
                        'hern-login-v1__input__otp'
                     )}
                     name="otp"
                     type="number"
                     onChange={onChange}
                     value={form.otp}
                     placeholder="Enter the otp"
                     onKeyPress={handleSubmitOTPKeyPress}
                     autoFocus={!isNewUser}
                  />
               </fieldset>
               {isNewUser && (
                  <>
                     {isReferralFieldVisible ? (
                        <fieldset className="hern-login-v1__fieldset">
                           <label
                              className="hern-login-v1__label"
                              htmlFor="code"
                           >
                              {t('Referral Code')}
                           </label>
                           <input
                              className="hern-login-v1__input"
                              name="code"
                              type="text"
                              onChange={onChange}
                              value={form.code}
                              placeholder="Enter referral code"
                           />
                        </fieldset>
                     ) : (
                        <button
                           className="hern-signup-v1__referral-code"
                           onClick={() => setIsReferralFieldVisible(true)}
                        >
                           {t('Got a referral code?')}
                        </button>
                     )}
                  </>
               )}
               <button
                  style={{ height: '40px' }}
                  className={`hern-login-v1__otp-submit ${
                     resending ||
                     loading ||
                     !form.otp ||
                     (isNewUser && !form.email)
                        ? 'hern-login-v1__otp-submit--disabled'
                        : ''
                  }`}
                  onClick={submit}
                  disabled={
                     resending ||
                     loading ||
                     !form.otp ||
                     (isNewUser && !form.email)
                  }
               >
                  {t('SUBMIT')}
               </button>
               {time && (
                  <Countdown
                     date={time}
                     renderer={({ minutes, seconds, completed }) => {
                        if (completed) {
                           return (
                              <>
                                 {otp && otp?.isResendAllowed && (
                                    <button
                                       onClick={resend}
                                       disabled={
                                          resending ||
                                          !(otp && otp?.isResendAllowed)
                                       }
                                       title={
                                          otp?.id && otp?.isResendAllowed
                                             ? ''
                                             : 'Maximum resend limit reached'
                                       }
                                       className={`hern-login-v1__otp__resend ${
                                          resending ||
                                          !(otp && otp?.isResendAllowed)
                                             ? 'hern-login-v1__otp__resend--disabled'
                                             : ''
                                       }`}
                                    >
                                       {t('Resend OTP')}
                                    </button>
                                 )}
                              </>
                           )
                        } else {
                           return (
                              <>
                                 {otp && otp?.resendAttempts <= 2 && (
                                    <span className="hern-login-v1__otp__resend__time">
                                       <span>{t('Resend OTP in')}</span>&nbsp;0
                                       {minutes}:{seconds <= 9 ? '0' : ''}
                                       {seconds}
                                    </span>
                                 )}
                              </>
                           )
                        }
                     }}
                  />
               )}
            </>
         )}
         {error && <span className="hern-login-v1__otp__error">{error}</span>}
      </div>
   )
}

// login with social media
const SocialLogin = props => {
   //props
   const { callbackURL } = props

   const { configOf, isConfigLoading } = useConfig()
   const authConfig = configOf('Auth Methods', 'brand')
   const { t } = useTranslation()
   //fetch all available provider
   const {
      loading: providerLoading,
      error: providerError,
      data: { settings_authProvider = [] } = {},
   } = useQuery(PROVIDERS)

   if (providerError) {
      return <p>{t('Something went wrong')}</p>
   }

   if (!providerLoading && settings_authProvider.length === 0) {
      return null
   }

   const handleSocialOnClick = option => {
      signIn(option)
   }

   return (
      <>
         <DividerBar text={t('or sign in with')} />
         <div className="hern-login-v1__social__login">
            <div className="hern-login-v1__social__login__providers">
               {providerLoading && (
                  <>
                     <span className="hern-login-v1__social_login_skeleton"></span>
                     <span className="hern-login-v1__social_login_skeleton"></span>
                  </>
               )}
               {!providerLoading &&
                  settings_authProvider.map((eachProvider, index) => {
                     return (
                        <div
                           className="hern-login-v1__social__login__provider"
                           key={index}
                        >
                           {eachProvider.title === 'google' &&
                              !isConfigLoading &&
                              authConfig.socialLoginMethods.googleLogin
                                 .value && (
                                 <GoogleIcon
                                    onClick={() => {
                                       handleSocialOnClick('google')
                                    }}
                                    style={{ cursor: 'pointer' }}
                                 />
                              )}
                           {eachProvider.title === 'facebook' &&
                              !isConfigLoading &&
                              authConfig.socialLoginMethods.facebookLogin
                                 .value && (
                                 <FacebookIcon
                                    onClick={() => {
                                       handleSocialOnClick('facebook')
                                    }}
                                    style={{ cursor: 'pointer' }}
                                 />
                              )}
                        </div>
                     )
                  })}
            </div>
         </div>
      </>
   )
}

//forgot password
const ForgotPassword = () => {
   const { t } = useTranslation()
   const { addToast } = useToasts()
   const [isEmailSent, setIsEmailSent] = React.useState(false)
   const [email, setEmail] = React.useState('')

   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm()

   const [checkCustomerExistence] = useLazyQuery(PLATFORM_CUSTOMERS, {
      variables: {
         where: { email: { _eq: email } },
      },
      onCompleted: ({ customers = [] }) => {
         if (customers.length > 0) {
            //customer exists
            submit()
         } else {
            //customer doesn't exist
            addToast("The email you have entered doesn't have an account", {
               appearance: 'info',
            })
         }
      },
      onError: () => {},
   })

   const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD, {
      onCompleted: () => {
         addToast(t('Email sent!'), { appearance: 'success' })
         setIsEmailSent(true)
      },
      onError: error => {
         addToast(error.message, { appearance: 'error' })
      },
   })

   const submit = async () => {
      try {
         if (isClient) {
            const origin = get_env('BASE_BRAND_URL')
            forgotPassword({
               variables: {
                  email,
                  origin,
               },
            })
         }
      } catch (error) {
         if (error?.code === 401) {
            addToast(
               <>
                  <span>{t('Email or password is incorrect')}</span>
                  <span>{'!'}</span>
               </>,
               {
                  appearance: 'error',
               }
            )
         }
      }
   }
   if (isEmailSent) {
      return (
         <div className="hern-login-v1__forgot-password__email-sent">
            <h3>
               An email was sent to <span>{email}</span>{' '}
            </h3>
            <p>
               Please check your email and follow the instructions to reset your
               password.
            </p>
            <Link href={getRoute('/order')}>
               <a>
                  <Button onClick={() => {}}>Explore our menu </Button>
               </a>
            </Link>
         </div>
      )
   }

   return (
      <form
         onClick={handleSubmit(data => {
            setEmail(data.email)
            checkCustomerExistence()
         })}
      >
         <div className="hern-forgot-password-v1">
            <fieldset className="hern-login-v1__fieldset">
               <label htmlFor="email" className="hern-login-v1__label">
                  <span>{t('Email')}</span>
               </label>
               <input
                  className="hern-login-v1__input"
                  type="email"
                  name="email"
                  id="email"
                  {...register('email', {
                     required: {
                        value: true,
                        message: 'Please enter your email address',
                     },
                     pattern: {
                        value: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                        message: 'Invalid email address',
                     },
                  })}
                  placeholder="Enter your email"
               />
            </fieldset>
            {errors.email && (
               <span className="hern-forgot-password-v1__error">
                  {errors.email.message}
               </span>
            )}
            <button
               type="submit"
               className={classNames('hern-forgot-password-v1__submit-btn', {
                  'hern-forgot-password-v1__submit-btn--disabled':
                     errors.email || loading,
               })}
               disabled={errors.email || loading}
               style={{ height: '40px' }}
               m
            >
               {t('SEND EMAIL')}
            </button>
         </div>
      </form>
   )
}

//divider bar
const DividerBar = props => {
   const { text } = props
   const { t } = useTranslation()
   return (
      <div className="hern-login-v1-divider-bar">
         <span>{text || t('or')}</span>
      </div>
   )
}

function validateEmail(email) {
   const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
   return re.test(email)
}

//signup
const Signup = props => {
   //props
   const { setDefaultLogin, callbackURL } = props
   const { t } = useTranslation()
   //component state
   const [showPassword, setShowPassword] = useState(false)
   const { addToast } = useToasts()
   const { brand } = useConfig()
   const router = useRouter()
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
   const params = useQueryParams()
   React.useEffect(() => {
      if (params['invite-code']) {
         const setInviteCode = async () => {
            const isCodeValid = await isReferralCodeValid(
               brand.id,
               params['invite-code'],
               true
            )

            if (isCodeValid) {
               setIsReferralFieldVisible(true)
               setForm({ ...form, code: params['invite-code'] })
            }
         }
         setInviteCode()
      }
   }, [params])

   const apolloClient = useApolloClient()

   const checkCustomerExistence = async email => {
      const data = await apolloClient.query({
         query: PLATFORM_CUSTOMERS,
         variables: {
            where: { email: { _eq: email } },
         },
      })
      const customers = data?.data?.customers
      if (customers.length > 0) {
         setEmailError('Email already exists')
         setEmailExists(true)
         return true
      }
      setEmailError('')
      setEmailExists(false)
      return false
   }

   const [insertPlatformCustomer] = useMutation(INSERT_PLATFORM_CUSTOMER, {
      onCompleted: async ({ insertCustomer = {} } = {}) => {
         try {
            if (insertCustomer?.email) {
               const response = await signIn('email_password', {
                  email: form.email,
                  password: form.password,
                  redirect: false,
                  ...(callbackURL && { callbackUrl: callbackURL }),
               })
               if (response?.status === 200) {
                  addToast(t('Login successfully!'), { appearance: 'success' })
                  if (isClient) {
                     const landedOn = localStorage.getItem('landed_on')
                     if (landedOn) {
                        const route = landedOn.replace(
                           window.location.origin,
                           ''
                        )
                        localStorage.removeItem('landed_on')
                        router.push(getRoute(route))
                     } else {
                        router.push(getRoute('/order'))
                     }
                  }
                  setLoading(false)
               } else {
                  setLoading(false)
                  setError(
                     <>
                        <span>{t('Failed to signup, please try again')}</span>
                        <span>{'!'}</span>
                     </>
                  )
                  addToast(
                     <>
                        <span>{t('Failed to signup')}</span>
                        <span>{'!'}</span>
                     </>,
                     { appearance: 'error' }
                  )
               }
            }
         } catch (error) {
            console.error(error)
            addToast(
               <>
                  <span>{t('Failed to signup')}</span>
                  <span>{'!'}</span>
               </>,
               { appearance: 'error' }
            )
         }
      },
      onError: error => {
         setLoading(false)
         if (error.message.includes('customer__phoneNumber_key')) {
            setPhoneError(<span>{t('Phone number already exist')}</span>)
         }
         console.error(error)
      },
   })

   const isValid =
      validateEmail(form.email) &&
      !emailExists &&
      form.password &&
      form.password.length >= 6 &&
      form.phone &&
      form.phone.length > 0 &&
      isValidPhoneNumber(form.phone)

   const onEmailBlur = async e => {
      const { value } = e.target
      if (validateEmail(value)) {
         await checkCustomerExistence(value)
      } else {
         setEmailError(
            <>
               <span>{t('Must be a valid email')}</span>
               <span>{'!'}</span>
            </>
         )
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
         if (await checkCustomerExistence(form.email)) {
            return
         }
         setError('')
         setLoading(true)
         const isCodeValid = await isReferralCodeValid(
            brand.id,
            form.code,
            true
         )
         if (!isCodeValid) {
            deleteStoredReferralCode()
            return setError(
               <>
                  <span>{t('Referral code is not valid')}</span>
                  <span>{'!'}</span>
               </>
            )
         }
         if (form.code) {
            setStoredReferralCode(form.code)
         }

         const url = `/api/hash`
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
         setError(
            <>
               <span>{t('Failed to register, please try again')}</span>
               <span>{'!'}</span>
            </>
         )
         addToast(
            <>
               <span>{t('Failed to register, please try again')}</span>
               <span>{'!'}</span>
            </>,
            {
               appearance: 'error',
            }
         )
      }
   }

   return (
      <div className="hern-signup-v1">
         <fieldset className="hern-login-v1__fieldset">
            <label className="hern-login-v1__label" htmlFor="email">
               <span> {t('Email')}</span>
            </label>
            <input
               name="email"
               type="text"
               className="hern-login-v1__input"
               onChange={onChange}
               value={form.email}
               placeholder="Enter your email"
               onBlur={onEmailBlur}
               required
            />
         </fieldset>
         {emailError && (
            <span className="hern-signup-v1__signup-error">{emailError}</span>
         )}
         {/* !emailExists */}
         <>
            <fieldset
               className="hern-login-v1__fieldset"
               style={passwordError ? { marginBottom: '0.25rem' } : null}
            >
               <label className="hern-login-v1__label" htmlFor="password">
                  <span>{t('Password')}</span>
               </label>
               <input
                  className="hern-login-v1__input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  onChange={onChange}
                  value={form.password}
                  placeholder="Enter your password"
                  onBlur={e =>
                     e.target.value.length < 6
                        ? setPasswordError(
                             <>
                                <span>
                                   {t(
                                      'Password must be at least 6 letters long'
                                   )}
                                </span>
                                <span>{'!'}</span>
                             </>
                          )
                        : setPasswordError('')
                  }
               />
            </fieldset>
            <div className="hern-signup-v1__password-config">
               <CheckBoxIcon
                  showTick={showPassword}
                  size={18}
                  onClick={() => {
                     setShowPassword(prevState => !prevState)
                  }}
                  style={{ cursor: 'pointer' }}
               />
               <span>{t('Show password')}</span>
            </div>
            {passwordError && (
               <span className="hern-signup-v1__signup-error">
                  {passwordError}
               </span>
            )}
            <fieldset
               className="hern-login-v1__fieldset"
               style={phoneError ? { marginBottom: '0.25rem' } : null}
            >
               <label className="hern-login-v1__label" htmlFor="phone">
                  <span> {t('Phone Number')}</span>
               </label>
               <PhoneInput
                  className={`hern-login-v1__otp__phone__input hern-login-v1__otp__phone__input${
                     !(form.phone === '' || form.phone === undefined) &&
                     !(form.phone && isValidPhoneNumber(form.phone))
                        ? '-invalid'
                        : '-valid'
                  }`}
                  initialValueFormat="national"
                  value={form.phone}
                  onChange={e => {
                     if (
                        !(e === '' || e === undefined) &&
                        !(e && isValidPhoneNumber(e))
                     ) {
                        setPhoneError('Please enter a valid phone number')
                     } else {
                        setPhoneError('')
                        setForm(form => ({
                           ...form,
                           ['phone']: e,
                        }))
                     }
                  }}
                  defaultCountry={get_env('COUNTRY_CODE')}
                  placeholder="Enter your phone number"
               />
            </fieldset>
            {phoneError && (
               <span className="hern-signup-v1__signup-error">
                  {phoneError}
               </span>
            )}
            {isReferralFieldVisible ? (
               <fieldset className="hern-login-v1__fieldset">
                  <label className="hern-login-v1__label" htmlFor="code">
                     {t('Referral Code')}
                  </label>
                  <input
                     className="hern-login-v1__input"
                     name="code"
                     type="text"
                     onChange={onChange}
                     value={form.code}
                     placeholder="Enter referral code"
                  />
               </fieldset>
            ) : (
               <button
                  className="hern-signup-v1__referral-code"
                  onClick={() => setIsReferralFieldVisible(true)}
               >
                  {t('Got a referral code?')}
               </button>
            )}
            <section className="hern-signup-v1__signup__term">
               <input
                  className="hern-signup__signup__term__checkbox"
                  type="checkbox"
                  name="terms&copy;conditions"
                  id="terms&copy;conditions"
                  onChange={() => setHasAccepted(!hasAccepted)}
               />
               <label
                  className="hern-login-v1__label"
                  htmlFor="terms&copy;conditions"
                  style={{ marginLeft: '4px' }}
               >
                  {t('I accept')}{' '}
                  <Link href={getRoute('/terms-and-conditions')}>
                     <a className="hern-signup__signup__term__link">
                        {t('terms and conditions')}
                     </a>
                  </Link>
               </label>
            </section>
            <button
               className={`hern-signup-v1__signup__submit ${
                  !hasAccepted || !isValid || loading
                     ? 'hern-signup-v1__signup__submit--disabled'
                     : ''
               }`}
               onClick={() => isValid && submit()}
            >
               {loading ? t('REGISTERING') : t('REGISTER')}
            </button>
         </>
         {error && (
            <span className="hern-signup-v1__signup-error">{error}</span>
         )}
      </div>
   )
}

const PROVIDERS = gql`
   query PROVIDERS {
      settings_authProvider {
         title
         value
      }
   }
`
