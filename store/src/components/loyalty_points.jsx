import { useMutation } from '@apollo/react-hooks'
import React from 'react'
import { useUser } from '../context'
import { MUTATIONS } from '../graphql'
import { useConfig } from '../lib'
import { Info } from '../assets/icons'

export const LoyaltyPoints = ({ cart }) => {
   const { user } = useUser()
   const { configOf } = useConfig()
   const { label = 'Loyalty Points', description = null } = configOf(
      'Loyalty Points',
      'rewards'
   )

   const [points, setPoints] = React.useState(cart.loyaltyPointsUsable)

   const [updateCart] = useMutation(MUTATIONS.CART.UPDATE, {
      onCompleted: () => console.log('Loyalty points added!'),
      onError: error => console.log(error),
   })

   const handleSubmit = e => {
      e.preventDefault()
      if (points <= cart.loyaltyPointsUsable) {
         updateCart({
            variables: {
               id: cart?.id,
               _set: {
                  loyaltyPointsUsed: points,
               },
            },
         })
      }
   }
   const handleUpdateCart = () => {
      updateCart({
         variables: {
            id: cart.id,
            _set: {
               loyaltyPointsUsed: 0,
            },
         },
      })
   }

   if (!cart.loyaltyPointsUsable) return null
   return (
      <div className="hern-loyalty-points">
         {cart.loyaltyPointsUsed ? (
            <div className="hern-loyalty-points__status">
               <span> {label} used: </span>
               <span>
                  <span
                     className="hern-loyalty-points__close-btn"
                     role="button"
                     tabIndex={0}
                     onClick={handleUpdateCart}
                  >
                     &times;
                  </span>
                  {cart.loyaltyPointsUsed}
               </span>
            </div>
         ) : (
            <>
               <form
                  className="hern-loyalty-points__form"
                  onSubmit={handleSubmit}
               >
                  <div>
                     <label
                        className="hern-loyalty-points__label"
                        htmlFor="loyalty-points"
                     >
                        {label}
                     </label>
                     {description && (
                        <span className="loyalty-points__tooltip">
                           <Info size={18} />
                           <p>{description}</p>
                        </span>
                     )}
                     <input
                        className="hern-loyalty-points__input"
                        type="number"
                        min="0"
                        max={cart.loyaltyPointsUsable}
                        required
                        value={points}
                        id="loyalty-points"
                        onChange={e => setPoints(e.target.value)}
                     />
                  </div>
                  <button
                     className="hern-loyalty-points__submit-btn"
                     type="submit"
                  >
                     Add
                  </button>
               </form>
               <div className="hern-loyalty-points__help">
                  <small>Max usable: {cart.loyaltyPointsUsable}</small>
                  {!!user.loyaltyPoint && (
                     <small>Balance: {user.loyaltyPoint?.points}</small>
                  )}
               </div>
            </>
         )}
      </div>
   )
}
