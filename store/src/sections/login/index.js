import React from 'react'
import { useRouter } from 'next/router'

import { getRoute, isClient } from '../../utils'
import { signIn } from 'next-auth/client'
import classNames from 'classnames'

const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const Login = () => {
   const [current, setCurrent] = React.useState('LOGIN')
   return (
      <main className="hern-login">
         <ul className="hern-login__tab-list">
            <li
               className={classNames('hern-login__tab', {
                  'hern-login__tab--active': current === 'LOGIN',
               })}
               onClick={() => setCurrent('LOGIN')}
            >
               Login
            </li>
         </ul>
         {current === 'LOGIN' && <LoginPanel />}
      </main>
   )
}

const LoginPanel = () => {
   const router = useRouter()
   const [loading, setLoading] = React.useState(false)
   const [error, setError] = React.useState('')
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
      <section className="hern-login__panel">
         <fieldset className="hern-login__fieldset">
            <label className="hern-login__label" htmlFor="email">
               Email*
            </label>

            <input
               type="email"
               name="email"
               className="hern-login__input"
               value={form.email}
               onChange={onChange}
               placeholder="Enter your email"
            />
         </fieldset>
         <fieldset className="hern-login__fieldset">
            <label className="hern-login__label" htmlFor="password">
               Password*
            </label>
            <input
               name="password"
               type="password"
               className="hern-login__input"
               onChange={onChange}
               value={form.password}
               placeholder="Enter your password"
            />
         </fieldset>
         <button
            className="hern-login__forgot-password-btn"
            onClick={() => router.push(getRoute('/forgot-password'))}
         >
            Forgot password?
         </button>
         <button
            className="hern-login__register-btn"
            onClick={() => router.push(getRoute('/get-started/register'))}
         >
            Register instead?
         </button>
         <button
            disabled={!isValid || loading}
            className={classNames('hern-login__submit-btn', {
               'hern-login__submit-btn--disabled': !isValid || loading,
            })}
            onClick={() => isValid && submit()}
         >
            {loading ? 'Logging in...' : 'Login'}
         </button>
         {error && <span className="hern-login__error">{error}</span>}
      </section>
   )
}
