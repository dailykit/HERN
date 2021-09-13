import React from 'react'
import { useRouter } from 'next/router'
import tw, { styled } from 'twin.macro'

import { getRoute, isClient } from '../../utils'
import { signIn } from 'next-auth/client'

const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const Login = () => {
   const [current, setCurrent] = React.useState('LOGIN')
   return (
      <Main tw="pt-8">
         <TabList>
            <Tab
               className={current === 'LOGIN' ? 'active' : ''}
               onClick={() => setCurrent('LOGIN')}
            >
               Login
            </Tab>
         </TabList>
         {current === 'LOGIN' && <LoginPanel />}
      </Main>
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
      <Panel>
         <FieldSet>
            <Label htmlFor="email">Email*</Label>
            <Input
               type="email"
               name="email"
               value={form.email}
               onChange={onChange}
               placeholder="Enter your email"
            />
         </FieldSet>
         <FieldSet>
            <Label htmlFor="password">Password*</Label>
            <Input
               name="password"
               type="password"
               onChange={onChange}
               value={form.password}
               placeholder="Enter your password"
            />
         </FieldSet>
         <button
            tw="self-start mb-2 text-blue-500"
            onClick={() => router.push(getRoute('/forgot-password'))}
         >
            Forgot password?
         </button>
         <button
            tw="self-start mb-2 text-blue-500"
            onClick={() => router.push(getRoute('/get-started/register'))}
         >
            Register instead?
         </button>
         <Submit
            className={!isValid || loading ? 'disabled' : ''}
            onClick={() => isValid && submit()}
         >
            {loading ? 'Logging in...' : 'Login'}
         </Submit>
         {error && <span tw="self-start block text-red-500 mt-2">{error}</span>}
      </Panel>
   )
}

const Main = styled.main`
   margin: auto;
   overflow-y: auto;
   max-width: 1180px;
   width: calc(100vw - 40px);
   min-height: calc(100vh - 128px);
   > section {
      width: 100%;
      max-width: 360px;
   }
`

const Panel = styled.section`
   ${tw`flex mx-auto justify-center items-center flex-col py-4`}
`

const TabList = styled.ul`
   ${tw`border-b flex justify-center space-x-3`}
`

const Tab = styled.button`
   ${tw`h-8 px-3`}
   &.active {
      ${tw`border-b border-green-500 border-b-2`}
   }
`

const FieldSet = styled.fieldset`
   ${tw`w-full flex flex-col mb-4`}
`

const Label = styled.label`
   ${tw`text-gray-600 mb-1`}
`

const Input = styled.input`
   ${tw`w-full block border h-10 rounded px-2 outline-none focus:border-2 focus:border-blue-400`}
`

const Submit = styled.button`
   ${tw`bg-green-500 rounded w-full h-10 text-white uppercase tracking-wider`}
   &.disabled {
      ${tw`cursor-not-allowed bg-gray-300 text-gray-700`}
   }
`
