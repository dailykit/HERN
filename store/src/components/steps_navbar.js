import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { findKey, has, isEmpty } from 'lodash'
import { signOut } from 'next-auth/client'

import { useConfig } from '../lib'
import { useTranslation, useUser } from '../context'
import { getProtectedRoutes, getRoute, isClient, get_env } from '../utils'
import { StepNavProgress } from '../assets/icons/StepNavProgress'
import classNames from 'classnames'
import { HernLazyImage } from '../utils/hernImage'
import { LanguageSwitch } from './language_switch'

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
   const { t, dynamicTrans, locale } = useTranslation()
   const [steps, setSteps] = React.useState({
      register: 'Register',
      selectDelivery: 'Select Delivery',
      selectMenu: 'Select Menu',
      checkout: 'Checkout',
   })

   React.useEffect(() => {
      if (hasConfig('steps-labels', 'conventions')) {
         const stepsLabels = configOf(
            'steps-labels',
            'conventions'
         )?.stepsLabels
         const steps_labels = {
            register: stepsLabels?.Register?.value,
            selectDelivery: stepsLabels?.selectDelivery?.value,
            selectMenu: stepsLabels?.selectMenu?.value,
            checkout: stepsLabels?.checkout?.value,
         }
         setSteps(steps_labels)
      }
   }, [hasConfig, configOf, setSteps])

   const router = useRouter()
   console.log('router', router)
   React.useEffect(() => {
      const getStartedRoutes = [
         '/get-started/select-delivery',
         '/get-started/select-menu',
         '/get-started/checkout',
      ]
      if (isClient && router.asPath) {
         if (document.querySelector('.hern-header--layout-two')) {
            document.querySelector('.hern-header--layout-two').style.display =
               'none'
         }
         if (document.querySelector('.hern-header--layout-one')) {
            document.querySelector('.hern-header--layout-one').style.display =
               'none'
         }
         if (document.querySelector('.hern-header__location-container')) {
            document.querySelector(
               '.hern-header__location-container'
            ).style.display = 'none'
         }
      }
   }, [router])

   const currentLang = React.useMemo(() => locale, [locale])
   React.useEffect(() => {
      if (router.pathname === '/get-started/select-delivery/') {
         router.push(getRoute('/get-started/select-delivery'))
      } else {
         if (!has(routes, router.pathname)) return
         setCurrentStep(routes[router.pathname].level)
      }
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [router.pathname, currentLang])

   //config properties
   const brand = configOf('Brand Info', 'brand')
   const theme = configOf('theme-color', 'Visual')?.themeColor

   const logout = async () => {
      await signOut({ redirect: false })
      const currentPathName = router.pathname
      if (getProtectedRoutes(true).find(x => x === currentPathName)) {
         // router.push(getRoute('/'))
         window.location.href = get_env('BASE_BRAND_URL') + getRoute('/')
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
            if (route === '/get-started/checkout') {
               path += `?id=${cart.id}`
            } else if (route === '/get-started/select-menu') {
               path += `?date=${cart.subscriptionOccurence?.fulfillmentDate}`
            }
         }
         router.push(getRoute(path))
      }
   }

   return (
      <>
         <div className="hern-steps-navbar">
            <Link href={getRoute('/')}>
               <div className="hern-steps-navbar__brand">
                  {brand?.brandLogo?.value && (
                     <HernLazyImage
                        className="hern-steps-navbar__brand__img"
                        dataSrc={brand?.brandLogo?.value}
                        alt={brand?.brandName?.value || 'Subscription Shop'}
                     />
                  )}
                  {brand?.brandName?.value && (
                     <span className="hern-steps-navbar__brand__text">
                        {brand?.brandName?.value}
                     </span>
                  )}
               </div>
            </Link>
            <section className="hern-steps-navbar__progress">
               <ul className="hern-steps-navbar__steps">
                  <RenderStep
                     goToStep={goToStep}
                     canGoToStep={canGoToStep}
                     isActive={currentStep >= 0}
                     route="/[brand]/get-started/select-plan"
                     label="Select Plan"
                     step="select-plan"
                  />
                  <RenderStep
                     goToStep={goToStep}
                     canGoToStep={canGoToStep}
                     isActive={currentStep >= 33}
                     route="/[brand]/get-started/select-delivery"
                     label="Select Delivery"
                     step="select-delivery"
                  />
                  <RenderStep
                     goToStep={goToStep}
                     canGoToStep={canGoToStep}
                     isActive={currentStep >= 66}
                     route="/[brand]/get-started/select-menu"
                     label="Select Menu"
                     step="select-menu"
                  />
                  <RenderStep
                     goToStep={goToStep}
                     canGoToStep={canGoToStep}
                     isActive={currentStep === 100}
                     route="/[brand]/get-started/checkout"
                     label="Checkout"
                     step="checkout"
                     tail={false}
                  />
               </ul>
            </section>

            <div className="hern-steps-navbar__change__lang">
               <LanguageSwitch />
            </div>

            <section className="hern-steps-navbar__logout">
               {isAuthenticated ? (
                  <button
                     onClick={logout}
                     className="hern-steps-navbar__logout__btn"
                  >
                     {t('Logout')}
                  </button>
               ) : (
                  <span />
               )}
            </section>
            {/* <section className="hern-steps-navbar__progress">
               <ul className="hern-steps-navbar__steps">
                  <RenderStep
                     goToStep={goToStep}
                     canGoToStep={canGoToStep}
                     isActive={currentStep >= 0}
                     route="/[brand]/get-started/select-plan"
                     label="Select Plan"
                     step="select-plan"
                  />
                  <RenderStep
                     goToStep={goToStep}
                     canGoToStep={canGoToStep}
                     isActive={currentStep >= 33}
                     route="/[brand]/get-started/select-delivery"
                     label="Select Delivery"
                     step="select-delivery"
                  />
                  <RenderStep
                     goToStep={goToStep}
                     canGoToStep={canGoToStep}
                     isActive={currentStep >= 66}
                     route="/[brand]/get-started/select-menu"
                     label="Select Menu"
                     step="select-menu"
                  />
                  <RenderStep
                     goToStep={goToStep}
                     canGoToStep={canGoToStep}
                     isActive={currentStep === 100}
                     route="/[brand]/get-started/checkout"
                     label="Checkout"
                     step="checkout"
                     tail={false}
                  />
               </ul>
            </section> */}
         </div>

         <section className="hern-steps-navbar hern-steps-mobile-navbar__progress">
            <ul className="hern-steps-navbar__steps">
               <MobileRenderStep
                  goToStep={goToStep}
                  canGoToStep={canGoToStep}
                  isActive={currentStep >= 0}
                  route="/[brand]/get-started/select-plan"
                  label="Select Plan"
                  step="select-plan"
               />
               <MobileRenderStep
                  goToStep={goToStep}
                  canGoToStep={canGoToStep}
                  isActive={currentStep >= 33}
                  route="/[brand]/get-started/select-delivery"
                  label="Select Delivery"
                  step="select-delivery"
               />
               <MobileRenderStep
                  goToStep={goToStep}
                  canGoToStep={canGoToStep}
                  isActive={currentStep >= 66}
                  route="/[brand]/get-started/select-menu"
                  label="Select Menu"
                  step="select-menu"
               />
               <MobileRenderStep
                  goToStep={goToStep}
                  canGoToStep={canGoToStep}
                  isActive={currentStep === 100}
                  route="/[brand]/get-started/checkout"
                  label="Checkout"
                  step="checkout"
                  tail={false}
               />
            </ul>
         </section>
      </>
   )
}

