import { useMutation } from '@apollo/react-hooks'
import React from 'react'
import { useUser } from '../context'
import { MUTATIONS } from '../graphql'
import { useConfig } from '../lib'
import { Info, LoyaltyPointsIcon } from '../assets/icons'
import classNames from 'classnames'
import { Button, LoginWarningWithText } from '.'

export const LoyaltyPoints = ({ cart, version = 1 }) => {
   const { user } = useUser()
   const { configOf } = useConfig()
   const { label = 'Loyalty Points', description = null } = configOf(
      'Loyalty Points',
      'rewards'
   )
   const isVersion2 = React.useMemo(() => version === 2, [version])

   const [points, setPoints] = React.useState(
      cart.loyaltyPointsUsed < cart.loyaltyPointsUsable
         ? cart.loyaltyPointsUsed
         : cart.loyaltyPointsUsable
   )
   console.log(
      cart.loyaltyPointsUsed < cart.loyaltyPointsUsable,
      cart.loyaltyPointsUsed,
      cart.loyaltyPointsUsable
   )
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
   const LoyaltyPointsHeader = () => {
      return (
         <div
            style={{
               display: 'flex',
               alignItems: 'center',
               marginBottom: '10px',
            }}
         >
            {isVersion2 && <LoyaltyPointsIcon />}
            <label
               className="hern-loyalty-points__label"
               className={classNames('hern-loyalty-points__label', {
                  'hern-loyalty-points__label-v2': isVersion2,
               })}
               htmlFor="loyalty-points"
            >
               {label}
            </label>
         </div>
      )
   }
   if (!user?.keycloakId) {
      return (
         <div
            className="hern-loyalty-points"
            className={classNames('hern-loyalty-points', {
               'hern-loyalty-points-v2': isVersion2,
            })}
         >
            <LoyaltyPointsHeader />
            <LoginWarningWithText />
         </div>
      )
   }

   if (!cart.loyaltyPointsUsable) return null

   return (
      <div
         className="hern-loyalty-points"
         className={classNames('hern-loyalty-points', {
            'hern-loyalty-points-v2': isVersion2,
         })}
      >
         {cart.loyaltyPointsUsed ? (
            <>
               <LoyaltyPointsHeader />
               <div className="hern-loyalty-points__status">
                  <span> {label} used: </span>
                  <span>
                     {cart.loyaltyPointsUsed}
                     <span
                        className="hern-loyalty-points__close-btn"
                        role="button"
                        tabIndex={0}
                        onClick={handleUpdateCart}
                     >
                        &times;
                     </span>
                  </span>
               </div>
            </>
         ) : (
            <>
               <form
                  className="hern-loyalty-points__form"
                  onSubmit={handleSubmit}
                  style={{ ...(isVersion2 && { alignItems: 'flex-end' }) }}
               >
                  <div style={{ width: '100%' }}>
                     {/* <LoyaltyPointsHeader /> */}
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
                        placeholder="enter your Loyalty Points"
                        required
                        value={points === 0 ? '' : points}
                        id="loyalty-points"
                        onChange={e => setPoints(e.target.value)}
                     />
                  </div>
                  <Button variant="outline" type="submit">
                     Add
                  </Button>
               </form>
               <div className="hern-loyalty-points__help">
                  <small>
                     You can use max {cart.loyaltyPointsUsable} Points
                  </small>
                  {!!user.loyaltyPoint && (
                     <p>
                        <LoyaltyPointsIcon color="#FFDD15" size={20} />
                        {user.loyaltyPoint?.points}
                     </p>
                  )}
               </div>
            </>
         )}
      </div>
   )
}
