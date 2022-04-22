import React from 'react'

import { useConfig } from '../../lib'
import { useTranslation, useUser } from '../../context'
import { ProfileSidebar, Form } from '../../components'
import * as moment from 'moment'
import { Right } from '../../components/tunnel'
import { LoyaltyPointsIcon, LoyaltyPointsIconNoTrx } from '../../assets/icons'

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
               <span data-translation="true">{t('MY LOYALTY POINTS')}</span>
            </h2>
         </header>

         <div className="hern-account-loyalty-points-available">
            <LoyaltyPointsIcon />
            <p className="hern-account-loyalty-points_header_subtitle">
               <p style={{ fontWeight: 'bold', fontSize: '27px' }}>
                  {t('Your available loyalty points')}
               </p>
               <p
                  style={{
                     color: 'green',
                     fontSize: 'xxx-large',
                     position: 'relative',
                     bottom: '-20px',
                     fontWeight: 'bolder',
                  }}
               >
                  {user?.loyaltyPoint?.points}
               </p>
            </p>
            {/* <Form.Label
               style={{
                  color: 'green',
               }}
            ></Form.Label> */}
         </div>
         {isLoyaltyPointsAvailable && !!user.loyaltyPoint ? (
            <>
               <Form.Label
                  style={{
                     position: 'relative',
                     bottom: '-48px',
                     color: 'black',
                     fontSize: 'large',
                     fontWeight: 'bolder',
                  }}
               >
                  {t('TRANSACTIONS HISTORY')}
               </Form.Label>
               {user.loyaltyPoint.loyaltyPointTransactions.length > 0 ? (
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
                        {user.loyaltyPoint.loyaltyPointTransactions.map(txn => (
                           <tr
                              className="hern-account-loyalty-points__table__cell"
                              key={txn.id}
                           >
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
                        ))}
                     </tbody>
                  </table>
               ) : (
                  <div
                     style={{
                        position: 'relative',
                        top: '100px',
                        left: '320px',
                     }}
                  >
                     <span>
                        <LoyaltyPointsIconNoTrx />
                        {/* {t('not avaiable')} */}
                     </span>
                  </div>
               )}
            </>
         ) : (
            <div></div>
         )}
      </section>
   )
}
