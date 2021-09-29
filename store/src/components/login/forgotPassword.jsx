import React from 'react'
import { useMutation } from '@apollo/client'
import { Wrapper, FormWrap } from './styles'
import Button from '../Button'
import Error from '../Error'
import InlineLoader from '../InlineLoader'
import Input from '../Input'
import { ChevronLeft } from '../Icons'
import { isClient } from '../../utils'
import { FORGOT_PASSWORD } from '../../graphql'
import { theme } from '../../theme'

export default function ForgotPassword({ close, authBtnClassName, ...props }) {
   const [error, setError] = React.useState('')
   const [email, setEmail] = React.useState('')
   const isValid = email
   const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD, {
      onCompleted: () => {
         alert('Email sent!')
         setEmail('')
         setError('')
         window.location.href = `${window.location.origin}`
      },
      onError: error => {
         console.log(error)
      }
   })

   const handleSubmit = async () => {
      try {
         setError('')
         if (isClient) {
            const origin = window.location.origin
            forgotPassword({
               variables: {
                  email: email,
                  origin
               }
            })
         }
      } catch (error) {
         if (error?.code === 401) {
            setError('Email or password is incorrect!')
         }
      }
   }

   // if (loading) {
   //   return <InlineLoader />;
   // }

   return (
      <Wrapper>
         <div className="flex">
            <span
               title="Back to login"
               className="back-to-login"
               onClick={close}
            >
               <ChevronLeft size="20" color="#fff" />
            </span>
            <h1 className="heading">Forgot Password</h1>
         </div>
         <FormWrap {...props} onSubmit={handleSubmit}>
            <Input
               type="email"
               placeholder="Your email"
               className="customInput"
               required
               value={email}
               onChange={e => setEmail(e.target.value)}
            />
            {error && <Error>{error}</Error>}
            <div className={`loginBtnWrap ${authBtnClassName}`}>
               <Button
                  type="submit"
                  disabled={!isValid}
                  className={!isValid || loading ? 'disabled' : 'loginBtn'}
               >
                  {loading ? (
                     <InlineLoader color={theme.colors.textColor4} />
                  ) : (
                     'Send Email'
                  )}
               </Button>
            </div>
         </FormWrap>
      </Wrapper>
   )
}
