import React from 'react'

import { useConfig } from '../../lib'
import { useTranslation, useUser } from '../../context'
import { ProfileSidebar, Form } from '../../components'
import * as moment from 'moment'
import { Right } from '../../components/tunnel'
import {
   LoyaltyPointsIllustration,
   LoyaltyPointsIllustrationNoTrx,
} from '../../assets/icons'
import { useWindowSize } from '../../utils'

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
   const { width, height } = useWindowSize()


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
         {width > 767 ? (
            <div className="hern-account-loyalty-points-available">
               <LoyaltyPointsIllustration height={177} width={227} />
               <p className="hern-account-loyalty-points_header_subtitle">
                  <p className="hern-account-loyalty-points-your-available">
                     {t('Your available loyalty points')}
                  </p>
                  <p className="hern-account-loyalty-points-value">
                     {user?.loyaltyPoint?.points}
                  </p>
               </p>
            </div>
         ) : (
            <div className="hern-account-loyalty-points-available">
               <LoyaltyPointsIllustration height={110} width={130} />
               <p className="hern-account-loyalty-points_header_subtitle">
                  <p className="hern-account-loyalty-points-your-available">
                     {t('Your available loyalty points')}
                  </p>
                  <p className="hern-account-loyalty-points-value">
                     {user?.loyaltyPoint?.points}
                  </p>
               </p>
            </div>
         )}

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
                           <th>{t('Sr. No.')}</th>
                           <th>{t('Type')}</th>
                           <th>{t('Points')}</th>
                           <th>{t('Created At')}</th>
                        </tr>
                     </thead>
                     <tbody>
                        {user.loyaltyPoint.loyaltyPointTransactions.map(
                           (txn, index) => (
                              <tr key={txn.id}>
                                 <td className="hern-account-loyalty-points__table__cell">
                                    {index + 1}
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
                           )
                        )}
                     </tbody>
                  </table>
               ) : (
                  <div
                     className="hern-account-loyalty-points-illustration-no-trx"
                     //    style={{
                     //       position: 'relative',
                     //       top: '100px',
                     //       left: '320px',
                     //    }}
                  >
                     <span>
                        <LoyaltyPointsIllustrationNoTrx />
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
