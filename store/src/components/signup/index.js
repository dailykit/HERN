import React, { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/client'
import axios from 'axios'
import { Wrapper, FormWrap } from './styles'
import Button from '../Button'
import Error from '../Error'
import Input from '../Input'
import InlineLoader from '../InlineLoader'
import { theme } from '../../theme'

export default function Signup({ authBtnClassName, ...rest }) {
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState('')
   const [name, setName] = useState('')
   const [email, setEmail] = useState('')
   const [password, setPassword] = useState('')
   const [confirmPassword, setConfirmPassword] = useState('')

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
         <h1 className="heading text2">Sign Up</h1>
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
               <Input
                  type="password"
                  placeholder="Enter password"
                  className="customInput text8"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={6}
               />
               <Input
                  type="password"
                  placeholder="Confirm password"
                  className="customInput text8"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
               />
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
