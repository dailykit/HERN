import { Button, Loader } from '.'
import Link from 'next/link'
import { useConfig } from '../lib'
import classNames from 'classnames'
import React, { useState } from 'react'
import Countdown from 'react-countdown'
import { signIn, getSession, providers } from 'next-auth/client'
import { detectCountry, getRoute, get_env, isClient } from '../utils'
import PhoneInput, {
   formatPhoneNumber,
   formatPhoneNumberIntl,
   isValidPhoneNumber,
} from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { useToasts } from 'react-toast-notifications'
import {
   CheckBoxIcon,
   CloseIcon,
   FacebookIcon,
   GoogleIcon,
} from '../assets/icons'
import {
   FORGOT_PASSWORD,
   INSERT_OTP_TRANSACTION,
   INSERT_PLATFORM_CUSTOMER,
   MUTATIONS,
   OTPS,
   PLATFORM_CUSTOMERS,
   RESEND_OTP,
   SEND_SMS,
} from '../graphql'
import {
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
import { useRouter } from 'next/router'

const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const Login = props => {
   //props
   const {
      closeLoginPopup,
      loginBy = 'email',
      forceLogin = false,
      isSilentlyLogin = true,
      singleLoginMethod = false,
      callbackURL,
      socialLogin = true,
   } = props

   //loginBy --> initial login method ('email', 'otp' , 'signup', 'forgotPassword').
   //isSilentlyLogin --> page not reload after login.
   //closeLoginPopup --> fn to close popup.
   //forceLogin --> disable close icon and only close when successfully signup or login.
   //singleLoginMethod --> only use one method for log in either email or phone num. (based on loginBy).
   //callbackURL --> callback url for signIn (string)
   //socialLogin --> need social login or not
   const router = useRouter()

   //component state
   const [defaultLogin, setDefaultLogin] = useState(loginBy)

   return (
      <div className="hern-login-v1-content">
         <div className="hern-login-v1-header">
            {(defaultLogin === 'email' || defaultLogin === 'otp') && (
               <span>Log in</span>
            )}

            {defaultLogin === 'forgotPassword' && <span>Forgot Password</span>}
            {defaultLogin === 'signup' && <span>Sign Up</span>}

            {!forceLogin && (
               <CloseIcon
                  size={18}
                  stroke={'#404040'}
                  style={{ cursor: 'pointer' }}
                  onClick={closeLoginPopup}
               />
            )}
         </div>
         {forceLogin && (
            <div className="hern-login-v1__custom-warning">
               You must login first to access this page.
               <span
                  onClick={() => {
                     if (isClient) {
                        window.location.href =
                           get_env('BASE_BRAND_URL') + getRoute('/')
                     }
                  }}
               >
                  Go To Home
               </span>
            </div>
         )}
         <section>
            {/* email login  or phone number login*/}
            {defaultLogin === 'email' && (
               <Email
                  setDefaultLogin={setDefaultLogin}
                  isSilentlyLogin={isSilentlyLogin}
                  closeLoginPopup={closeLoginPopup}
                  callbackURL={callbackURL}
               />
            )}
            {defaultLogin === 'otp' && (
               <OTPLogin
                  closeLoginPopup={closeLoginPopup}
                  isSilentlyLogin={isSilentlyLogin}
                  callbackURL={callbackURL}
               />
            )}
            {defaultLogin === 'forgotPassword' && (
               <ForgotPassword closeLoginPopup={closeLoginPopup} />
            )}
            {defaultLogin === 'signup' && (
               <Signup
                  setDefaultLogin={setDefaultLogin}
                  isSilentlyLogin={isSilentlyLogin}
                  closeLoginPopup={closeLoginPopup}
                  callbackURL={callbackURL}
               />
            )}
            {/* {defaultLogin === 'email' ? <Email /> : <OTPLogin />} */}

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
                        {defaultLogin === 'email'
                           ? 'Log in with Phone Number'
                           : 'Log in with Email'}
                     </Button>
                  </div>
               </>
            )}

            {/* google or facebook */}
            {socialLogin && <SocialLogin callbackURL={callbackURL} />}
         </section>
         {defaultLogin !== 'signup' && (
            <footer className="hern-login-v1__footer">
               <span>No account? </span>{' '}
               <button
                  className="hern-login-v1__create-one-btn"
                  onClick={() => {
                     setDefaultLogin('signup')
                  }}
               >
                  Create one
               </button>
            </footer>
         )}
      </div>
   )
}

