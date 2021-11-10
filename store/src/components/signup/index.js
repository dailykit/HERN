import React, { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/client'
import axios from 'axios'
import { Wrapper, FormWrap } from './styles'
import Button from '../Button'
import Error from '../Error'
import Input from '../Input'
import { useUser } from '../../Providers'
import InlineLoader from '../InlineLoader'
import { theme } from '../../theme'

export default function Signup({ authBtnClassName, ...rest }) {
   const { toggleAuthenticationModal } = useUser()
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState('')
   const [name, setName] = useState('')
   const [email, setEmail] = useState('')
   const [password, setPassword] = useState({ value: '', showPassword: false })
   const [confirmPassword, setConfirmPassword] = useState({
      value: '',
      showPassword: false
   })

   const handleSubmit = async e => {
      try {
         e.preventDefault()
         setLoading(true)
         setError('')
         if (password !== confirmPassword) {
            throw new Error('Passwords do not match!')
         }
         const options = {
            url: `${window.location.origin}/api/register`,
            method: 'POST',
            data: {
               name,
               email,
               password
            }
         }
         const { data } = await axios(options)
         if (data.success) {
            toggleAuthenticationModal(false)
            const response = await signIn('email_password', {
               email,
               password,
               redirect: false
            })
            console.log({ responsefromSignup: response })
            if (response?.status === 200) {
               setLoading(false)
               redirect()
            }
         }
      } catch (error) {
         console.log(error)
         toggleAuthenticationModal(false)
         if (error?.message?.includes('exists')) {
            return setError('Email is already in use!')
         }
         setError('Failed to register, please try again!')
      } finally {
         setLoading(false)
      }
   }

   return (
      <Wrapper {...rest} onSubmit={handleSubmit}>
         {/* <p className="redirectToLogin">
            Already have an account?{' '}
            <Link href="/login">
               <a>Log In</a>
            </Link>
         </p> */}
         {/* <h1 className="heading text2">Sign Up</h1> */}
         <div className="center-div-wrapper">
            <FormWrap {...rest}>
               <Input
                  type="text"
                  placeholder="Your name"
                  className="customInput text8"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
               />
               <Input
                  type="email"
                  placeholder="Your email"
                  className="customInput text8"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
               />
               <div className="password-wrap">
                  <Input
                     type={password?.showPassword ? 'text' : 'password'}
                     placeholder="Enter password"
                     className="customInput text8"
                     required
                     value={password.value}
                     onChange={e =>
                        setPassword(prev => ({
                           ...prev,
                           value: e.target.value
                        }))
                     }
                     minLength={6}
                  />
                  <span
                     className="eye-icon"
                     onClick={() =>
                        setPassword(prev => ({
                           ...prev,
                           showPassword: !prev.showPassword
                        }))
                     }
                  >
                     <i
                        class={
                           password.showPassword
                              ? 'fas fa-eye'
                              : 'fas fa-eye-slash'
                        }
                     ></i>
                  </span>
               </div>
               <div className="password-wrap">
                  <Input
                     type={confirmPassword?.showPassword ? 'text' : 'password'}
                     placeholder="Confirm password"
                     className="customInput text8"
                     required
                     value={confirmPassword.value}
                     onChange={e =>
                        setConfirmPassword(prev => ({
                           ...prev,
                           value: e.target.value
                        }))
                     }
                  />
                  <span
                     className="eye-icon"
                     onClick={() =>
                        setConfirmPassword(prev => ({
                           ...prev,
                           showPassword: !prev.showPassword
                        }))
                     }
                  >
                     <i
                        class={
                           confirmPassword.showPassword
                              ? 'fas fa-eye'
                              : 'fas fa-eye-slash'
                        }
                     ></i>
                  </span>
               </div>
               {error && <Error>{error}</Error>}

               <p className="login_title text9">
                  ALREADY SIGNED UP?
                  <span onClick={() => rest.setShowContent('login')}>
                     LOGIN
                  </span>
               </p>
            </FormWrap>
            <div className={`signupBtnWrap ${authBtnClassName}`}>
               <Button
                  onClick={handleSubmit}
                  className="signupBtn text3"
                  disabled={loading}
               >
                  {loading ? (
                     <InlineLoader color={theme.colors.textColor4} />
                  ) : (
                     'Sign Up'
                  )}
               </Button>
            </div>
         </div>
      </Wrapper>
   )
}

const redirect = () => {
   window.location.href = `${window.location.origin}/categoryTag`
}
