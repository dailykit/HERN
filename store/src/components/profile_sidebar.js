import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/react-hooks'
import classNames from 'classnames'
import { useTranslation } from './../context'
import { useConfig } from '../lib'
import { getRoute } from '../utils'
import { ProfileSidebarIcon } from '../assets/icons'
import { SUPPORTED_PAYMENT_OPTIONS } from '../graphql'

export const ProfileSidebar = ({ toggle = true, logout }) => {
   const { configOf, settings } = useConfig()
   const router = useRouter()
   const { t } = useTranslation()
   const isSubscriptionStore =
      settings?.availability?.find(
         i => i.identifier === 'isSubscriptionAvailable'
      )?.value?.Subscription?.isSubscriptionAvailable?.value ?? false
   const isLoyaltyPointsAvailable =
      settings?.rewards?.find(
         setting => setting?.identifier === 'Loyalty Points Availability'
      )?.value?.['Loyalty Points']?.IsLoyaltyPointsAvailable?.value ?? true

   const loyaltyPointsSettings = configOf('Loyalty Points', 'rewards')
   const walletSettings = configOf('Wallet', 'rewards')
   const referralsAllowed = configOf('Referral', 'rewards')?.isAvailable
   const { loading, error, data } = useQuery(SUPPORTED_PAYMENT_OPTIONS)

   const sidebarLinks = [
      {
         title: 'Profile',
         href: '/account/profile/',
         Icon: ProfileSidebarIcon.Profile,
      },
      {
         title: `${walletSettings?.label ? walletSettings.label : 'Wallet'}`,
         href: '/account/wallet/',
         Icon: ProfileSidebarIcon.Wallet,
      },
      {
         title: `${loyaltyPointsSettings?.label
            ? loyaltyPointsSettings.label
            : 'Loyalty Points'
            }`,
         href: '/account/loyalty-points/',
         Icon: ProfileSidebarIcon.LoyaltyPoints,
      },
      {
         title: 'Referrals',
         href: '/account/referrals/',
         Icon: ProfileSidebarIcon.Referrals,
      },
      {
         title: 'Order History',
         href: '/account/orders/',
         Icon: ProfileSidebarIcon.Orders,
      },
      {
         title: 'Subscriptions',
         href: '/account/subscriptions/',
         Icon: ProfileSidebarIcon.Subscriptions,
      },
      {
         title: 'Manage Addresses',
         href: '/account/addresses/',
         Icon: ProfileSidebarIcon.ManageAddresses,
      },
      {
         title: 'Manage Cards',
         href: '/account/cards/',
         Icon: ProfileSidebarIcon.ManageCards,
      },
   ]
   const conditionalRoutes = {
      '/account/subscriptions/': isSubscriptionStore,
      '/account/loyalty-points/': isLoyaltyPointsAvailable,
      '/account/cards/':
         !error &&
         !loading &&
         data?.brands_supportedPaymentCompany.some(pm => pm.label === 'stripe'),
   }
   const excludedRoutes = Object.keys(conditionalRoutes).filter(
      route => conditionalRoutes[route] === false
   )
   const menu = sidebarLinks.filter(item => !excludedRoutes.includes(item.href))
   return (
      <aside className={`hern-profile-sidebar${toggle ? '--toggle' : ''}`}>
         <ul>
            {menu.map(node => {
               const isActive =
                  `/[brand]${getRoute(node.href)}` === `${router.pathname}/`

               const manuItemClasses = classNames(
                  'hern-profile-sidebar__menu-link',
                  { 'hern-profile-sidebar__menu-link--active': isActive }
               )
               const Icon = node.Icon
               return (
                  <Link href={getRoute(node.href)} key={node.href} passHref>
                     <span className={manuItemClasses}>
                        <Icon />
                        <span>{t(node.title)}</span>
                     </span>
                  </Link>
               )
            })}
         </ul>
      </aside>
   )
}
