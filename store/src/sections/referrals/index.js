import React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useToasts } from 'react-toast-notifications'
import { useQuery } from '@apollo/react-hooks'
import { CgClipboard } from 'react-icons/cg'
import { useConfig } from '../../lib'
import { useTranslation, useUser } from '../../context'
import { get_env } from '../../utils'
import { Spacer, ProfileSidebar, Form, Button, Loader } from '../../components'
import { CUSTOMERS_REFERRED } from '../../graphql'
import { isEmpty } from 'lodash'
import { EmptyReferralIll } from '../../assets/icons'

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
            <h2 className="hern-referrals__header__title">{t('Referrals')}</h2>
         </header>
         {referralsAllowed && !!user.customerReferral && (
            <>
               <div className="hern-referrals__customer-referral-code__title">
                  {t('Your Referral Code')}
               </div>
               <div className="hern-referrals__customer-referral-code">
                  <div>
                     <span>{user.customerReferral.referralCode}</span>
                     <CopyToClipboard
                        text={`${get_env(
                           'BASE_BRAND_URL'
                        )}/sign-up?invite-code=${
                           user.customerReferral.referralCode
                        }`}
                        onCopy={() =>
                           addToast(t('Invite like copied!'), {
                              appearance: 'success',
                           })
                        }
                     >
                        <Button
                           className="hern-referral-code__copy-btn"
                           size="sm"
                        >
                           <CgClipboard />
                           &nbsp; {t('Copy invite link')}{' '}
                        </Button>
                     </CopyToClipboard>
                  </div>
               </div>
               <Spacer />
               <div className="hern-referral__referred">
                  <span> {t('Friends Referred')} :</span>
                  <span style={{ color: 'green', fontWeight: 'bold' }}>
                     &nbsp;{customerReferrals.length}
                  </span>
               </div>
               <div className="hern-referrals-illustration-icon">
                  <EmptyReferralIll />
               </div>
            </>
         )}
      </section>
   )
}
