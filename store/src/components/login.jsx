import { Button } from '.'
import classNames from 'classnames'
import React, { useState } from 'react'
import Countdown from 'react-countdown'
import { signIn } from 'next-auth/client'
import { getRoute, isClient } from '../utils'
import { CheckBoxIcon, CloseIcon } from '../assets/icons'
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
import { useLazyQuery, useMutation, useSubscription } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'
import { useConfig } from '../lib'

const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const Login = props => {
   const { loginBy = 'otp' } = props
   const [defaultLogin, setDefaultLogin] = useState(loginBy)
   return (
      <div className="hern-login-v1-container">
         <div className="hern-login-v1-content">
            <header className="hern-login-v1-header">
               {(defaultLogin === 'email' || defaultLogin === 'otp') && (
                  <span>Log in</span>
               )}
               {defaultLogin === 'forgotPassword' && (
                  <span>Forgot Password</span>
               )}

               <CloseIcon
                  size={18}
                  stroke={'#404040'}
                  style={{ cursor: 'pointer' }}
               />
            </header>
            <section>
               {/* email login  or phone number login*/}
               {defaultLogin === 'email' && (
                  <Email setDefaultLogin={setDefaultLogin} />
               )}
               {defaultLogin === 'otp' && <OTPLogin />}
               {defaultLogin === 'forgotPassword' && <ForgotPassword />}
               {/* {defaultLogin === 'email' ? <Email /> : <OTPLogin />} */}

               <DividerBar />
               <div style={{ margin: '1em' }}>
                  <Button
                     className="hern-login-login-switcher-btn"
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

               {/* google or facebook */}
            </section>
            <footer className="hern-login-v1__footer">
               <span>No account? </span>{' '}
               <button className="hern-login-v1__create-one-btn">
                  Create one
               </button>
            </footer>
         </div>
      </div>
   )
}

//email log in
const Email = props => {
   //props
   const { setDefaultLogin } = props

   //component state
   const [loading, setLoading] = React.useState(false)
   const [error, setError] = React.useState('')
   const [form, setForm] = React.useState({
      email: '',
      password: '',
   })
   const [showPassword, setShowPassword] = useState(false)

   const isValid = form.email && form.password

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
         })
         setLoading(false)
         if (response?.status !== 200) {
            setError('Email or password is incorrect!')
         } else if (response?.status === 200) {
            // fb pixel integration for tracking customer login
            ReactPixel.trackCustom('login', {
               email: form.email,
               phone: form.phone,
            })
            const landedOn = isClient && localStorage.getItem('landed_on')
            if (isClient && landedOn) {
               localStorage.removeItem('landed_on')
               window.location.href = landedOn
            } else {
               window.location.href = getRoute('/menu')
            }
         }
      } catch (error) {
         console.error(error)
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
const OTPLogin = () => {
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
      <div className="hern-login-v1__otp">
         {!hasOtpSent ? (
            <>
               <fieldset className="hern-login-v1__fieldset">
                  <label className="hern-login-v1__label">Phone Number*</label>
                  <input
                     className="hern-login-v1__input"
                     type="text"
                     name="phone"
                     value={form.phone}
                     onChange={onChange}
                     placeholder="Enter your phone number"
                  />
               </fieldset>
               <button
                  className={`hern-login-v1__otp-submit ${
                     sendingOtp || !form.phone
                        ? 'hern-register__otp__submit--disabled'
                        : ''
                  }`}
                  disabled={sendingOtp || !form.phone}
               >
                  {sendingOtp ? 'SENDING OTP...' : 'SEND OTP'}
               </button>
            </>
         ) : (
            <>
               <fieldset className="hern-login-v1__fieldset">
                  <label className="hern-login-v1__label">OTP*</label>
                  <input
                     className="hern-login-v1__input"
                     name="otp"
                     type="text"
                     onChange={onChange}
                     value={form.otp}
                     placeholder="Enter the otp"
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
                           <span className="hern-register__otp__resend__time">
                              Resend OTP in 0{minutes}:{seconds <= 9 ? '0' : ''}
                              {seconds}
                           </span>
                        )
                     }}
                  />
               )}
            </>
         )}
         {error && <span className="hern-register__otp__error">{error}</span>}
      </div>
   )
}

// login with social media
const SocialLogin = () => {}

//forgot password
const ForgotPassword = () => {
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
            const origin = window.location.origin
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
