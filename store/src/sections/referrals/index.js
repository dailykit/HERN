import React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useToasts } from 'react-toast-notifications'
import { useQuery } from '@apollo/react-hooks'

import { useConfig } from '../../lib'
import { useUser } from '../../context'
import { Spacer, ProfileSidebar, Form, Button, Loader } from '../../components'
import { CUSTOMERS_REFERRED } from '../../graphql'

export const Referrals = () => {
   return (
      <main className="hern-referrals__main">
         <ProfileSidebar />
         <Content />
      </main>
   )
}

const Content = () => {
   const { addToast } = useToasts()
   const { user } = useUser()
   const { brand, configOf } = useConfig()

   const theme = configOf('theme-color', 'Visual')
   const referralsAllowed = configOf('Referral', 'rewards')?.isAvailable

   const { data: { customerReferrals = [] } = {}, loading } = useQuery(
      CUSTOMERS_REFERRED,
      {
         skip: !user.customerReferral?.referralCode,
         variables: {
            brandId: brand.id,
            code: user.customerReferral?.referralCode,
         },
         fetchPolicy: 'cache-and-network',
      }
   )

   if (loading) return <Loader inline />
   return (
      <section className="hern-referrals__content">
         <header className="hern-referrals__header">
            <h2
               style={{
                  color: `${
                     theme?.accent ? theme?.accent : 'rgba(5,150,105,1)'
                  }`,
               }}
               className="hern-referrals__header__title"
            >
               Referrals
            </h2>
         </header>
         {referralsAllowed && !!user.customerReferral && (
            <>
               <Form.Label>Referral Code</Form.Label>
               <div className="hern-referrals__customer-referral-code">
                  {user.customerReferral.referralCode}
               </div>
               <CopyToClipboard
                  text={`${window.location.origin}/?invite-code=${user.customerReferral.referralCode}`}
                  onCopy={() =>
                     addToast('Invite like copied!', {
                        appearance: 'success',
                     })
                  }
               >
                  <Button size="sm"> Copy invite link </Button>
               </CopyToClipboard>
               <Spacer />
               <Form.Label>
                  Customers Referred ({customerReferrals.length}){' '}
               </Form.Label>
               <table className="hern-referrals__table">
                  <thead>
                     <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                     </tr>
                  </thead>
                  <tbody>
                     {customerReferrals.map(ref => (
                        <tr key={ref.id}>
                           <td className="hern-referrals__table__cell">
                              {ref.customer.platform_customer.firstName}
                           </td>
                           <td className="hern-referrals__table__cell">
                              {ref.customer.platform_customer.lastName}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </>
         )}
      </section>
   )
}
