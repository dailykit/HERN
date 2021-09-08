import React from 'react'
import { CloseIcon } from '../assets/icons'
import { useUser } from '../context'

const CardList = ({ closeTunnel, onSelect }) => {
   const { user } = useUser()

   const selectCard = card => {
      onSelect(card)
   }

   return (
      <div className="hern-card-list">
         <div className="hern-card-list__header">
            <div className="hern-card-list__heading">Available Cards</div>
            <button className="hern-card-list__close-btn">
               <CloseIcon
                  size={16}
                  stroke="currentColor"
                  style={{ color: 'rgba(52, 211, 153, 1)' }}
                  onClick={closeTunnel}
               />
            </button>
         </div>
         {user.platform_customer.paymentMethods.map(card => (
            <div
               className="hern-card-list__card"
               onClick={() => selectCard(card)}
               key={card.customerPaymentMethodId}
            >
               <p className="hern-card-list__card__name">
                  {card.cardHolderName}
               </p>
               <p className="hern-card-list__card__last-4">
                  XXXX XXXX XXXX {card.last4}
               </p>
               <p className="hern-card-list__exp">
                  {card.expMonth}/{card.expYear}
               </p>
               <p className="hern-card-list__card__brand">{card?.brand}</p>
            </div>
         ))}
      </div>
   )
}

export default CardList
