import React from 'react'
import tw, { styled } from 'twin.macro'
import { CloseIcon } from '../assets/icons'
import { useUser } from '../context'

const CardList = ({ closeTunnel, onSelect }) => {
   const { user } = useUser()

   const selectCard = card => {
      onSelect(card)
   }

   return (
      <Styles.Wrapper>
         <Styles.ListHeader>
            <Styles.Heading>Available Cards</Styles.Heading>
            <button tw="rounded-full border-2 border-green-400 h-6 w-8 flex items-center justify-center">
               <CloseIcon
                  size={16}
                  tw="stroke-current text-green-400"
                  onClick={closeTunnel}
               />
            </button>
         </Styles.ListHeader>
         {user.platform_customer.paymentMethods.map(card => (
            <div
               css={[
                  tw`border border-gray-300 border-2 p-2 mb-2 rounded-sm cursor-pointer hover:border-green-500`,
               ]}
               onClick={() => selectCard(card)}
               key={card.stripePaymentMethodId}
            >
               <p tw="text-gray-500">{card.cardHolderName}</p>
               <p>XXXX XXXX XXXX {card.last4}</p>
               <p>
                  {card.expMonth}/{card.expYear}
               </p>
               <p tw="text-sm text-gray-500 uppercase">{card?.brand}</p>
            </div>
         ))}
      </Styles.Wrapper>
   )
}

export default CardList

const Styles = {
   Wrapper: styled.div`
      padding: 16px;
   `,
   ListHeader: styled.div`
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
   `,
   Heading: styled.h3`
      color: gray;
   `,
}
