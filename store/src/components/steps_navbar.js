import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { findKey, has, isEmpty } from 'lodash'
import { signOut } from 'next-auth/client'

import { useConfig } from '../lib'
import { useUser } from '../context'
import { getProtectedRoutes, getRoute, isClient } from '../utils'

const routes = {
   '/[brand]/get-started/select-plan': {
      status: 'SELECT_PLAN',
      level: 0,
   },
   '/[brand]/get-started/select-delivery': {
      status: 'SELECT_DELIVERY',
      level: 33,
   },
   '/[brand]/get-started/select-menu': {
      status: 'SELECT_MENU',
      level: 66,
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
      const currentPathName = router.pathname
      if (getProtectedRoutes(true).find(x => x === currentPathName)) {
         // router.push(getRoute('/'))
         window.location.href = window.location.origin + getRoute('/')
      }
   }

   const canGoToStep = route => {
      if (!has(routes, route) || !has(routes, router.pathname)) return
      // const status = user?.subscriptionOnboardStatus || 'REGISTER'
      // const status = router.pathname
      // const statusKey = findKey(routes, { status })
      const completedRoute = routes[route]
      if (routes[route].level <= completedRoute?.level) {
         return true
      }
      return false
   }

   const goToStep = route => {
      if (route.includes('select-plan') && isClient) {
         localStorage.removeItem('plan')
      }
      let path = route.replace('/[brand]', '')
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
      <div className="hern-steps-navbar">
         <Link href={getRoute('/')}>
            <div className="hern-steps-navbar__brand">
               {brand?.logo?.logoMark && (
                  <img
                     className="hern-steps-navbar__brand__img"
                     src={brand?.logo?.logoMark}
                     alt={brand?.name || 'Subscription Shop'}
                  />
               )}
               {brand?.name && (
                  <span className="hern-steps-navbar__brand__text">
                     {brand?.name}
                  </span>
               )}
            </div>
         </Link>
         <section className="hern-steps-navbar__progress">
            <ProgressBar theme={theme} current={currentStep} />
            <ul className="hern-steps-navbar__steps">
               <RenderStep
                  goToStep={goToStep}
                  canGoToStep={canGoToStep}
                  isActive={currentStep === 0}
                  route="/[brand]/get-started/select-plan"
               >
                  Select Plan
               </RenderStep>
               <RenderStep
                  goToStep={goToStep}
                  canGoToStep={canGoToStep}
                  isActive={currentStep === 33}
                  route="/[brand]/get-started/select-delivery"
               >
                  {steps.selectDelivery}
               </RenderStep>
               <RenderStep
                  goToStep={goToStep}
                  canGoToStep={canGoToStep}
                  isActive={currentStep === 66}
                  route="/[brand]/get-started/select-menu/"
               >
                  {steps.selectMenu}
               </RenderStep>
               <RenderStep
                  goToStep={goToStep}
                  canGoToStep={canGoToStep}
                  isActive={currentStep === 100}
                  route="/[brand]/get-started/checkout/"
               >
                  {steps.checkout}
               </RenderStep>
            </ul>
         </section>
         <section className="hern-steps-navbar__logout">
            {isAuthenticated ? (
               <button
                  onClick={logout}
                  className="hern-steps-navbar__logout__btn"
               >
                  Logout
               </button>
            ) : (
               <span />
            )}
         </section>
      </div>
   )
}

const RenderStep = ({ route, isActive, children, canGoToStep, goToStep }) => {
   const active = canGoToStep(route) || isActive
   return (
      <li
         className={`hern-steps-navbar__step${active ? '--active' : ''}`}
         onClick={() => goToStep(route)}
      >
         {children}
      </li>
   )
}
const ProgressBar = ({ theme, current }) => {
   return (
      <span className="hern-steps-navbar__progressbar">
         <span
            style={{
               width: `${current}%`,
               backgroundColor: `${theme.accent}`,
            }}
            className="hern-steps-navbar__progressbar__before"
         ></span>
         <span
            className="hern-steps-navbar__progressbar__after"
            style={{
               left: `calc(${current}% - 8px)`,
               backgroundColor: `${theme.highlight}`,
            }}
         ></span>
      </span>
   )
}
