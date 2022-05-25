import React, { useEffect } from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { Radio, Space, Skeleton } from 'antd'
import { isEmpty } from 'lodash'
import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'

import { AddCard } from './components'
import { usePayment, useConfig } from '../../lib'
import * as Icon from '../../assets/icons'
import { Button } from '../button'
import { HelperBar } from '../helper_bar'
import PayButton from '../PayButton'
import { useUser } from '../../context'
import * as QUERIES from '../../graphql'
import { isClient, formatCurrency, getRoute, get_env } from '../../utils'

export default function PaymentOptionsRenderer({
   cartId,
   setPaymentTunnelOpen,
   amount,
   availablePaymentOptionIds,
   metaData,
   onPaymentSuccess,
   onPaymentCancel
}) {
   const { setPaymentInfo, paymentInfo, updatePaymentState } = usePayment()
   const { user } = useUser()
   const { configOf } = useConfig()
   const { addToast } = useToasts()
   const theme = configOf('theme-color', 'Visual')
   const [isLoading, setIsLoading] = React.useState(true)
   const [isUpdating, setIsUpdating] = React.useState(false)
   
   // Setting onSuccess and onCancel callbacks in Payment provider state
   useEffect(()=>{
      if(onPaymentSuccess && typeof onPaymentSuccess==='function'){
         updatePaymentState({
            onPaymentSuccessCallback: onPaymentSuccess
         })
      }
      if(onPaymentCancel && typeof onPaymentCancel==='function'){
         updatePaymentState({
            onPaymentCancelCallback: onPaymentCancel
         })
      }
   }, [onPaymentSuccess, onPaymentCancel])

   // query for fetching available payment options
   if(cartId){
      var {
         loading,
         error,
         data: { cart = {} } = {},
      } = useSubscription(QUERIES.GET_PAYMENT_OPTIONS, {
         skip: !cartId,
         variables: {
            id: cartId,
         },
         onSubscriptionData: data => {
            console.log('payment option renderer', data)
         },
      })
   }else{
      var {
         loading,
         error,
         data: { availablePaymentOptions = [] } = {},
      } = useSubscription(QUERIES.GET_AVAILABLE_PAYMENT_OPTIONS, {
         variables: {
            ids: availablePaymentOptionIds,
         },
         onSubscriptionData: data => {
            console.log('==> Payment option renderer: ', data)
         },
      })
   }


   // update cart mutation
   const [updateCart] = useMutation(QUERIES.UPDATE_CART, {
      onError: error => {
         console.log(error)
         addToast(error.message, { appearance: 'error' })
      },
   })

   // update cartPayment mutation
   const [updateCartPayments] = useMutation(QUERIES.UPDATE_CART_PAYMENTS, {
      onError: error => {
         console.log(error)
         addToast(error.message, { appearance: 'error' })
      },
   })

   const showPaymentIcon = label => {
      let icon = null
      if (['Debit/Credit Card', 'Debit/Credit Cards'].includes(label)) {
         icon = <Icon.DebitCardIcon size={48} />
      } else if (label === 'Netbanking') {
         icon = <Icon.NetbankingIcon size={48} />
      } else if (label === 'Paytm') {
         icon = <Icon.PaytmIcon size={48} />
      } else if (label === 'UPI') {
         icon = <Icon.UpiIcon size={48} />
      }
      return icon
   }

   const onPaymentMethodChange = async id => {
      if (id) {
         let availablePaymentOption;
         if(cartId){
            availablePaymentOption =
               cart.availablePaymentOptionToCart.find(option => option.id === id)
         }else{
            availablePaymentOption =
               availablePaymentOptions.find(option => option.id === id)
         }
         if(cartId){
            await updateCartPayments({
               variables: {
                  where: {
                     cartId: {
                        _eq: cartId,
                     },
                     paymentStatus: {
                        _nin: ['SUCCEEDED'],
                     },
                     isResultShown: {
                        _eq: false,
                     },
                  },
                  _set: {
                     paymentStatus: 'CANCELLED',
                     isResultShown: true,
                  },
               },
            })
            await updateCart({
               variables: {
                  id: cartId,
                  _set: {
                     toUseAvailablePaymentOptionId: id,
                  },
               },
            })
         }
         setPaymentInfo({
            selectedAvailablePaymentOption: {
               ...paymentInfo?.selectedAvailablePaymentOption,
               ...availablePaymentOption,
            },
         })
      }
   }

   if(cartId){
      React.useEffect(() => {
         if (!isEmpty(cart) && !loading) {
            setIsLoading(false)
         }
      }, [loading, cart])
   }

   return (
      <Wrapper>
         {/* <SectionTitle theme={theme}>Select Payment Method</SectionTitle> */}
         <Skeleton
            active
            loading={cartId ? isLoading : loading}
            title={{ width: 550 }}
            paragraph={{ rows: 5, width: Array(5).fill(550) }}
         >
            <Space direction="vertical" size="large" tw="w-full">
               { cartId ? !isLoading && !isEmpty(cart) && (
                  <>
                     {cart.availablePaymentOptionToCart.length > 0 ? 
                           (cart.availablePaymentOptionToCart.map(option => (
                              <PaymentOptionCard
                                 key={option?.id}
                                 setPaymentTunnelOpen={setPaymentTunnelOpen}
                                 title={
                                    option?.label ||
                                    option?.supportedPaymentOption
                                       ?.paymentOptionLabel
                                 }
                                 isSelected={
                                    paymentInfo?.selectedAvailablePaymentOption
                                       ?.id === option?.id
                                 }
                                 description={option?.description || ''}
                                 icon={showPaymentIcon(option?.label)}
                                 onClick={() => onPaymentMethodChange(option?.id)}
                                 paymentInfo={paymentInfo}
                                 balanceToPay={
                                    cart?.cartOwnerBilling?.balanceToPay
                                 }
                                 cartId={cartId}
                                 isLoginRequired={
                                    option?.supportedPaymentOption?.isLoginRequired
                                 }
                                 canShowWhileLoggedIn={
                                    option?.supportedPaymentOption
                                       ?.canShowWhileLoggedIn
                                 }
                              />
                           ))
                        ) : (
                           <Main>
                              <div tw="pt-4 w-full">
                                 <HelperBar type="info">
                                    <HelperBar.Title>
                                       Looks like this cart does not have any
                                       available payment options.
                                    </HelperBar.Title>
                                    <HelperBar.Button
                                       onClick={() =>
                                          (window.location.href =
                                             get_env('BASE_BRAND_URL') +
                                             getRoute('/'))
                                       }
                                    >
                                       Go to Home
                                    </HelperBar.Button>
                                 </HelperBar>
                              </div>
                           </Main>
                        )
                     }
                  </>
               ):  (
                  availablePaymentOptions.length > 0 ?
                  availablePaymentOptions.map(option =>
                     <PaymentOptionCard
                        key={option?.id}
                        setPaymentTunnelOpen={setPaymentTunnelOpen}
                        title={
                           option?.label ||
                           option?.supportedPaymentOption
                              ?.paymentOptionLabel
                        }
                        isSelected={
                           paymentInfo?.selectedAvailablePaymentOption
                              ?.id === option?.id
                        }
                        description={option?.description || ''}
                        icon={showPaymentIcon(option?.label)}
                        onClick={() => onPaymentMethodChange(option?.id)}
                        paymentInfo={paymentInfo}
                        balanceToPay={
                           amount
                        }
                        isLoginRequired={
                           option?.supportedPaymentOption?.isLoginRequired
                        }
                        canShowWhileLoggedIn={
                           option?.supportedPaymentOption
                              ?.canShowWhileLoggedIn
                        }
                        metaData={metaData}
                     />
                  ) : (
                     <Main>
                        <div tw="pt-4 w-full">
                           <HelperBar type="info">
                              <HelperBar.Title>
                                 No payment options available.
                              </HelperBar.Title>
                              <HelperBar.Button
                                 onClick={() =>
                                    (window.location.href =
                                       get_env('BASE_BRAND_URL') +
                                       getRoute('/'))
                                 }
                              >
                                 Go to Home
                              </HelperBar.Button>
                           </HelperBar>
                        </div>
                     </Main>
                  )
               )}
            </Space>
         </Skeleton>
      </Wrapper>
   )
}

