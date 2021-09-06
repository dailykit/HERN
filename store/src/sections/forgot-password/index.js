import React from 'react'
import { useToasts } from 'react-toast-notifications'
import { useMutation } from '@apollo/react-hooks'
import classNames from 'classnames'

import { isClient } from '../../utils'
import { FORGOT_PASSWORD } from '../../graphql'
import { useConfig } from '../../lib'

export const ForgotPassword = () => {
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
      <div className="hern-forgot-password">
         <div
            className="hern-forgot-password__heading"
            style={{
               color: `${
                  theme?.accent ? theme?.accent : 'color: rgba(5, 150, 105, 1'
               }`,
            }}
         >
            Forgot Password
         </div>
         <div className="hern-forgot-password__wrapper">
            <fieldset className="hern-forgot-password__field">
               <label className="hern-forgot-password__label" htmlFor="email">
                  Email*
               </label>
               <input
                  className="hern-forgot-password__input"
                  type="email"
                  name="email"
                  id="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="Enter your email"
               />
            </fieldset>
            <button
               className={classNames('hern-forgot-password__submit-btn', {
                  'hern-forgot-password__submit-btn--disabled':
                     !isValid || loading,
               })}
               disabled={!isValid || loading}
               onClick={() => isValid && submit()}
            >
               Send Email
            </button>
            {error && (
               <span className="hern-forgot-password__error">{error}</span>
            )}
         </div>
      </div>
   )
}
