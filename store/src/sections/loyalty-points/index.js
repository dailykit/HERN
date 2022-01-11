import React from 'react'

import { useConfig } from '../../lib'
import { useUser } from '../../context'
import { ProfileSidebar, Form } from '../../components'
import * as moment from 'moment'

export const LoyaltyPoints = () => {
   return (
      <main className="hern-account-loyalty-points__main">
         <ProfileSidebar />
         <Content />
      </main>
   )
}

const Content = () => {
   const { user } = useUser()
   const { configOf, settings } = useConfig()

   const theme = configOf('theme-color', 'Visual')
   const { isAvailable = false, label = 'Loyalty Points' } = configOf(
      'Loyalty Points',
      'rewards'
   )
   const isLoyaltyPointsAvailable =
      settings?.rewards?.find(
         setting => setting?.['Loyalty Points Availability']
      )?.value?.['Loyalty Points']?.IsLoyaltyPointsAvailable?.value ?? true

   return (
      <section className="hern-account-loyalty-points">
         <header className="hern-account-loyalty-points__header">
            <h2
               className="hern-account-loyalty-points__header__title"
               style={{
                  color: `${theme.accent ? theme.accent : 'rgba(5,150,105,1)'}`,
               }}
            >
               {label}
            </h2>
         </header>
         {isLoyaltyPointsAvailable && !!user.loyaltyPoint ? (
            <>
               <div>
                  <Form.Label>Balance </Form.Label>
                  {user.loyaltyPoint.points}
               </div>
               <Form.Label>Transactions</Form.Label>
               <table className="hern-account-loyalty-points__table">
                  <thead>
                     <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Points</th>
                        <th>Created At</th>
                     </tr>
                  </thead>
                  <tbody>
                     {user.loyaltyPoint.loyaltyPointTransactions.length > 0 ? (
                        user.loyaltyPoint.loyaltyPointTransactions.map(txn => (
                           <tr key={txn.id}>
                              <td className="hern-account-loyalty-points__table__cell">
                                 {txn.id}
                              </td>
                              <td
                                 className="hern-account-loyalty-points__table__cell"
                                 title={txn.type}
                              >
                                 {txn.type}
                              </td>
                              <td className="hern-account-loyalty-points__table__cell">
                                 {txn.points}
                              </td>
                              <td className="hern-account-loyalty-points__table__cell">
                                 {moment(txn.created_at).format(
                                    'MMMM Do YYYY, h:mm:ss a'
                                 )}
                              </td>
                           </tr>
                        ))
                     ) : (
                        <div style={{ textAlign: 'center', color: 'gray' }}>
                           (not available)
                        </div>
                     )}
                  </tbody>
               </table>
            </>
         ) : (
            <div style={{ textAlign: 'center', color: 'gray' }}>
               Loyalty points not available
            </div>
         )}
      </section>
   )
}