//email log in
const Email = props => {
   //props
   const { setDefaultLogin, isSilentlyLogin, closeLoginPopup, callbackURL } =
      props
   const { addToast } = useToasts()
   //component state
   const [loading, setLoading] = React.useState(false)
   const [error, setError] = React.useState('')
   const [form, setForm] = React.useState({
      email: '',
      password: '',
   })
   const [showPassword, setShowPassword] = useState(false)

   const isValid = React.useMemo(() => form.email && form.password, [form])

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
            setError('Email or password is incorrect!')
            addToast('Email or password is incorrect!', {
               appearance: 'error',
            })
         } else if (response?.status === 200) {
            // fb pixel integration for tracking customer login
            ReactPixel.trackCustom('login', {
               email: form.email,
               phone: form.phone,
            })
            addToast('Login successfully!', { appearance: 'success' })
            const landedOn = isClient && localStorage.getItem('landed_on')
            if (!isSilentlyLogin) {
               if (isClient && landedOn) {
                  localStorage.removeItem('landed_on')
                  window.location.href = landedOn
               } else {
                  window.location.href = getRoute('/menu')
               }
            } else {
               closeLoginPopup()
            }
         }
      } catch (error) {
         console.error(error)
         addToast('Login failed', {
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
               Email*
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
               Password*
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
               <span>Show password</span>
            </div>
            <span
               className="hern-login-v1__forgot-password"
               onClick={() => {
                  setDefaultLogin('forgotPassword')
               }}
            >
               Forgot password?{' '}
            </span>
         </div>
         {error && <span className="hern-login-v1__error">{error}</span>}

         <Button
            className={classNames('hern-login-v1__login-btn', {
               'hern-login-v1__login-btn--disabled': !isValid || loading,
            })}
            onClick={() => isValid && submit()}
         >
            {loading ? 'LOGGING IN...' : 'LOGIN'}
         </Button>
      </div>
   )
}

//  login with otp
const OTPLogin = props => {
   //props
   const { isSilentlyLogin, closeLoginPopup, callbackURL } = props
   const { addToast } = useToasts()

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

   //check user already exist
   const [checkCustomerExistence] = useLazyQuery(PLATFORM_CUSTOMERS, {
      onCompleted: ({ customers = [] }) => {
         if (customers.length === 0) {
            setIsNewUser(true)
         }
      },
      onError: () => {},
   })

   //resend otp
   const [resendOTP] = useMutation(RESEND_OTP, {
      onCompleted: () => {
         setResending(false)
         setTime(Date.now() + 120000)
         addToast('OTP has been sent!', { appearance: 'success' })
      },
      onError: error => {
         console.error(error)
         addToast('Failed to send OTP!', { appearance: 'error' })
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

   //send sms on valid phone number
   const [sendSms] = useMutation(SEND_SMS, {
      onCompleted: () => {
         setHasOtpSent(true)
         setSendingOtp(false)
         setTime(Date.now() + 120000)
         addToast('OTP has been sent!', { appearance: 'success' })
      },
      onError: error => {
         console.error(error)
         setSendingOtp(false)
         setError('Failed to send otp, please try again!')
         addToast('Failed to send OTP!', { appearance: 'error' })
      },
   })

   //insert a entry of phone number in table and get otp code then send sms
   const [insertOtpTransaction] = useMutation(INSERT_OTP_TRANSACTION, {
      onCompleted: async ({ insertOtp = {} } = {}) => {
         if (insertOtp?.code) {
            setOtpId(insertOtp?.id)
            await sendSms({
               variables: {
                  phone: `${form.phone}`,
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
         addToast('Failed to send OTP!', { appearance: 'error' })
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
            addToast('Please enter the OTP!', {
               appearance: 'error',
            })
            setLoading(false)
            return
         }
         const emailRegex =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
         if (isNewUser && !emailRegex.test(form.email)) {
            setError('Please enter a valid email!')
            addToast('Please enter a valid email!', {
               appearance: 'error',
            })
            setLoading(false)
            return
         }

         setError('')
         const response = await signIn('otp', {
            redirect: false,
            ...form,
            ...(callbackURL && { callbackUrl: callbackURL }),
         })
         if (response?.status === 200) {
            const landedOn = localStorage.getItem('landed_on')
            addToast('Login successfully!', { appearance: 'success' })
            if (!isSilentlyLogin) {
               if (landedOn) {
                  localStorage.removeItem('landed_on')
                  window.location.href = landedOn
               } else {
                  window.location.href = getRoute('/menu')
               }
            } else {
               closeLoginPopup()
            }
         } else {
            setLoading(false)
            setError('Entered OTP is incorrect, please try again!')
            addToast('Entered OTP is incorrect!', {
               appearance: 'error',
            })
         }
      } catch (error) {
         setLoading(false)
         console.error(error)
         addToast('Failed to log in, please try again!', {
            appearance: 'error',
         })
         setError('Failed to log in, please try again!')
      }
   }

   //handle send otp btn to send otp on phone number
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
         console.log('error is this', error)
         setError('Failed to send otp, please try again!')
         addToast('Failed to send OTP!', { appearance: 'error' })
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
                  <label className="hern-login-v1__label">Phone Number*</label>
                  <PhoneInput
                     className={`hern-login-v1__otp__phone__input hern-login-v1__otp__phone__input${
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
                     placeholder="Enter your phone number"
                     onKeyPress={handleSendOTPKeyPress}
                  />
               </fieldset>
               <button
                  className={`hern-login-v1__otp-submit ${
                     !(
                        (form.phone && isValidPhoneNumber(form.phone)) ||
                        sendingOtp
                     )
                        ? 'hern-login-v1__otp-submit--disabled'
                        : ''
                  }`}
                  onClick={sendOTP}
                  disabled={
                     !(
                        (form.phone && isValidPhoneNumber(form.phone)) ||
                        sendingOtp
                     )
                  }
                  style={{ height: '40px' }}
               >
                  {sendingOtp ? 'SENDING OTP...' : 'SEND OTP'}
               </button>
            </>
         ) : (
            <>
               {isNewUser && (
                  <fieldset className="hern-login-v1__fieldset">
                     <label className="hern-login-v1__label">Email*</label>
                     <input
                        className="hern-login-v1__input"
                        name="email"
                        type="text"
                        onChange={onChange}
                        value={form.email}
                        placeholder="Enter your email"
                     />
                  </fieldset>
               )}
               <fieldset className="hern-login-v1__fieldset">
                  <label className="hern-login-v1__label">OTP*</label>
                  <input
                     className="hern-login-v1__input"
                     name="otp"
                     type="text"
                     onChange={onChange}
                     value={form.otp}
                     placeholder="Enter the otp"
                     onKeyPress={handleSubmitOTPKeyPress}
                  />
               </fieldset>
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
                  SUBMIT
               </button>
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
                                 className={`hern-login-v1__otp__resend ${
                                    resending
                                       ? 'hern-login-v1__otp__resend--disabled'
                                       : ''
                                 }`}
                              >
                                 Resend OTP
                              </button>
                           )
                        }
                        return (
                           <span className="hern-login-v1__otp__resend__time">
                              Resend OTP in 0{minutes}:{seconds <= 9 ? '0' : ''}
                              {seconds}
                           </span>
                        )
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

   //fetch all available provider
   const {
      loading: providerLoading,
      error: providerError,
      data: { settings_authProvider = [] } = {},
   } = useQuery(PROVIDERS)

   if (providerError) {
      return <p>Some went wrong</p>
   }

   if (!providerLoading && settings_authProvider.length === 0) {
      return null
   }

   const handleSocialOnClick = option => {
      signIn(option)
   }

   return (
      <>
         <DividerBar text={'or sign in with'} />
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
const ForgotPassword = props => {
   //props
   const { closeLoginPopup } = props

   const { addToast } = useToasts()
   const { configOf } = useConfig()

   const theme = configOf('theme-color', 'Visual')

   const [error, setError] = React.useState('')
   const [form, setForm] = React.useState({
      email: '',
   })

   const isValid = form.email

   const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD, {
      onCompleted: () => {
         addToast('Email sent!', { appearance: 'success' })
         closeLoginPopup()
      },
      onError: error => {
         addToast(error.message, { appearance: 'error' })
      },
   })

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
         if (isClient) {
            const origin = get_env('BASE_BRAND_URL')
            forgotPassword({
               variables: {
                  email: form.email,
                  origin,
               },
            })
         }
      } catch (error) {
         if (error?.code === 401) {
            setError('Email or password is incorrect!')
            addToast('Email or password is incorrect!', { appearance: 'error' })
         }
      }
   }
   return (
      <div className="hern-forgot-password-v1">
         <fieldset className="hern-login-v1__fieldset">
            <label htmlFor="email" className="hern-login-v1__label">
               Email*
            </label>
            <input
               className="hern-login-v1__input"
               type="email"
               name="email"
               id="email"
               value={form.email}
               onChange={onChange}
               placeholder="Enter your email"
            />
         </fieldset>
         <button
            className={classNames('hern-forgot-password-v1__submit-btn', {
               'hern-forgot-password-v1__submit-btn--disabled':
                  !isValid || loading,
            })}
            disabled={!isValid || loading}
            style={{ height: '40px' }}
            onClick={() => isValid && submit()}
         >
            SEND EMAIL
         </button>
         {error && (
            <span className="hern-forgot-password-v1__error">{error}</span>
         )}
      </div>
   )
}

//divider bar
const DividerBar = props => {
   const { text } = props
   return (
      <div className="hern-login-v1-divider-bar">
         <span>{text || 'or'}</span>
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
   const { setDefaultLogin, isSilentlyLogin, closeLoginPopup, callbackURL } =
      props

   //component state
   const [showPassword, setShowPassword] = useState(false)
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

   const [checkCustomerExistence] = useLazyQuery(PLATFORM_CUSTOMERS, {
      onCompleted: ({ customers = [] }) => {
         if (customers.length > 0) {
            setEmailExists(true)
            addToast('User already exist', { appearance: 'info' })
         }
      },
      onError: () => {},
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
                  ...(callbackURL && { callbackUrl: callbackURL }),
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
                  addToast('Login successfully', { appearance: 'success' })
                  if (!isSilentlyLogin) {
                     window.location.href =
                        get_env('BASE_BRAND_URL') +
                        getRoute('/get-started/select-plan')
                  } else {
                     closeLoginPopup()
                  }
                  setLoading(false)
               } else {
                  setLoading(false)
                  setError('Failed to signup, please try again!')
                  addToast('Failed to signup!', { appearance: 'error' })
               }
            }
         } catch (error) {
            console.error(error)
            addToast('Failed to signup!', { appearance: 'error' })
         }
      },
      onError: error => {
         setLoading(false)
         if (error.message.includes('customer__phoneNumber_key')) {
            setPhoneError('Phone no. already exist')
         }
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
            closeLoginPopup()
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

   const onEmailBlur = async e => {
      const { value } = e.target
      if (validateEmail(value)) {
         setEmailError('')
         // const url =
         //    new URL(get_env('DATA_HUB_HTTPS')).origin +
         //    '/server/api/customer/' +
         //    value
         // const { status, data } = await axios.get(url)
         // console.log('existStatus', status, url, typeof data, data)
         // if (status === 200 && data?.success && data?.data?.id) {
         //    setEmailExists(true)
         // } else {
         //    setEmailExists(false)
         // }
         checkCustomerExistence({
            variables: { where: { email: { _eq: value } } },
         })
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

         const url = `${get_env('BASE_BRAND_URL')}/api/hash`
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
         addToast('Failed to register, please try again!', {
            appearance: 'error',
         })
      }
   }

   return (
      <div className="hern-signup-v1">
         <fieldset className="hern-login-v1__fieldset">
            <label className="hern-login-v1__label" htmlFor="email">
               Email*
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
         {!emailExists ? (
            <>
               <fieldset
                  className="hern-login-v1__fieldset"
                  style={passwordError ? { marginBottom: '0.25rem' } : null}
               >
                  <label className="hern-login-v1__label" htmlFor="password">
                     Password*
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
                                'Password must be at least 6 letters long!'
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
                  <span>Show password</span>
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
                     Phone Number*
                  </label>
                  <PhoneInput
                     className={`hern-login-v1__otp__phone__input hern-login-v1__otp__phone__input${
                        !(form.phone && isValidPhoneNumber(form.phone))
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
                        Referral Code
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
                     Got a referral code?
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
                     I accept{' '}
                     <Link href={getRoute('/terms-and-conditions')}>
                        <a className="hern-signup__signup__term__link">
                           terms and conditions.
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
                  {loading ? 'REGISTERING...' : 'REGISTER'}
               </button>
            </>
         ) : (
            <>
               <p className="hern-signup-v1__signup__email-already-exits">
                  Looks like your email already exists. If you remember your
                  password then go to&nbsp;
                  <button
                     className="hern-signup-v1__signup__login-switch"
                     onClick={() => setDefaultLogin('email')}
                  >
                     login
                  </button>
                  &nbsp;or
               </p>
               <button
                  onClick={() =>
                     forgotPassword({
                        variables: {
                           email: form.email,
                           origin: location.origin,
                           type: 'set_password',
                           ...(isClient &&
                              !isSilentlyLogin &&
                              localStorage.getItem('landed_on') && {
                                 redirectUrl: localStorage.getItem('landed_on'),
                              }),
                        },
                     })
                  }
                  className={`hern-login-v1__login-btn ${
                     !form.email || forgotPasswordLoading
                        ? 'hern-login-v1__login-btn--disabled'
                        : ''
                  }`}
                  style={{ height: '40px', margin: '0', color: '#ffffff' }}
               >
                  {forgotPasswordLoading
                     ? 'SENDING EMAIL...'
                     : 'SEND LOGIN EMAIL'}
               </button>
               {forgotPasswordText && (
                  <p className="hern-signup-v1__signup__forgot-text">
                     {forgotPasswordText}
                  </p>
               )}
            </>
         )}
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
