import React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useToasts } from 'react-toast-notifications'
import { useQuery } from '@apollo/react-hooks'

import { useConfig } from '../../lib'
import { useTranslation, useUser } from '../../context'
import { get_env } from '../../utils'
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
   const { t, dynamicTrans, locale } = useTranslation()
   const theme = configOf('theme-color', 'Visual')

   const referralsAllowed = configOf('Referral', 'rewards')

   const isReferralAvailable = React.useMemo(() => {
      return referralsAllowed?.['Referral']?.IsReferralAvailable?.value
   }, [referralsAllowed])

   const currentLang = React.useMemo(() => locale, [locale])

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

   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])

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
               {t('Referrals')}
            </h2>
         </header>
         {referralsAllowed && !!user.customerReferral && (
            <>
               <Form.Label>{t('Referral Code')}</Form.Label>
               <div className="hern-referrals__customer-referral-code">
                  {user.customerReferral.referralCode}
               </div>
               <CopyToClipboard
                  text={`${get_env('BASE_BRAND_URL')}/?invite-code=${
                     user.customerReferral.referralCode
                  }`}
                  onCopy={() =>
                     addToast(t('Invite like copied!'), {
                        appearance: 'success',
                     })
                  }
               >
                  <Button size="sm"> {t('Copy invite link')} </Button>
               </CopyToClipboard>
               <Spacer />
               <Form.Label>
                  <span> {t('Customers Referred')}</span> (
                  {customerReferrals.length}){' '}
               </Form.Label>
               {customerReferrals.length > 0 ? (
                  <table className="hern-referrals__table">
                     <thead>
                        <tr>
                           <th>{t('First Name')}</th>
                           <th>{t('Last Name')}</th>
                        </tr>
                     </thead>
                     <tbody>
                        {customerReferrals.map(ref => (
                           <tr key={ref.id}>
                              <td
                                 className="hern-referrals__table__cell"
                                 data-translation="true"
                              >
                                 {ref.customer.platform_customer.firstName}
                              </td>
                              <td
                                 className="hern-referrals__table__cell"
                                 data-translation="true"
                              >
                                 {ref.customer.platform_customer.lastName}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               ) : (
                  <div
                     style={{
                        textAlign: 'center',
                        color: 'gray',
                        padding: '16px',
                     }}
                  >
                     {t('(No customer reffered yet!)')}
                  </div>
               )}
            </>
         )}
      </section>
   )
}
