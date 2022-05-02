import React from 'react'
import tw, { styled } from 'twin.macro'
import { useLazyQuery } from '@apollo/react-hooks'
import { REFERRER } from '../graphql'
import { useConfig } from '../lib'
import { Form } from './form'
import { useTranslation, useUser } from '../context'
import { usePayment } from '../sections/checkout/state'
import {
   deleteStoredReferralCode,
   getStoredReferralCode,
   isReferralCodeValid,
} from '../utils/referrals'
import { useToasts } from 'react-toast-notifications'

export const Referral = () => {
   const { state, dispatch } = usePayment()
   const { brand } = useConfig()
   const { addToast } = useToasts()
   const { user } = useUser()
   const { t } = useTranslation()
   const storedCode = getStoredReferralCode(null)
   const [referrer, setReferrer] = React.useState('')

   const [fetchReferrer, { loading }] = useLazyQuery(REFERRER, {
      onCompleted: data => {
         if (data.customerReferrals.length) {
            const { firstName, lastName } =
               data.customerReferrals[0].customer.platform_customer
            setReferrer(`${firstName} ${lastName}`)
         }
      },
      fetchPolicy: 'cache-and-network',
   })

   React.useEffect(() => {
      ;(async () => {
         if (storedCode && brand.id) {
            const isCodeValid = await isReferralCodeValid(brand.id, storedCode)
            if (!isCodeValid) {
               deleteStoredReferralCode()
               dispatch({
                  type: 'SET_CODE',
                  payload: { isValid: true, value: '' },
               })
            } else {
               fetchReferrer({
                  variables: {
                     brandId: brand.id,
                     code: storedCode,
                  },
               })
               dispatch({
                  type: 'SET_CODE',
                  payload: { isValid: true, value: storedCode },
               })
            }
         }
      })()
   }, [storedCode, brand.id])

   const handleBlur = async () => {
      const isValid =
         (await isReferralCodeValid(brand.id, state.code.value)) &&
         state.code.value !== user?.customerReferral?.referralCode
      if (!isValid) {
         addToast(t('Referral code is not valid!'), { appearance: 'error' })
         setReferrer('')
      } else if (isValid && state.code.value) {
         addToast(t('Referral code is valid!'), { appearance: 'success' })
         fetchReferrer({
            variables: {
               brandId: brand.id,
               code: state.code.value,
            },
         })
      }
      dispatch({
         type: 'SET_CODE',
         payload: { ...state.code, isValid },
      })
   }

   return (
      <Styles.Wrapper>
         <Form.Label>{t('Referral Code')}</Form.Label>
         {!loading && (
            <Styles.Form>
               <Form.Text
                  required
                  type="text"
                  name="code"
                  onChange={e =>
                     dispatch({
                        type: 'SET_CODE',
                        payload: { ...state.code, value: e.target.value },
                     })
                  }
                  onBlur={handleBlur}
                  value={state.code.value}
                  placeholder="Enter referral code"
               />
               {referrer && (
                  <Styles.HelpText>
                     <span>{t('referred by:')}</span> {referrer}
                  </Styles.HelpText>
               )}
               {!state.code.isValid && (
                  <Styles.HelpText error>{t('Invalid code!')}</Styles.HelpText>
               )}
            </Styles.Form>
         )}
      </Styles.Wrapper>
   )
}

const Styles = {
   Wrapper: styled.div``,
   Heading: styled.h3``,
   Form: styled.form``,
   HelpText: styled.small`
      display: block;
      color: ${props => (props.error ? '#FF5A52' : '#111')};
   `,
}