const Wrapper = styled.div`
   padding: 0;
`
const Main = styled.main`
   display: flex;
   padding: 0 16px;
   margin-bottom: 24px;
   min-height: calc(100vh - 160px);
   ${tw`gap-4`}
   @media (max-width: 768px) {
      flex-direction: column;
   }
`

const SectionTitle = styled.h3(
   ({ theme }) => css`
      ${tw`text-green-600 text-xl mb-8`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const PaymentOptionCard = ({
   title = '',
   icon = '',
   description = '',
   isSelected = false,
   onClick = () => null,
   balanceToPay = 0,
   cartId = null,
   isLoginRequired = false,
   canShowWhileLoggedIn = true,
   setPaymentTunnelOpen,
   metaData = {}
}) => {
   const { user, isAuthenticated } = useUser()
   const { setPaymentInfo, paymentInfo } = usePayment()
   const toggleTunnel = value => {
      setPaymentInfo({
         tunnel: {
            isVisible: value,
         },
      })
   }
   if (!isAuthenticated && isLoginRequired) {
      return null
   }
   if (isAuthenticated && !canShowWhileLoggedIn) {
      return null
   }
   return (
      <StyledWrapper>
         {/* <p tw="font-semibold text-lg text-gray-500 mb-2">{title}</p> */}
         <div
            css={[
               tw`flex flex-col  rounded-md border[1px solid rgba(64, 64, 64, 0.25)] hover:(cursor-pointer box-shadow[ 0px 2px 4px rgba(0, 0, 0, 0.2)] )`,
               isSelected && tw`box-shadow[ 0px 2px 4px rgba(0, 0, 0, 0.2)]`,
            ]}
            style={{ padding: '8px' }}
            onClick={onClick}
         >
            <div
               css={[
                  tw`flex items-center justify-between`,
                  paymentInfo?.selectedAvailablePaymentOption
                     ?.supportedPaymentOption?.supportedPaymentCompany.label !==
                     'stripe' &&
                     isSelected &&
                     tw`flex-col items-start sm:(flex-row items-center)`,
               ]}
            >
               <div tw="flex items-center">
                  <span>{icon}</span>
                  <div tw="flex flex-col ml-8">
                     <h2
                        tw="mb-0 color[#202020] font-semibold"
                        style={{ fontSize: '18px', fontFamily: 'Nunito' }}
                     >
                        {title}
                     </h2>
                     <p
                        style={{ fontSize: '12px' }}
                        tw="text-xs italic text-gray-500 mb-0"
                     >
                        {description}
                     </p>
                  </div>
               </div>
               {isSelected ? (
                  <>
                     {paymentInfo?.selectedAvailablePaymentOption
                        ?.supportedPaymentOption?.supportedPaymentCompany
                        .label !== 'stripe' && (
                        <PayButton
                           bg="#38a169"
                           className="payButton"
                           cartId={cartId}
                           fullWidthSkeleton={false}
                           setPaymentTunnelOpen={setPaymentTunnelOpen}
                           balanceToPay={balanceToPay}
                           metaData={metaData}
                        >
                           Pay Now {formatCurrency(balanceToPay)}
                        </PayButton>
                     )}
                     {paymentInfo?.selectedAvailablePaymentOption
                        ?.supportedPaymentOption?.supportedPaymentCompany
                        .label === 'stripe' &&
                        user?.platform_customer?.paymentMethods.length > 0 && (
                           <OutlineButton onClick={() => toggleTunnel(true)}>
                              <>
                                 <span tw="mr-2">
                                    <Icon.PlusCircle
                                       size="28"
                                       color="#38a169"
                                       style={{ display: 'inline-block' }}
                                    />
                                 </span>
                                 <span tw="hidden sm:inline">Add New Card</span>
                              </>
                           </OutlineButton>
                        )}
                  </>
               ) : (
                  <span>
                     <Icon.ArrowRightCircle size={32} />
                  </span>
               )}
            </div>
            {paymentInfo?.selectedAvailablePaymentOption?.supportedPaymentOption
               ?.supportedPaymentCompany.label === 'stripe' &&
               isSelected && (
                  <AddCard cartId={cartId} balanceToPay={balanceToPay} />
               )}
         </div>
      </StyledWrapper>
   )
}

const StyledWrapper = styled.div`
   ${tw`flex flex-col`}
   .payButton {
      ${tw`w-full mt-2 sm:(w-auto mt-0)`}
   }
`
const StyledButton = styled.button(
   () => css`
      ${tw`bg-green-600 rounded text-white px-4 h-10 hover:bg-green-700`}
   `
)

const OutlineButton = styled(StyledButton)`
   ${tw`bg-transparent color[#38a169]   hover:(border[1px solid #38a169]  bg-white)`}
`
