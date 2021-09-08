import React from 'react'
import tw, { styled, css } from 'twin.macro'

import { usePayment } from './state'
import { useConfig } from '../../lib'
import { useUser } from '../../context'
import { HelperBar } from '../../components'
import { CheckIcon } from '../../assets/icons'
import { PaymentTunnel } from './payment_tunnel'

export const PaymentSection = () => {
   const { user } = useUser()
   const { configOf } = useConfig()
   const { state, dispatch } = usePayment()

   React.useEffect(() => {
      if (user.subscriptionPaymentMethodId) {
         dispatch({
            type: 'SET_PAYMENT_METHOD',
            payload: {
               selected: { id: user.subscriptionPaymentMethodId },
            },
         })
      }
   }, [user, dispatch])

   const toggleTunnel = value => {
      dispatch({
         type: 'TOGGLE_TUNNEL',
         payload: {
            isVisible: value,
         },
      })
   }
   const theme = configOf('theme-color', 'Visual')

   return (
      <>
         <header tw="my-3 pb-1 border-b flex items-center justify-between">
            <SectionTitle theme={theme}>Select Payment Method</SectionTitle>
            {user?.platform_customer?.paymentMethods.length > 0 && (
               <OutlineButton onClick={() => toggleTunnel(true)}>
                  Add Card
               </OutlineButton>
            )}
         </header>
         {user?.platform_customer?.paymentMethods.length === 0 && (
            <HelperBar type="info">
               <HelperBar.SubTitle>
                  Let's start with adding a payment method.
               </HelperBar.SubTitle>
               <HelperBar.Button onClick={() => toggleTunnel(true)}>
                  Add Payment Method
               </HelperBar.Button>
            </HelperBar>
         )}
         <PaymentMethods>
            {user?.platform_customer?.paymentMethods.map(method => (
               <PaymentMethod
                  key={method.customerPaymentMethodId}
                  onClick={() =>
                     dispatch({
                        type: 'SET_PAYMENT_METHOD',
                        payload: {
                           selected: { id: method.customerPaymentMethodId },
                        },
                     })
                  }
                  className={`${
                     state.payment.selected?.id ===
                        method.customerPaymentMethodId && 'active'
                  }`}
               >
                  <PaymentMethodLeft>
                     <CheckIcon
                        size={18}
                        css={[
                           tw`stroke-current`,
                           state.payment.selected?.id ===
                           method.customerPaymentMethodId
                              ? tw`text-green-700`
                              : tw`text-gray-400`,
                        ]}
                     />
                  </PaymentMethodLeft>
                  <section tw="p-2 w-full">
                     {user.subscriptionPaymentMethodId ===
                        method.customerPaymentMethodId && (
                        <span tw="rounded border bg-teal-200 border-teal-300 px-2 text-teal-700">
                           Default
                        </span>
                     )}
                     <div tw="flex items-center justify-between">
                        <span tw="text-xl my-2">{method.cardHolderName}</span>
                        <div tw="flex items-center">
                           <span tw="font-medium">{method.expMonth}</span>
                           &nbsp;/&nbsp;
                           <span tw="font-medium">{method.expYear}</span>
                        </div>
                     </div>
                     <span>
                        <span tw="text-gray-500">Last 4:</span> {method.last4}
                     </span>
                  </section>
               </PaymentMethod>
            ))}
         </PaymentMethods>
         {state.tunnel.isVisible && <PaymentTunnel />}
      </>
   )
}

const PaymentMethods = styled.ul`
   ${tw`
   grid
   gap-2
   sm:grid-cols-1
   md:grid-cols-2
`}
   grid-auto-rows: minmax(120px, auto);
`

const SectionTitle = styled.h3(
   ({ theme }) => css`
      ${tw`text-green-600 text-lg`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const PaymentMethod = styled.li`
   ${tw`flex border text-gray-700 rounded overflow-hidden hover:(border-2 border-green-700)`}
   > aside {
      width: 48px;
      ${tw`flex justify-center h-full`}
   }
   &.active {
      ${tw`border-2 border-green-700`}
      svg {
         ${tw`text-green-700`}
      }
   }
   :hover {
      svg {
         ${tw`text-green-700`}
      }
   }
`

const PaymentMethodLeft = styled.aside(
   () => css`
      width: 48px;
      height: 48px;
      ${tw`h-full mr-2 flex flex-shrink-0 items-center justify-center`}
   `
)

const Button = styled.button(
   () => css`
      ${tw`bg-green-600 rounded text-white px-4 h-10 hover:bg-green-700`}
   `
)

const OutlineButton = styled(Button)`
   ${tw`bg-transparent hover:bg-green-600 text-green-600 border border-green-600 hover:text-white`}
`
