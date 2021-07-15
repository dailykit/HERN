import React from 'react'

import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'

import { SEO, Layout } from '../../components'
import { getSettings, isClient } from '../../utils'
import { useMutation } from '@apollo/react-hooks'
import { FORGOT_PASSWORD, NAVIGATION_MENU, WEBSITE_PAGE } from '../../graphql'
import { graphQLClient, useConfig } from '../../lib'

const ForgotPassword = props => {
   const { addToast } = useToasts()
   const { configOf } = useConfig()
   const { seo, settings, navigationMenus } = props

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
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO title="Login" />
         <Main tw="pt-8">
            <Title theme={theme}>Forgot Password</Title>
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
               <Submit
                  className={!isValid || loading ? 'disabled' : ''}
                  onClick={() => isValid && submit()}
               >
                  Send Email
               </Submit>
               {error && (
                  <span tw="self-start block text-red-500 mt-2">{error}</span>
               )}
            </Panel>
         </Main>
      </Layout>
   )
}

export const getStaticProps = async ({ params }) => {
   const client = await graphQLClient()
   const dataByRoute = await client.request(WEBSITE_PAGE, {
      domain: params.brand,
      route: '/forgot-password',
   })
   // const domain =
   //    process.env.NODE_ENV === 'production'
   //       ? params.domain
   //       : 'test.dailykit.org'
   const domain = 'test.dailykit.org'
   const { seo, settings } = await getSettings(domain, '/forgot-password')
   //navigation menu
   const navigationMenu = await client.request(NAVIGATION_MENU, {
      navigationMenuId:
         dataByRoute.website_websitePage[0]['website']['navigationMenuId'],
   })
   const navigationMenus = navigationMenu.website_navigationMenuItem
   return {
      props: {
         settings,
         seo,
         navigationMenus,
      },
      revalidate: 1,
   }
}
export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
export default ForgotPassword

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

const Title = styled.h2(
   ({ theme }) => css`
      ${tw`text-green-600 text-2xl text-center`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

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
