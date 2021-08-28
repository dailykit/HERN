import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import tw, { styled, css } from 'twin.macro'
import { findKey, has, isEmpty } from 'lodash'
import { signOut } from 'next-auth/client'

import { useConfig } from '../lib'
import { useUser } from '../context'
import { getRoute, isClient } from '../utils'

const routes = {
   '/[brand]/get-started/register': { status: 'REGISTER', level: 0 },
   '/[brand]/get-started/select-plan': {
      status: 'SELECT_PLAN',
      level: 25,
   },
   '/[brand]/get-started/select-delivery': {
      status: 'SELECT_DELIVERY',
      level: 50,
   },
   '/[brand]/get-started/select-menu': {
      status: 'SELECT_MENU',
      level: 75,
   },
   '/[brand]/get-started/checkout': { status: 'CHECKOUT', level: 100 },
}

export const StepsNavbar = () => {
   const { user, isAuthenticated } = useUser()
   const [currentStep, setCurrentStep] = React.useState(null)
   const { hasConfig, configOf } = useConfig()
   const [steps, setSteps] = React.useState({
      register: 'Register',
      selectDelivery: 'Select Delivery',
      selectMenu: 'Select Menu',
      checkout: 'Checkout',
   })

   React.useEffect(() => {
      if (hasConfig('steps-labels', 'conventions')) {
         setSteps(configOf('steps-labels', 'conventions'))
      }
   }, [hasConfig, configOf, setSteps])

   const router = useRouter()

   React.useEffect(() => {
      if (router.pathname === '/get-started/select-delivery/') {
         router.push(getRoute('/get-started/select-delivery'))
      } else {
         if (!has(routes, router.pathname)) return
         setCurrentStep(routes[router.pathname].level)
      }
   }, [router.pathname])

   const brand = configOf('theme-brand', 'brand')
   const theme = configOf('theme-color', 'Visual')

   const logout = async () => {
      await signOut({ redirect: false })
      window.location.href = window.location.origin + getRoute('/')
   }

   const canGoToStep = route => {
      if (!has(routes, route) || !has(routes, router.pathname)) return
      const status = user?.subscriptionOnboardStatus || 'REGISTER'
      const statusKey = findKey(routes, { status })
      const completedRoute = routes[statusKey]
      if (routes[route].level <= completedRoute?.level) {
         return true
      }
      return false
   }

   const goToStep = route => {
      if (route.includes('select-plan') && isClient) {
         localStorage.removeItem('plan')
      }
      let path = route
      if (canGoToStep(route)) {
         if (!isEmpty(user?.carts)) {
            const [cart] = user?.carts
            if (route === '/get-started/checkout/') {
               path += `?id=${cart.id}`
            } else if (route === '/get-started/select-menu/') {
               path += `?date=${cart.subscriptionOccurence?.fulfillmentDate}`
            }
         }
         router.push(getRoute(path))
      }
   }

   return (
      <Navbar>
         <Link href={getRoute('/')}>
            <Brand>
               {brand?.logo?.logoMark && (
                  <img
                     tw="h-12 md:h-12"
                     src={brand?.logo?.logoMark}
                     alt={brand?.name || 'Subscription Shop'}
                  />
               )}
               {brand?.name && <span tw="ml-2">{brand?.name}</span>}
            </Brand>
         </Link>
         <Progress>
            <ProgressBar theme={theme} current={currentStep} />
            <Steps>
               <RenderStep
                  goToStep={goToStep}
                  canGoToStep={canGoToStep}
                  isActive={currentStep === 0}
                  route="/get-started/register"
               >
                  {steps.register}
               </RenderStep>
               <RenderStep
                  goToStep={goToStep}
                  canGoToStep={canGoToStep}
                  isActive={currentStep === 25}
                  route="/get-started/select-plan"
               >
                  Select Plan
               </RenderStep>
               <RenderStep
                  goToStep={goToStep}
                  canGoToStep={canGoToStep}
                  isActive={currentStep === 50}
                  route="/get-started/select-delivery"
               >
                  {steps.selectDelivery}
               </RenderStep>
               <RenderStep
                  goToStep={goToStep}
                  canGoToStep={canGoToStep}
                  isActive={currentStep === 75}
                  route="/get-started/select-menu/"
               >
                  {steps.selectMenu}
               </RenderStep>
               <RenderStep
                  goToStep={goToStep}
                  canGoToStep={canGoToStep}
                  isActive={currentStep === 100}
                  route="/get-started/checkout/"
               >
                  {steps.checkout}
               </RenderStep>
            </Steps>
         </Progress>
         <section tw="px-4 ml-auto">
            {isAuthenticated ? (
               <button
                  onClick={logout}
                  css={tw`text-red-600 rounded px-2 py-1`}
               >
                  Logout
               </button>
            ) : (
               <span />
            )}
         </section>
      </Navbar>
   )
}

const RenderStep = ({ route, isActive, children, canGoToStep, goToStep }) => {
   return (
      <Step
         css={[
            canGoToStep(route) || isActive
               ? tw`text-gray-600 cursor-pointer`
               : tw`text-gray-400`,
         ]}
         onClick={() => goToStep(route)}
      >
         {children}
      </Step>
   )
}

const Navbar = styled.div`
   height: 64px;
   display: grid;
   z-index: 1000;
   grid-template-columns: auto 1fr auto;
   ${tw`bg-white top-0 fixed w-full items-center border-b`}
   @media (max-width: 767px) {
      display: flex;
   }
`

const Brand = styled.div`
   text-decoration: none;
   ${tw`h-full px-6 flex items-center border-r text-gray-800`}
`

const Progress = styled.section`
   min-width: 720px;
   ${tw`flex flex-col m-auto justify-center`}
   @media (max-width: 767px) {
      display: none;
   }
`

const Steps = styled.ul`
   ${tw`w-full grid grid-cols-5`}
`

const Step = styled.li`
   ${tw`text-sm text-center`}
`

const ProgressBar = styled.span(
   ({ current, theme }) => css`
      margin: 8px auto;
      width: calc(100% - 128px);
      ${tw`bg-gray-200 h-2 rounded relative`};
      :before {
         top: 0;
         left: 0;
         content: '';
         height: inherit;
         position: absolute;
         width: ${current}%;
         ${tw`bg-green-600 rounded`}
         ${theme.accent && `background-color: ${theme.accent};`};
      }
      :after {
         top: -4px;
         content: '';
         width: 16px;
         height: 16px;
         position: absolute;
         left: calc(${current}% - 8px);
         ${tw`bg-green-600 rounded-full`}
         ${theme.highlight && `background-color: ${theme.highlight};`};
      }
   `
)
