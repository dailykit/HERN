import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { Radio, Space, Skeleton } from 'antd'
import { isEmpty } from 'lodash'
import tw, { styled, css } from 'twin.macro'

import { usePayment, useConfig } from '../../lib'
import * as Icon from '../../assets/icons'
import { isClient, formatCurrency, getRoute } from '../../utils'
import { Button } from '../button'
import { HelperBar } from '../helper_bar'
import PayButton from '../PayButton'
import { useUser } from '../../context'
import * as QUERIES from '../../graphql'
import { AddCard } from './components'
import { useToasts } from 'react-toast-notifications'

export default function PaymentOptionsRenderer({ cartId }) {
   const { setPaymentInfo, paymentInfo } = usePayment()
   const { user } = useUser()
   const { configOf } = useConfig()
   const { addToast } = useToasts()
   const theme = configOf('theme-color', 'Visual')
   const [isLoading, setIsLoading] = React.useState(true)
   // query for fetching available payment options
   const {
      loading,
      error,
      data: { cart = {} } = {},
   } = useSubscription(QUERIES.GET_PAYMENT_OPTIONS, {
      skip: !cartId,
      variables: {
         id: cartId,
      },
   })

   // update cart mutation
   const [updateCart] = useMutation(QUERIES.UPDATE_CART, {
      onError: error => {
         console.log(error)
         addToast(error.message, { appearance: 'error' })
      },
   })

   const showPaymentIcon = label => {
      switch (label) {
         case 'Debit/Credit Card':
            return <Icon.DebitCardIcon size={48} />
         case 'Netbanking':
            return <Icon.NetbankingIcon size={48} />
         case 'Paytm':
            return <Icon.PaytmIcon size={48} />
         case 'UPI':
            return <Icon.UpiIcon size={48} />
         default:
            return null
      }
   }

   const onPaymentMethodChange = id => {
      if (id) {
         const availablePaymentOptionToCart =
            cart.availablePaymentOptionToCart.find(option => option.id === id)
         console.log(availablePaymentOptionToCart)
         updateCart({
            variables: {
               id: cartId,
               _set: {
                  toUseAvailablePaymentOptionId: id,
               },
            },
         })
         setPaymentInfo({
            selectedAvailablePaymentOption: {
               ...paymentInfo?.selectedAvailablePaymentOption,
               ...availablePaymentOptionToCart,
            },
         })
      }
   }

   React.useEffect(() => {
      if (!isEmpty(cart) && !loading) {
         setIsLoading(false)
      }
   }, [loading, cart])
   return (
      <Wrapper>
         <SectionTitle theme={theme}>Select Payment Method</SectionTitle>
         <Skeleton
            active
            loading={isLoading}
            title={{ width: 550 }}
            paragraph={{ rows: 5, width: Array(5).fill(550) }}
         >
            <Space direction="vertical" size="large" tw="w-full">
               {!isLoading && !isEmpty(cart) && (
                  <>
                     {cart.availablePaymentOptionToCart.length > 0 ? (
                        cart.availablePaymentOptionToCart.map(option => (
                           <PaymentOptionCard
                              key={option?.id}
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
                              balanceToPay={cart?.balanceToPay}
                              cartId={cartId}
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
                                          window.location.origin +
                                          getRoute('/'))
                                    }
                                 >
                                    Go to Home
                                 </HelperBar.Button>
                              </HelperBar>
                           </div>
                        </Main>
                     )}
                  </>
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
      ${tw`text-green-600 text-lg mb-8`}
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
}) => {
   const { user } = useUser()
   const { setPaymentInfo, paymentInfo } = usePayment()
   const toggleTunnel = value => {
      setPaymentInfo({
         tunnel: {
            isVisible: value,
         },
      })
   }
   return (
      <StyledWrapper>
         <p tw="font-semibold text-sm text-gray-500 mb-2">{title}</p>
         <div
            css={[
               tw`flex flex-col p-4 rounded-md border[1px solid rgba(64, 64, 64, 0.25)] hover:(cursor-pointer box-shadow[ 0px 2px 4px rgba(0, 0, 0, 0.2)] )`,
               isSelected && tw`box-shadow[ 0px 2px 4px rgba(0, 0, 0, 0.2)]`,
            ]}
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
               <div tw="flex">
                  <span>{icon}</span>
                  <div tw="flex flex-col ml-2">
                     <h2 tw="mb-0 text-lg color[#202020] font-semibold">
                        {title}
                     </h2>
                     <p tw="text-xs italic text-gray-500 mb-0">{description}</p>
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
                        >
                           Pay Now ${balanceToPay}
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
               isSelected && <AddCard cartId={cartId} />}
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
