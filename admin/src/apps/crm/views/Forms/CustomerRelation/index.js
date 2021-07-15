import React, { useEffect, useContext, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks'
import { useTunnel, Flex, Tunnels, Tunnel } from '@dailykit/ui'
import { toast } from 'react-toastify'
import {
   CUSTOMER_DATA,
   SUBSCRIPTION,
   SUBSCRIPTION_PLAN,
   ISTEST,
   CUSTOMER_ISTEST,
   WALLET_N_REFERRAL,
   SIGNUP_COUNT,
   LOYALTYPOINT_COUNT,
} from '../../../graphql'
import {
   OrdersTable,
   ReferralTable,
   WalletTable,
   LoyaltyPointsTable,
   SubscriptionTable,
} from '../../Tables'
import {
   StyledWrapper,
   StyledSideBar,
   StyledTable,
   FlexContainer,
} from './styled'
import {
   CustomerCard,
   ContactInfoCard,
   PaymentCard,
   OrderCard,
   ReferralCard,
   SubscriptionCard,
   WalletCard,
   LoyaltyCard,
   SubscriptionInfoCard,
} from '../../../components'
import {
   PaymentTunnel,
   AddressTunnel,
   WalletTxnTunnel,
   LoyaltyPointsTxnTunnel,
} from './Tunnel'
import { currencyFmt, logger } from '../../../../../shared/utils'
import { useTabs } from '../../../../../shared/providers'
import BrandContext from '../../../context/Brand'
import {
   Banner,
   InlineLoader,
   InsightDashboard,
} from '../../../../../shared/components'

const CustomerRelation = ({ match }) => {
   const [context, setContext] = useContext(BrandContext)
   console.log({ context })
   const prevBrandId = useRef(context.brandId)
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [tunnels1, openTunnel1, closeTunnel1] = useTunnel(1)

   const [
      walletTxnTunnels,
      openWalletTxnTunnel,
      closeWalletTxnTunnel,
   ] = useTunnel(1)
   const [walletId, setWalletId] = React.useState(null)
   const [
      loyaltyPointsTxnTunnels,
      openLoyaltyPointsTxnTunnel,
      closeLoyaltyPointsTxnTunnel,
   ] = useTunnel(1)
   const [loyaltyPointId, setLoyaltyPointId] = React.useState(null)

   const { dispatch, tab, closeAllTabs } = useTabs()
   const history = useHistory()
   const {
      data: { customers = [] } = {},
      loading: customerloading,
   } = useSubscription(CUSTOMER_ISTEST, {
      variables: { keycloakId: match.params.id, brandId: context.brandId },
   })
   const {
      data: { brand: { brand_customers: walletNreferral = [] } = {} } = {},
      loading: walletNreferralLoading,
   } = useSubscription(WALLET_N_REFERRAL, {
      variables: { keycloakId: match.params.id, brandId: context.brandId },
      onSubscriptionData: data => {
         if (data.subscriptionData.data.brand?.brand_customers?.length) {
            const [
               brandCustomer,
            ] = data.subscriptionData.data.brand?.brand_customers
            if (brandCustomer.customer?.wallets?.length) {
               const [wallet] = brandCustomer.customer.wallets
               console.log('Setting wallet id: ', wallet.id)
               setWalletId(wallet.id)
            }
         }
      },
   })
   const { data, loading: loyaltyPointLoading } = useSubscription(
      LOYALTYPOINT_COUNT,
      {
         variables: { keycloakId: match.params.id, brandId: context.brandId },
         onSubscriptionData: data => {
            if (data.subscriptionData.data.brand?.brand_customers?.length) {
               const [
                  brandCustomer,
               ] = data.subscriptionData.data.brand?.brand_customers
               if (brandCustomer.customer?.loyaltyPoints?.length) {
                  const [loyaltyPoint] = brandCustomer.customer.loyaltyPoints
                  setLoyaltyPointId(loyaltyPoint.id)
               }
            }
         },
      }
   )
   const {
      data: { brand: { brand_customers: signUpCount = [] } = {} } = {},
      loading: signUpLoading,
   } = useSubscription(SIGNUP_COUNT, {
      variables: { keycloakId: match.params.id, brandId: context.brandId },
   })
   const {
      loading: listLoading,
      data: { brand: { brand_customers: customerData = [] } = {} } = {},
   } = useQuery(CUSTOMER_DATA, {
      variables: {
         keycloakId: match.params.id,
         brandId: context.brandId,
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const {
      loading: list_Loading,
      data: { brand: { brand_customers: subscriptionData = [] } = {} } = {},
   } = useQuery(SUBSCRIPTION, {
      variables: {
         keycloakId: match.params.id,
         brandId: context.brandId,
      },
      onError: error => {
         toast.error('Something went wrong1')
         logger(error)
      },
   })
   const {
      loading: list__Loading,
      data: { brand: { brand_customers: subscriptionPlan = [] } = {} } = {},
   } = useQuery(SUBSCRIPTION_PLAN, {
      variables: {
         keycloakId: match.params.id,
         brandId: context.brandId,
      },
      onError: error => {
         toast.error('Something went wrong2')
         logger(error)
      },
   })
   const [updateIsTest] = useMutation(ISTEST, {
      onCompleted: () => {
         toast.info('Information updated!')
      },
      onError: error => {
         toast.error('Something went wrong3')
         logger(error)
      },
   })

   const toggleHandler = toggle => {
      updateIsTest({
         variables: {
            keycloakId: match.params.id,
            isTest: toggle,
         },
      })
   }

   // useEffect(() => {
   //    if (!tab) {
   //       history.push('/crm/customers')
   //    }
   // }, [history, tab])

   const setActiveCard = card => {
      dispatch({
         type: 'STORE_TAB_DATA',
         payload: {
            path: tab?.path,
            data: { activeCard: card },
         },
      })
   }

   useEffect(() => {
      setActiveCard('Orders')
   }, [])

   // if (context.brandId !== prevBrandId.current) {
   //    closeAllTabs()
   // }

   const renderTable = React.useCallback(() => {
      switch (tab?.data?.activeCard) {
         case 'Orders':
            return <OrdersTable id={match.params.id} />
         case 'Referrals':
            return <ReferralTable />
         case 'Wallet':
            return <WalletTable openWalletTxnTunnel={openWalletTxnTunnel} />
         case 'LoyaltyPoints':
            return (
               <LoyaltyPointsTable
                  openLoyaltyPointsTxnTunnel={openLoyaltyPointsTxnTunnel}
               />
            )
         case 'Subscriber':
            console.log({
               id: match?.params?.id,
               sid: subscriptionData[0]?.subscriptionId,
            })
            return <SubscriptionTable brandCustomerId={customerData[0]?.id} />
         default:
            return null
      }
   }, [openWalletTxnTunnel, openLoyaltyPointsTxnTunnel, tab?.data?.activeCard])

   if (
      listLoading ||
      list_Loading ||
      list__Loading ||
      customerloading ||
      walletNreferralLoading ||
      signUpLoading ||
      loyaltyPointLoading
   ) {
      return <InlineLoader />
   }
   return (
      <>
         <Banner id="crm-app-customers-customer-details-top" />
         <StyledWrapper>
            <Flex container>
               <StyledSideBar>
                  <CustomerCard
                     brand={context}
                     customer={customerData[0]?.customer}
                     walletAmount={currencyFmt(
                        walletNreferral[0]?.customer?.wallets[0].amount || 0
                     )}
                     toggle={customers[0]?.isTest}
                     toggleHandler={() => toggleHandler(!customers[0]?.isTest)}
                  />
                  <SubscriptionInfoCard planData={subscriptionPlan[0] || {}} />
                  <ContactInfoCard
                     defaultTag2="(Default)"
                     customerData={customerData[0]?.customer?.platform_customer}
                     onClick={() => openTunnel1(1)}
                  />
                  <PaymentCard
                     defaultTag="(Default)"
                     linkedTo="view all cards"
                     onClick={() => openTunnel(1)}
                     cardData={
                        customerData[0]?.customer?.platform_customer
                           ?.defaultStripePaymentMethod || 'N/A'
                     }
                     billingAddDisplay="none"
                     identifier="default_payment_card_info"
                  />
               </StyledSideBar>
               <Flex container width="80%" flexDirection="column">
                  <FlexContainer>
                     <OrderCard
                        data={
                           customerData[0]?.customer?.orders_aggregate
                              ?.aggregate
                        }
                        click={() => setActiveCard('Orders')}
                        active={tab.data.activeCard}
                        heading="Orders"
                     />
                     <ReferralCard
                        referralCount={
                           walletNreferral[0]?.customer?.customerReferrals[0]
                              ?.customerReferrals_aggregate?.aggregate?.count ||
                           0
                        }
                        signUpCount={
                           signUpCount[0]?.customer?.customerReferrals
                              ?.customerReferrals_aggregate?.aggregate?.count ||
                           0
                        }
                        click={() => setActiveCard('Referrals')}
                        active={tab.data.activeCard}
                        heading="Referrals"
                     />
                     <SubscriptionCard
                        data={subscriptionData[0]?.customer}
                        click={() => setActiveCard('Subscriber')}
                        active={tab.data.activeCard}
                        heading="Subscriber"
                     />
                     <WalletCard
                        data={walletNreferral[0]?.customer?.wallets[0]?.amount}
                        click={() => setActiveCard('Wallet')}
                        active={tab.data.activeCard}
                        heading="Wallet"
                     />
                     <LoyaltyCard
                        data={
                           data.brand.brand_customers[0]?.customer
                              ?.loyaltyPoints[0]?.points ?? 0
                        }
                        click={() => setActiveCard('LoyaltyPoints')}
                        active={tab.data.activeCard}
                        heading="LoyaltyPoints"
                     />
                  </FlexContainer>
                  <StyledTable>
                     {renderTable()}
                     <InsightDashboard
                        appTitle="CRM App"
                        moduleTitle="Customer Page"
                        variables={{ keycloakId: match.params.id }}
                     />
                  </StyledTable>
               </Flex>
            </Flex>

            <PaymentTunnel
               tunnels={tunnels}
               openTunnel={openTunnel}
               closeTunnel={closeTunnel}
               id={match.params.id}
            />
            <AddressTunnel
               tunnels={tunnels1}
               openTunnel={openTunnel1}
               closeTunnel={closeTunnel1}
               id={match.params.id}
            />
            <Tunnels tunnels={walletTxnTunnels}>
               <Tunnel layer={1}>
                  <WalletTxnTunnel
                     closeWalletTxnTunnel={closeWalletTxnTunnel}
                     walletId={walletId}
                  />
               </Tunnel>
            </Tunnels>
            <Tunnels tunnels={loyaltyPointsTxnTunnels}>
               <Tunnel layer={1}>
                  <LoyaltyPointsTxnTunnel
                     closeLoyaltyPointsTxnTunnel={closeLoyaltyPointsTxnTunnel}
                     loyaltyPointId={loyaltyPointId}
                  />
               </Tunnel>
            </Tunnels>
         </StyledWrapper>
         <Banner id="crm-app-customers-customer-details-bottom" />
      </>
   )
}

export default CustomerRelation
