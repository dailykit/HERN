import { useMutation } from '@apollo/react-hooks'
import React from 'react'
import { useUser } from '../context'
import { MUTATIONS } from '../graphql'
import { formatCurrency } from '../utils'
import { useConfig } from '../lib'
import { Info } from '../assets/icons'

export const WalletAmount = ({ cart }) => {
   const { user } = useUser()
   const { configOf } = useConfig()
   const walletSettings = configOf('Wallet', 'rewards')

   const [amount, setAmount] = React.useState(cart.walletAmountUsable)

   const [updateCart] = useMutation(MUTATIONS.CART.UPDATE, {
      onCompleted: () => console.log('Wallet amount added!'),
      onError: error => console.log(error),
   })

   const handleSubmit = e => {
      e.preventDefault()
      if (amount <= cart.walletAmountUsable) {
         updateCart({
            variables: {
               id: cart?.id,
               _set: {
                  walletAmountUsed: amount,
               },
            },
         })
      }
   }

   if (!cart.walletAmountUsable) return null
   return (
      <div className="hern-wallet-amount">
         {cart.walletAmountUsed ? (
            <div className="hern-wallet-amount__status">
               <span>
                  {' '}
                  ${walletSettings?.label
                     ? walletSettings.label
                     : 'Wallet'}{' '}
                  amount used:{' '}
               </span>
               <span>
                  <span
                     className="hern-card-list__card__close-btn "
                     role="button"
                     tabIndex={0}
                     onClick={() =>
                        updateCart({
                           variables: {
                              id: cart.id,
                              _set: {
                                 walletAmountUsed: 0,
                              },
                           },
                        })
                     }
                  >
                     &times;{' '}
                  </span>
                  {formatCurrency(cart.walletAmountUsed)}
               </span>
            </div>
         ) : (
            <>
               <form
                  onSubmit={handleSubmit}
                  className="hern-wallet-amount__form"
               >
                  <div>
                     <label className="hern-wallet-amount__form__label">
                        {' '}
                        $
                        {walletSettings?.label
                           ? walletSettings.label
                           : 'Wallet'}{' '}
                        amount{' '}
                     </label>
                     {walletSettings?.description && (
                        <span className="hern-wallet-amount__tooltip">
                           <Info size={18} />
                           <p>
                              {walletSettings?.description
                                 ? walletSettings.description
                                 : 'Not Available'}
                           </p>
                        </span>
                     )}
                     <input
                        className="hern-wallet-amount__form__input"
                        type="number"
                        min="0"
                        step="0.01"
                        max={cart.walletAmountUsable}
                        required
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                     />
                  </div>
                  <button className="hern-wallet-amount__add-btn" type="submit">
                     Add
                  </button>
               </form>
               <div className="hern-wallet-amount__help">
                  <small>
                     Max usable:
                     {formatCurrency(cart.walletAmountUsable)}
                  </small>
                  {!!user.wallet && (
                     <small>
                        Balance:
                        {formatCurrency(user.wallet?.amount)}
                     </small>
                  )}
               </div>
            </>
         )}
      </div>
   )
}
