import React from 'react'
import { useConfig } from '../../lib'
import { useTranslation, useUser } from '../../context'
import { Spacer, ProfileSidebar, Form } from '../../components'
import { formatCurrency } from '../../utils'
import * as moment from 'moment'

export const Wallet = () => {
   return (
      <main className="hern-wallet__main">
         <ProfileSidebar />
         <Content />
      </main>
   )
}

const Content = () => {
   const { user } = useUser()
   const { configOf } = useConfig()
   const { t, dynamicTrans } = useTranslation()
   const theme = configOf('theme-color', 'Visual')
   const { isAvailable = false, label = 'Wallet' } = configOf(
      'Wallet',
      'rewards'
   )
   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [])
   return (
      <section className="hern-wallet__content">
         <header className="hern-wallet__header">
            <h2
               style={{
                  color: `${theme?.accent ? theme?.accent : 'rgba(5,150,105,1)'
                     }`,
               }}
               className="hern-wallet__header__title"
            >
               {label == 'Wallet' ? t(label) : <span data-translation="true">{label}</span>}
            </h2>
         </header>
         {isAvailable && !!user.wallet && (
            <>
               <Form.Label>{t('Balance')}</Form.Label>
               {formatCurrency(user.wallet.amount)}
               <Spacer />
               <Form.Label>{t('Transactions')}</Form.Label>
               <table className="hern-wallet__table">
                  <thead>
                     <tr>
                        <th>{t('ID')}</th>
                        <th>{t('Type')}</th>
                        <th>{t('Amount')}</th>
                        <th>{t('Created At')}</th>
                     </tr>
                  </thead>
                  <tbody>
                     {user.wallet.walletTransactions.map(txn => (
                        <tr key={txn.id}>
                           <td className="hern-wallet__table__cell">
                              {txn.id}
                           </td>
                           <td
                              className="hern-wallet__table__cell"
                              title={txn.type}
                           >
                              {txn.type}
                           </td>
                           <td className="hern-wallet__table__cell">
                              {formatCurrency(txn.amount)}
                           </td>
                           <td className="hern-wallet__table__cell">
                              {moment(txn.created_at).format(
                                 'MMMM Do YYYY, h:mm:ss a'
                              )}
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
