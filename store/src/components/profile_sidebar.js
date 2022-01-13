import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useConfig } from '../lib'
import { getRoute } from '../utils'
import classNames from 'classnames'

export const ProfileSidebar = ({ toggle = true, logout }) => {
   const { configOf, settings } = useConfig()
   const router = useRouter()

   const isLoyaltyPointsAvailable =
      settings?.rewards?.find(
         setting => setting?.identifier === 'Loyalty Points Availability'
      )?.value?.['Loyalty Points']?.IsLoyaltyPointsAvailable?.value ?? true

   const loyaltyPointsSettings = configOf('Loyalty Points', 'rewards')

   const walletSettings = configOf('Wallet', 'rewards')
   const referralsAllowed = configOf('Referral', 'rewards')?.isAvailable

   const sidebarLinks = [
      { title: 'Profile', href: '/account/profile/' },
      {
         title: `${walletSettings?.label ? walletSettings.label : 'Wallet'}`,
         href: '/account/wallet/',
      },
      {
         title: `${
            loyaltyPointsSettings?.label
               ? loyaltyPointsSettings.label
               : 'Loyalty Points'
         }`,
         href: '/account/loyalty-points/',
      },
      { title: 'Referrals', href: '/account/referrals/' },
      { title: 'Order History', href: '/account/orders/' },
      { title: 'Manage Addresses', href: '/account/addresses/' },
      { title: 'Manage Cards', href: '/account/cards/' },
   ]
   const menu = sidebarLinks.filter(item =>
      !isLoyaltyPointsAvailable
         ? item.href !== '/account/loyalty-points/'
         : true
   )
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
               return (
                  <Link href={getRoute(node.href)} key={node.href} passHref>
                     <span className={manuItemClasses}>{node.title}</span>
                  </Link>
               )
            })}
            <button
               className="hern-profile-sidebar__logout-btn"
               onClick={logout}
            >
               Logout
            </button>
         </ul>
      </aside>
   )
}
