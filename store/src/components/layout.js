import React from 'react'
import Link from 'next/link'
import tw, { styled, css } from 'twin.macro'

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
         {children}
         <div tw="p-2 bg-gray-200 text-gray-700 w-full flex flex-col items-center justify-center gap-2">
            {(user?.isTest === true || store?.isStoreLive === false) && (
               <p>Store running in test mode so payments will be bypassed</p>
            )}
            {user?.isDemo && <p>Logged in user is in demo mode.</p>}
         </div>
         <Footer theme={theme}>
            <div>
               <section>
                  <h4 tw="text-2xl mb-4 mt-2">Contact Us</h4>
                  {location && <p tw="mt-2">{normalizeAddress(location)}</p>}

                  {brand?.['Contact'] && (
                     <>
                        <span tw="mt-4 flex items-center">
                           <MailIcon size={18} tw="stroke-current mr-2" />
                           <a
                              href={`mailto:${brand['Contact'].email}`}
                              tw="underline"
                           >
                              {brand['Contact'].email}
                           </a>
                        </span>
                        {brand?.['Contact']?.phoneNo && (
                           <a
                              target="_blank"
                              rel="noreferrer noopener"
                              tw="mt-4 flex items-center"
                              href={`https://api.whatsapp.com/send?phone=${brand?.['Contact']?.phoneNo}`}
                           >
                              <PhoneIcon size={18} tw="stroke-current mr-2" />
                              {brand?.['Contact']?.phoneNo}
                           </a>
                        )}
                     </>
                  )}
               </section>
               <section>
                  <h4 tw="text-2xl mb-4 mt-2">Navigation</h4>
                  <ul>
                     <li tw="mb-3">
                        <Link href={getRoute('/')}>Home</Link>
                     </li>
                     {isAuthenticated && (
                        <li tw="mb-3">
                           <Link href={getRoute('/account/profile/')}>
                              Profile
                           </Link>
                        </li>
                     )}
                     <li tw="mb-3">
                        <Link href={getRoute('/menu')}>Menu</Link>
                     </li>
                  </ul>
               </section>
               {(isTermsAndConditionsAvailable ||
                  isPrivacyPolicyAvailable ||
                  isRefundPolicyAvailable) && (
                  <section>
                     <h4 tw="text-2xl mb-4 mt-2">Policy</h4>
                     <ul>
                        {isTermsAndConditionsAvailable && (
                           <li tw="mb-3">
                              <Link href={getRoute('/terms-and-conditions/')}>
                                 Terms and Conditions
                              </Link>
                           </li>
                        )}
                        {isPrivacyPolicyAvailable && (
                           <li tw="mb-3">
                              <Link href={getRoute('/privacy-policy/')}>
                                 Privacy Policy
                              </Link>
                           </li>
                        )}
                        {isRefundPolicyAvailable && (
                           <li tw="mb-3">
                              <Link href={getRoute('/refund-policy/')}>
                                 Refund Policy
                              </Link>
                           </li>
                        )}
                     </ul>
                  </section>
               )}
            </div>
         </Footer>
      </>
   )
}

const Footer = styled.footer(
   ({ theme }) => css`
      height: 320px;
      padding: 24px 0;
      background-size: 160px;
      ${tw`bg-green-600 text-white`}
      ${theme?.accent && `background-color: ${theme.accent}`};
      div {
         margin: 0 auto;
         max-width: 980px;
         width: calc(100% - 40px);
         ${tw`grid gap-6`}
         grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }
      @media (max-width: 768px) {
         height: auto;
      }
   `
)
