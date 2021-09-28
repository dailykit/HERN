import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/client'
import { Wrapper, FormWrap } from './styles'
import ForgotPassword from './forgotPassword'
import Button from '../Button'
import InlineLoader from '../InlineLoader'
import Error from '../Error'
import Input from '../Input'

export default function LoginComp({ isClicked, authBtnClassName, ...rest }) {
   const [loading, setLoading] = useState(false)
   const [isForgotPasswordClicked, setIsForgotPasswordClicked] =
      React.useState(false)
   const [error, setError] = useState('')
   const [email, setEmail] = useState('')
   const [password, setPassword] = useState('')

   const handleSubmit = async e => {
      try {
         e.preventDefault()
         setLoading(true)
         const response = await signIn('email_password', {
            redirect: false,
            email,
            password
         })
         setLoading(false)
         if (response?.status !== 200) {
            setError('Email or password is incorrect!')
         } else if (response?.status === 200) {
            console.log('logged in')
            redirect()
         }
      } catch (err) {
         setLoading(false)
         console.error(err)
         setError('Email or password is incorrect!')
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
                        disabled={loading}
                        type="submit"
                        className="loginBtn"
                     >
                        {loading ? <InlineLoader /> : 'Log in'}
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
