import React from 'react'
import Link from 'next/link'

import { Header } from './header'
import { useUser } from '../context'
import { getRoute, normalizeAddress } from '../utils'
import { MailIcon, PhoneIcon } from '../assets/icons'

export const Layout = ({
   children,
   noHeader,
   settings,
   navigationMenus = [],
}) => {
   const { isAuthenticated, user } = useUser()

   if (!settings) return null

   const brand = settings['brand']['theme-brand']

   const {
      isPrivacyPolicyAvailable,
      isRefundPolicyAvailable,
      isTermsAndConditionsAvailable,
   } = settings['brand']['Policy Availability']

   const store = settings['availability']['Store Availability']
   const location = settings['availability']['Location']

   const theme = settings['Visual']['theme-color']

   return (
      <>
         {!noHeader && (
            <Header settings={settings} navigationMenus={navigationMenus} />
         )}
         <div style={{ minHeight: '80vh' }}>{children}</div>
         <div className="hern-demo-mode">
            {(user?.isTest === true || store?.isStoreLive === false) && (
               <p>Store running in test mode so payments will be bypassed</p>
            )}
            {user?.isDemo && <p>Logged in user is in demo mode.</p>}
         </div>
         <footer
            className="hern-layout__footer"
            style={{
               backgroundColor: `${
                  theme?.footerBg ? theme?.footerBg : 'rgba(5, 150, 105, 1)'
               }`,
               color: `${
                  theme?.footerText ? theme?.footerText : 'rgba(5, 150, 105, 1)'
               }`,
            }}
         >
            <div>
               <section>
                  <h4
                     style={{
                        color: `${
                           theme?.footerText
                              ? theme?.footerText
                              : 'rgba(5, 150, 105, 1)'
                        }`,
                     }}
                     className="hern-layout__footer__section-header"
                  >
                     Contact Us
                  </h4>
                  {location && (
                     <address className="hern-layout__footer__contact__location">
                        {normalizeAddress(location)}
                     </address>
                  )}

                  {brand?.['Contact'] && (
                     <>
                        <a
                           href={`mailto:${brand['Contact'].email}`}
                           className="hern-layout__footer__contact__location--email"
                        >
                           <MailIcon size={18} />
                           {brand['Contact'].email}
                        </a>
                        {brand?.['Contact']?.phoneNo && (
                           <a
                              target="_blank"
                              rel="noreferrer noopener"
                              className="hern-layout__footer__contact__location--phone"
                              href={`https://api.whatsapp.com/send?phone=${brand?.['Contact']?.phoneNo}`}
                           >
                              <PhoneIcon size={18} />
                              {brand?.['Contact']?.phoneNo}
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
               {(isTermsAndConditionsAvailable ||
                  isPrivacyPolicyAvailable ||
                  isRefundPolicyAvailable) && (
                  <section>
                     <h4 className="hern-layout__footer__section-header">
                        Policy
                     </h4>
                     <ul>
                        {isTermsAndConditionsAvailable && (
                           <li className="hern-layout__footer__link">
                              <Link href={getRoute('/terms-and-conditions/')}>
                                 Terms and Conditions
                              </Link>
                           </li>
                        )}
                        {isPrivacyPolicyAvailable && (
                           <li className="hern-layout__footer__link">
                              <Link href={getRoute('/privacy-policy/')}>
                                 Privacy Policy
                              </Link>
                           </li>
                        )}
                        {isRefundPolicyAvailable && (
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
      </>
   )
}