const RenderStep = ({
   route,
   step,
   isActive,
   label,
   canGoToStep,
   goToStep,
   tail = true,
}) => {
   const { t } = useTranslation()
   return (
      <>
         <li
            onClick={() => isActive && goToStep(route)}
            className={classNames('hern-steps-navbar__step', {
               'hern-steps-navbar__step--active': isActive,
            })}
         >
            <div>
               <div className="hern-steps-navbar__step__icon">
                  {StepNavProgress(
                     step,
                     isActive ? '#fff' : 'rgba(17, 130, 59, 0.2)'
                  )}
               </div>
               <span>{t(label)}</span>
            </div>
            {tail && <span className="hern-steps-navbar__step__tail"></span>}
         </li>
      </>
   )
}
const MobileRenderStep = ({
   route,
   step,
   isActive,
   label,
   canGoToStep,
   goToStep,
   tail = true,
}) => {
   const { t } = useTranslation()
   return (
      <>
         <li
            // style={{ border: '1px solid red' }}
            onClick={() => isActive && goToStep(route)}
            className={classNames('hern-steps-mobile-navbar__step', {
               'hern-steps-mobile-navbar__step--active': isActive,
            })}
         >
            <div>
               <div
                  style={{ width: '8px', height: '8px' }}
                  className="hern-steps-navbar__step__icon"
               ></div>
               <span>{t(label)}</span>
            </div>
            {tail && (
               <span className="hern-steps-mobile-navbar__step__tail"></span>
            )}
         </li>
      </>
   )
}
