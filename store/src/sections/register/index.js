import React from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import Link from 'next/link'
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
      <section className="hern-register__wrapper">
         <ul className="hern-register__tab-list">
            <li
               className={`hern-register__tab${
                  current === 'LOGIN' ? '--active' : ''
               }`}
               onClick={() => setCurrent('LOGIN')}
            >
               Login
            </li>
            <li
               className={`hern-register__tab${
                  current === 'REGISTER' ? '--active' : ''
               }`}
               onClick={() => setCurrent('REGISTER')}
            >
               Register
            </li>
         </ul>
         {current === 'LOGIN' && <LoginPanel />}
         {current === 'REGISTER' && (
            <RegisterPanel
               setCurrent={setCurrent}
               providers={props.providers}
            />
         )}
         <div className="hern-register__providers">
            {props.providers &&
               Object.values(props.providers).map(provider => {
                  if (['Email', 'Credentials', 'OTP'].includes(provider.name)) {
                     return
                  }
                  return (
                     <div
                        className="hern-register__provider"
                        key={provider.name}
                     >
                        <button
                           className={`hern-register__provider__btn${
                              provider.name === 'Google' ? '--google' : ''
                           }`}
                           onClick={() => signIn(provider.id)}
                        >
                           Sign in with {provider.name}
                        </button>
                     </div>
                  )
               })}
            <button
               className="hern-register__provider__btn--phone"
               onClick={() => setIsViaOtp(true)}
            >
               Sign in with Phone Number
            </button>
         </div>
         {isViaOtp && <OTP setIsViaOtp={setIsViaOtp} />}
      </section>
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
                  phone: `+91${form.phone}`,
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
      <div className="hern-register__otp">
         <div className="hern-register__otp__wrapper">
            <header className="hern-register__otp__header">
               <h3 className="hern-register__otp__header__title">
                  Sign In via OTP
               </h3>
               <button
                  className="hern-register__otp__close"
                  onClick={() => setIsViaOtp(false)}
               >
                  <CloseIcon size={18} tw="stroke-current" />
               </button>
            </header>
            {!hasOtpSent ? (
               <>
                  <fieldset className="hern-register__otp__fieldset">
                     <label
                        className="hern-register__otp__label"
                        htmlFor="phone"
                     >
                        Phone Number*
                     </label>
                     <input
                        className="hern-register__otp__input"
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={onChange}
                        placeholder="Enter your phone number"
                     />
                  </fieldset>
                  <button
                     className={`hern-register__otp__submit${
                        sendingOtp || !form.phone ? '--disabled' : ''
                     }`}
                     onClick={sendOTP}
                     disabled={sendingOtp || !form.phone}
                  >
                     {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
                  </button>
               </>
            ) : (
               <>
                  {isNewUser && (
                     <fieldset className="hern-register__otp__fieldset">
                        <label
                           className="hern-register__otp__label"
                           htmlFor="email"
                        >
                           Email*
                        </label>
                        <input
                           className="hern-register__otp__input"
                           name="email"
                           type="text"
                           onChange={onChange}
                           value={form.email}
                           placeholder="Enter your email"
                        />
                     </fieldset>
                  )}
                  <fieldset className="hern-register__otp__fieldset">
                     <label className="hern-register__otp__label" htmlFor="otp">
                        OTP*
                     </label>
                     <input
                        className="hern-register__otp__input"
                        name="otp"
                        type="text"
                        onChange={onChange}
                        value={form.otp}
                        placeholder="Enter the otp"
                     />
                  </fieldset>
                  <button
                     className={`hern-register__otp__submit${
                        resending ||
                        loading ||
                        !form.otp ||
                        (isNewUser && !form.email)
                           ? '--disabled'
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
                     Submit
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
                                    className={`hern-register__otp__resend${
                                       resending ? '--disabled' : ''
                                    }`}
                                 >
                                    Resend OTP
                                 </button>
                              )
                           }
                           return (
                              <span className="hern-register__otp__resend__time">
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
               <span className="hern-register__otp__error">{error}</span>
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
      <section className="hern-register__login">
         <fieldset className="hern-register__login__fieldset">
            <label className="hern-register__login__label" htmlFor="email">
               Email*
            </label>
            <input
               className="hern-register__login__input"
               type="email"
               name="email"
               value={form.email}
               onChange={onChange}
               placeholder="Enter your email"
            />
         </fieldset>
         <fieldset className="hern-register__login__fieldset">
            <label className="hern-register__login__label" htmlFor="password">
               Password*
            </label>
            <input
               className="hern-register__login__input"
               name="password"
               type="password"
               onChange={onChange}
               value={form.password}
               placeholder="Enter your password"
            />
         </fieldset>
         <button
            className="hern-register__login__forgot-btn"
            onClick={() => router.push(getRoute('/forgot-password'))}
         >
            Forgot password?
         </button>
         <button
            className={`hern-register__login__submit${
               !isValid || loading ? '--disabled' : ''
            }`}
            onClick={() => isValid && submit()}
         >
            {loading ? 'Logging in...' : 'Login'}
         </button>
         {error && <span className="hern-register__login__error">{error}</span>}
      </section>
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
                     get_env('BASE_BRAND_URL') +
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
      }
   }

   return (
      <section className="hern-register__register">
         <fieldset
            className="hern-register__register__fieldset"
            style={emailError ? { marginBottom: '0.25rem' } : null}
         >
            <label className="hern-register__register__label" htmlFor="email">
               Email*
            </label>
            <input
               className="hern-register__register__input"
               type="email"
               name="email"
               value={form.email}
               onChange={onChange}
               placeholder="Enter your email"
               onBlur={onEmailBlur}
            />
         </fieldset>
         {emailError && (
            <span className="hern-register__register__error">{emailError}</span>
         )}
         {!emailExists ? (
            <>
               <fieldset
                  className="hern-register__register__fieldset"
                  style={passwordError ? { marginBottom: '0.25rem' } : null}
               >
                  <label
                     className="hern-register__register__label"
                     htmlFor="password"
                  >
                     Password*
                  </label>
                  <input
                     className="hern-register__register__input"
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
               </fieldset>
               {passwordError && (
                  <span className="hern-register__register__error">
                     {passwordError}
                  </span>
               )}
               <fieldset
                  className="hern-register__register__fieldset"
                  style={phoneError ? { marginBottom: '0.25rem' } : null}
               >
                  <label
                     className="hern-register__register__label"
                     htmlFor="phone"
                  >
                     Phone Number*
                  </label>
                  <input
                     className="hern-register__register__input"
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
               </fieldset>
               {phoneError && (
                  <span className="hern-register__register__error">
                     {phoneError}
                  </span>
               )}
               {isReferralFieldVisible ? (
                  <fieldset className="hern-register__register__fieldset">
                     <label
                        className="hern-register__register__label"
                        htmlFor="code"
                     >
                        Referral Code
                     </label>
                     <input
                        className="hern-register__register__input"
                        name="code"
                        type="text"
                        onChange={onChange}
                        value={form.code}
                        placeholder="Enter referral code"
                     />
                  </fieldset>
               ) : (
                  <button
                     className="hern-register__register__referral__btn"
                     onClick={() => setIsReferralFieldVisible(true)}
                  >
                     Got a referral code?
                  </button>
               )}
               <section className="hern-register__register__terms">
                  <input
                     className="hern-register__register__terms__checkbox"
                     type="checkbox"
                     name="terms&copy;conditions"
                     id="terms&copy;conditions"
                     onChange={() => setHasAccepted(!hasAccepted)}
                  />
                  <label
                     className="hern-register__register__label"
                     htmlFor="terms&copy;conditions"
                  >
                     I accept{' '}
                     <Link href={getRoute('/terms-and-conditions')}>
                        <a className="hern-register__register__terms__link">
                           terms and conditions.
                        </a>
                     </Link>
                  </label>
               </section>
               <button
                  className={`hern-register__register__submit${
                     !hasAccepted || !isValid || loading ? '--disabled' : ''
                  }`}
                  onClick={() => isValid && submit()}
               >
                  {loading ? 'Registering' : 'Register'}
               </button>
               <button
                  className="hern-register__register__login-switch"
                  onClick={() => setCurrent('LOGIN')}
               >
                  Login instead?
               </button>
            </>
         ) : (
            <>
               <p className="hern-register__register__email-already-exits">
                  Looks like your email already exists. If you remember your
                  password then go to&nbsp;
                  <button
                     className="hern-register__register__login-switch"
                     onClick={() => setCurrent('LOGIN')}
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
                              localStorage.getItem('landed_on') && {
                                 redirectUrl: localStorage.getItem('landed_on'),
                              }),
                        },
                     })
                  }
                  className={`hern-register__login__submit${
                     !form.email || forgotPasswordLoading ? '--disabled' : ''
                  }`}
               >
                  {forgotPasswordLoading
                     ? 'Sending email...'
                     : 'Send Login Email'}
               </button>
               {forgotPasswordText && (
                  <p className="hern-register__register__forgot-text">
                     {forgotPasswordText}
                  </p>
               )}
            </>
         )}
         {error && (
            <span className="hern-register__register__error">{error}</span>
         )}
      </section>
   )
}
