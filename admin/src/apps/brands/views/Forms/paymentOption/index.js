import { useMutation, useSubscription } from '@apollo/react-hooks'
import { Flex, Form, Spacer } from '@dailykit/ui'
import React from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { InlineLoader, Tooltip } from '../../../../../shared/components'
import {
   OrdersIcon,
   RevenueIcon,
} from '../../../../../shared/components/DashboardCardAnalytics/assets/icons'
import { Card } from '../../../../../shared/components/DashboardCards'
import { SettingsCard } from '../../../../../shared/CreateUtils/Brand/PaymentOptions/tunnels/AddCredentials/settingsCard'
import { currencyFmt, get_env, logger } from '../../../../../shared/utils'
import { PAYMENT_OPTIONS } from '../../../graphql'
import {
   CardHeading,
   PageHeader,
   ResponsiveFlex,
   StyledCards,
   StyledCompany,
   StyledCreds,
   StyledLabel,
   StyledPublish,
} from './styled'

export const PaymentOption = () => {
   const params = useParams()
   const [isChangeSaved, setIsSavedChange] = React.useState(true)
   const [mode, setMode] = React.useState('saved')
   const [saveAllSettings, setSaveAllSettings] = React.useState({})
   const [componentIsOnView, setIsComponentIsOnView] = React.useState([])
   const [alertShow, setAlertShow] = React.useState(false)
   const newMap = [
      { id: 1, label: 'publicCreds' },
      { id: 2, label: 'privateCreds' },
   ]
   //subscription
   const {
      loading,
      error,
      data: { brands_availablePaymentOption_by_pk: paymentOption = {} } = {},
   } = useSubscription(PAYMENT_OPTIONS.VIEW, {
      variables: {
         id: params.id,
      },
   })

   //mutation
   const [updatePaymentOption] = useMutation(PAYMENT_OPTIONS.UPDATE, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log('error', error)
         logger(error)
      },
   })

   //handler
   const togglePublish = () => {
      const val = !paymentOption.isActive
      updatePaymentOption({
         variables: {
            id: params.id,
            _set: {
               isActive: val,
            },
         },
      })
   }

   console.log(paymentOption)
   if (error) {
      toast.error('Something went wrong!')
      logger(error)
   }
   if (loading) return <InlineLoader />
   return (
      <ResponsiveFlex
         container
         justifyContent="space-between"
         alignItems="center"
         padding="16px 0"
         maxWidth="1280px"
         width="calc(100vw - 64px)"
         margin="0 auto"
      >
         <PageHeader>
            <StyledCompany>
               <img
                  src={
                     paymentOption.supportedPaymentOption
                        .supportedPaymentCompany.logo
                  }
                  alt="Company image"
               />
               <div>
                  {paymentOption.supportedPaymentOption.supportedPaymentCompany.label
                     .charAt(0)
                     .toUpperCase() +
                     paymentOption.supportedPaymentOption.supportedPaymentCompany.label.slice(
                        1
                     )}
               </div>
            </StyledCompany>
            <Form.Group>
               <Form.Toggle
                  name="publish"
                  value={paymentOption.isActive}
                  onChange={togglePublish}
               >
                  <StyledPublish>
                     Published
                     <Tooltip identifier="payment_option_active" />
                  </StyledPublish>
               </Form.Toggle>
            </Form.Group>
         </PageHeader>
         <StyledLabel>
            <div>Payment Option</div>
            <div>{paymentOption.supportedPaymentOption.paymentOptionLabel}</div>

            <div>Label</div>
            <div>{paymentOption.label}</div>
         </StyledLabel>
         <StyledCards>
            <Card>
               <Card.AdditionalBox justifyContent="space-between">
                  <OrdersIcon />
               </Card.AdditionalBox>
               <Card.Value>
                  {paymentOption.SUCCEEDED.aggregate.count}
               </Card.Value>
               <Card.Text>Total No. Of Orders So Far</Card.Text>
            </Card>
            <Card>
               <Card.AdditionalBox justifyContent="space-between">
                  <RevenueIcon />
               </Card.AdditionalBox>
               <Card.Value
                  currency={currencyFmt[get_env('REACT_APP_CURRENCY')]}
               >
                  {paymentOption.SUCCEEDED.aggregate.sum.amount}
               </Card.Value>
               <Card.Text>Total Revenue Generated So Far</Card.Text>
            </Card>
         </StyledCards>
         <StyledCreds>
            {newMap.map(each => {
               return (
                  <div key={each.id}>
                     <CardHeading>
                        {each.label === 'privateCreds'
                           ? `Private credentials (${
                                paymentOption?.privateCreds.private.length || 0
                             })`
                           : `Public credentials (${
                                paymentOption?.publicCreds.public.length || 0
                             })`}
                     </CardHeading>
                     <SettingsCard
                        option={paymentOption}
                        key={each?.id}
                        title={each?.label}
                        creds={each?.label}
                        isChangeSaved={isChangeSaved}
                        setIsSavedChange={setIsSavedChange}
                        setIsComponentIsOnView={setIsComponentIsOnView}
                        componentIsOnView={componentIsOnView}
                        mode={mode}
                        setMode={setMode}
                        saveAllSettings={saveAllSettings}
                        setSaveAllSettings={setSaveAllSettings}
                        alertShow={alertShow}
                        setAlertShow={setAlertShow}
                     />
                  </div>
               )
            })}
         </StyledCreds>
      </ResponsiveFlex>
   )
}
