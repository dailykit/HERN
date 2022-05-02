import React from 'react'

import { useConfig } from '../../lib'
import { useTranslation, useUser } from '../../context'
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
   const { t, dynamicTrans, locale } = useTranslation()
   const theme = configOf('theme-color', 'Visual')

   const loyaltyPointConfig = configOf('Loyalty Points', 'rewards')
   const isLoyaltyPointsAvailable = React.useMemo(() => {
      return loyaltyPointConfig?.['Loyalty Points']?.IsLoyaltyPointsAvailable
         ?.value
   }, [loyaltyPointConfig])

   const currentLang = React.useMemo(() => locale, [locale])

   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])

   return (
      <section className="hern-account-loyalty-points">
         <header className="hern-account-loyalty-points__header">
            <h2
               className="hern-account-loyalty-points__header__title"
               style={{
                  color: `${theme.accent ? theme.accent : 'rgba(5,150,105,1)'}`,
               }}
            >
               <span data-translation="true">{t('Loyalty Points')}</span>
            </h2>
         </header>
         {isLoyaltyPointsAvailable && !!user.loyaltyPoint ? (
            <>
               <div>
                  <Form.Label>{t('Balance')} </Form.Label>
                  {user.loyaltyPoint.points}
               </div>
               <Form.Label>{t('Transactions')}</Form.Label>
               <table className="hern-account-loyalty-points__table">
                  <thead>
                     <tr>
                        <th>{t('ID')}</th>
                        <th>{t('Type')}</th>
                        <th>{t('Points')}</th>
                        <th>{t('Created At')}</th>
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
                           <span>(</span> {t('not available')}
                           <span>)</span>
                        </div>
                     )}
                  </tbody>
               </table>
            </>
         ) : (
            <div style={{ textAlign: 'center', color: 'gray' }}>
               {t('Loyalty points not available')}
            </div>
         )}
      </section>
   )
}
