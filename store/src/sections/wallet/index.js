import React from 'react'
import { useConfig } from '../../lib'
import { useTranslation, useUser } from '../../context'
import { Spacer, ProfileSidebar, Form } from '../../components'
import { formatCurrency, useWindowSize } from '../../utils'
import * as moment from 'moment'
import { useToasts } from 'react-toast-notifications'
import { getRoute } from '../../utils'
import { AiOutlineArrowRight } from 'react-icons/ai'
import { WalletPageIllustration } from '../../assets/icons'
import Link from 'next/link'

export const Wallet = () => {
   return (
      <main className="hern-wallet__main">
         <ProfileSidebar />
         <Content />
      </main>
   )
}

const Content = () => {
   const { addToast } = useToasts()
   const { user } = useUser()
   const { configOf } = useConfig()
   const { t, dynamicTrans, locale } = useTranslation()
   const theme = configOf('theme-color', 'Visual')
   const { value: isAvailable = false, label = 'Wallet' } = configOf(
      'Wallet',
      'rewards'
   )?.Wallet?.isWalletAvailable
   const { width, height } = useWindowSize()
   const currentLang = React.useMemo(() => locale, [locale])
   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])

   return (
      <section className="hern-wallet__content">
         <header className="hern-wallet__header">
            <h2
               style={{
                  color: `${
                     theme?.accent ? theme?.accent : 'rgba(5,150,105,1)'
                  }`,
               }}
               className="hern-wallet__header__title"
            >
               {t('WALLET BALANCE')}
            </h2>
         </header>
         {isAvailable && !!user.wallet && (
            <>
               <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="hern-wallet__total_balance_title">
                     {t('Total Available Balance')}
                  </span>
                  <span className="hern-wallet__balance">
                     {formatCurrency(user.wallet.amount)}
                  </span>
               </div>
               <Spacer />
               <div className="hern-wallet__referral_code_block">
                  <p className="hern-wallet__referral_code_title">
                     {/* Refer and earn */}
                  </p>
                  <div className="hern-wallet__referral_code_field">
                     <span className="hern-wallet__referral_code">
                        {/* {user?.customerReferral?.referralCode} */}
                     </span>
                     {/* <CopyToClipboard
                        text={`${get_env(
                           'BASE_BRAND_URL'
                        )}/sign-up?invite-code=${
                           user?.customerReferral?.referralCode
                        }`}
                        onCopy={() =>
                           addToast(t('Invite like copied!'), {
                              appearance: 'success',
                           })
                        }
                     >
                        <button className="hern-wallet__referral_code_copy">
                           <BiClipboard />
                           <span style={{ marginLeft: '5px' }}>
                              Copy Invite Link
                           </span>
                        </button>
                     </CopyToClipboard> */}
                  </div>
               </div>
               <p className="hern-wallet__transaction_title">
                  {t('TRANSACTION HISTORY')}
               </p>
               {user.wallet.walletTransactions.length > 0 ? (
                  <div className="hern-wallet__table_wrapper">
                     <table className="hern-wallet__table">
                        <thead>
                           <tr>
                              <th>{t('Sr. No.')}</th>
                              <th>{t('Type')}</th>
                              <th>{t('Amount')}</th>
                              <th>{t('Created At')}</th>
                           </tr>
                        </thead>
                        <tbody>
                           {user.wallet.walletTransactions
                              .sort((a, b) => {
                                 return (
                                    new Date(b.created_at) -
                                    new Date(a.created_at)
                                 )
                              })
                              .map((txn, index) => (
                                 <tr key={txn.id}>
                                    <td className="hern-wallet__table__cell">
                                       {index + 1}
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
                                          'Do MMMM YYYY || hh:mm:ss a'
                                       )}
                                    </td>
                                 </tr>
                              ))}
                        </tbody>
                     </table>
                  </div>
               ) : (
                  <div className="hern-wallet-wallet-illustration">
                     <WalletPageIllustration />
                     <p>
                        Oops! it’s look like you don’t have any transaction
                        history yet
                     </p>
                     <Link href={getRoute('/account/referrals')}>
                        <a>
                           Refer and Earn
                           <span>
                              <AiOutlineArrowRight
                                 color="var(--hern-accent)"
                                 size={16}
                              />
                           </span>
                        </a>
                     </Link>
                  </div>
               )}
            </>
         )}
      </section>
   )
}
