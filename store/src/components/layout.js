import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { TemplateFile } from '.'
import { MailIcon, PhoneIcon } from '../assets/icons'
import { useTranslation, useUser } from '../context'
import { useConfig } from '../lib'
import {
   getRoute,
   normalizeAddress,
   setThemeVariable,
   isClient,
} from '../utils'
import FloatingBar from './floatingBar'
import { Header } from './header'

export const Layout = ({
   children,
   noHeader,
   settings,
   navigationMenus = [],
   noFooter = false,
}) => {
   const router = useRouter()
   const { isAuthenticated, user } = useUser()

   if (!settings) return null

   const brand = settings['brand']['Contact']
   const footerSettings = settings['footer']['footer']
   const {
      isPrivacyPolicyAvailable,
      isRefundPolicyAvailable,
      isTermsAndConditionsAvailable,
   } = settings['brand']['Policy Availability']

   const store =
      settings['availability']['Store Availability']?.storeAvailability
   const location = settings['availability']['Location']?.Location

   const theme = settings['Visual']?.['theme-color']?.themeColor
   const { direction } = useTranslation()
   const { dispatch, setIsLoading } = useConfig()

   //Making theme variable for all pages
   setThemeVariable('--hern-accent', theme?.accent?.value)

   React.useEffect(() => {
      dispatch({
         type: 'SET_BRANDID',
         payload: { id: settings.brandId },
      })
      dispatch({
         type: 'SET_SETTINGS',
         payload: settings,
      })
      setIsLoading(false)
   }, [settings])

   React.useEffect(() => {
      if (isClient) {
         const signInButton = document.getElementById('footer-sign-in-button')
         const signUpButton = document.getElementById('footer-sign-up-button')
         if (signInButton && signUpButton) {
            if (signInButton && isAuthenticated) {
               signInButton.style.display = 'none'
               signUpButton.style.display = 'none'
            } else {
               signInButton.style.display = 'block'
               signUpButton.style.display = 'block'
            }
         }
      }
   }, [isAuthenticated])

   return (
      <div dir={direction}>
         {!noHeader && (
            <Header settings={settings} navigationMenus={navigationMenus} />
         )}
         <div style={{ minHeight: '80vh' }}>{children}</div>
         <div className="hern-demo-mode">
            {(user?.isTest === true || store?.isStoreLive?.value === false) && (
               <p>Store running in test mode so payments will be bypassed</p>
            )}
            {user?.isDemo && <p>Logged in user is in demo mode.</p>}
         </div>
         {!noFooter && (
            <>
               {footerSettings?.footer?.isFooterAvailable?.value ? (
                  <TemplateFile
                     path={footerSettings?.footer?.path?.value}
                     data={{}}
                  />
               ) : (
                  <footer
                     className="hern-layout__footer"
                     style={{
                        backgroundColor: `${
                           theme?.accent?.value
                              ? theme?.accent?.value
                              : 'rgba(5, 150, 105, 1)'
                        }`,
                     }}
                  >
                     <div>
                        <section>
                           {footerSettings?.footer?.showTitle?.value && (
                              <h2>{footerSettings?.footer?.Title?.value}</h2>
                           )}
                           <h4 className="hern-layout__footer__section-header">
                              Contact Us
                           </h4>
                           {location?.value && (
                              <address className="hern-layout__footer__contact__location">
                                 {normalizeAddress(location?.value)}
                              </address>
                           )}

                           {brand?.Contact?.email?.value && (
                              <>
                                 <a
                                    href={`mailto:${brand?.Contact?.email?.value}`}
                                    className="hern-layout__footer__contact__location--email"
                                 >
                                    <MailIcon size={18} />
                                    {brand?.Contact?.email?.value}
                                 </a>
                                 {brand?.Contact?.phoneNo?.value && (
                                    <a
                                       target="_blank"
                                       rel="noreferrer noopener"
                                       className="hern-layout__footer__contact__location--phone"
                                       href={`https://api.whatsapp.com/send?phone=${brand?.Contact?.phoneNo?.value}`}
                                    >
                                       <PhoneIcon size={18} />
                                       {brand?.Contact?.phoneNo?.value}
                                    </a>
                                 )}
                                 {footerSettings?.footer?.showPhoneNumber
                                    ?.value && (
                                    <a
                                       target="_blank"
                                       rel="noreferrer noopener"
                                       className="hern-layout__footer__contact__location--phone"
                                       href={`https://api.whatsapp.com/send?phone=${footerSettings?.footer?.phoneNumber?.value}`}
                                    >
                                       <PhoneIcon size={18} />
                                       {
                                          footerSettings?.footer?.phoneNumber
                                             ?.value
                                       }
                                    </a>
                                 )}
                              </>
                           )}
                        </section>
                        <section>
                           <h4 className="hern-layout__footer__section-header">
                              Navigation
                           </h4>
                           <ul>
                              <li className="hern-layout__footer__link">
                                 <Link href={getRoute('/')}>Home</Link>
                              </li>
                              {isAuthenticated && (
                                 <li className="hern-layout__footer__link">
                                    <Link href={getRoute('/account/profile/')}>
                                       Profile
                                    </Link>
                                 </li>
                              )}
                              <li className="hern-layout__footer__link">
                                 <Link href={getRoute('/menu')}>Menu</Link>
                              </li>
                           </ul>
                        </section>
                        {(isTermsAndConditionsAvailable?.value ||
                           isPrivacyPolicyAvailable?.value ||
                           isRefundPolicyAvailable?.value) && (
                           <section>
                              <h4 className="hern-layout__footer__section-header">
                                 Policy
                              </h4>
                              <ul>
                                 {isTermsAndConditionsAvailable?.value && (
                                    <li className="hern-layout__footer__link">
                                       <Link
                                          href={getRoute(
                                             '/terms-and-conditions/'
                                          )}
                                       >
                                          Terms and Conditions
                                       </Link>
                                    </li>
                                 )}
                                 {isPrivacyPolicyAvailable?.value && (
                                    <li className="hern-layout__footer__link">
                                       <Link
                                          href={getRoute('/privacy-policy/')}
                                       >
                                          Privacy Policy
                                       </Link>
                                    </li>
                                 )}
                                 {isRefundPolicyAvailable?.value && (
                                    <li className="hern-layout__footer__link">
                                       <Link href={getRoute('/refund-policy/')}>
                                          Refund Policy
                                       </Link>
                                    </li>
                                 )}
                              </ul>
                           </section>
                        )}
                     </div>
                  </footer>
               )}
            </>
         )}
         {isAuthenticated &&
            user?.keycloakId &&
            !router.asPath.includes('checkout') && <FloatingBar />}
      </div>
   )
}
