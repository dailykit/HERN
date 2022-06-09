import { useMutation } from '@apollo/react-hooks'
import React from 'react'
import { useUser } from '../context'
import { MUTATIONS } from '../graphql'
import { formatCurrency } from '../utils'
import { useConfig } from '../lib'
import { Info, WalletIcon } from '../assets/icons'
import classNames from 'classnames'
import { Button, LoginWarningWithText } from '.'
import Link from 'next/link'

export const WalletAmount = ({ cart, version }) => {
   const { user } = useUser()
   const { configOf } = useConfig()
   const walletSettings = configOf('Wallet', 'rewards')
   const isVersion2 = React.useMemo(() => version === 2, [version])
   const [amount, setAmount] = React.useState(cart.walletAmountUsable)

   const [updateCart] = useMutation(MUTATIONS.CART.UPDATE, {
      refetchQueries: ['subscriptionOccurenceCustomer'],
      onCompleted: () => console.log('Wallet amount added!'),
      onError: error => console.log(error),
   })
   const WalletHeader = (props) => {
      return (
         <div
            style={{
               display: 'flex',
               alignItems: 'center',
               marginBottom: props.marginBottom || '10px',
            }}
         >
            <WalletIcon />
            <label
               className="hern-wallet-amount__label-v2"
               htmlFor="wallet-amount"
            >
               {walletSettings?.label ? walletSettings.label : 'Wallet'}
            </label>
         </div>
      )
   }
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
   if (!user?.keycloakId) {
      return (
         <div
            className={classNames('hern-wallet-amount', {
               'hern-wallet-amount-v2': isVersion2,
            })}
         >
            <WalletHeader />
            <LoginWarningWithText />
         </div>
      )
   }
   if (!cart.walletAmountUsable) return (
      <div 
         className={classNames('hern-wallet-amount', {
            'hern-wallet-amount-v2': isVersion2,
         })}>
         <div className='' style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px"}}>
            <WalletHeader marginBottom="0px" />
            <div className="" style={{display: "flex", flexDirection: "column"}}>
               <small>Balance: {formatCurrency(user.wallet?.amount)}</small>
               <small><Link href={"/account/wallet"}>Top Up your wallet</Link></small>
            </div>
         </div>

      </div>
   )
   return (
      <div
         className={classNames('hern-wallet-amount', {
            'hern-wallet-amount-v2': isVersion2,
         })}
      >
         {cart.walletAmountUsed ? (
            <>
               <WalletHeader />
               <div className="hern-wallet-amount__status">
                  <span>
                     {' '}
                     {walletSettings?.label
                        ? walletSettings.label
                        : 'Wallet'}{' '}
                     amount used:{' '}
                  </span>
                  <span>
                     {formatCurrency(cart.walletAmountUsed)}
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
                  </span>
               </div>
            </>
         ) : (
            <>
               <form
                  onSubmit={handleSubmit}
                  className="hern-wallet-amount__form"
                  style={{ ...(isVersion2 && { alignItems: 'flex-end' }) }}
               >
                  <div>
                     {isVersion2 ? (
                        <WalletHeader />
                     ) : (
                        <label className="hern-wallet-amount__form__label">
                           {' '}
                           $
                           {walletSettings?.label
                              ? walletSettings.label
                              : 'Wallet'}{' '}
                           amount{' '}
                        </label>
                     )}
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
                  <Button type="submit">Add</Button>
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
               <div className="" style={{textAlign: 'right'}}>
                  <small><Link href={"/account/wallet"}>Top Up your wallet</Link></small>
               </div>
            </>
         )}
      </div>
   )
}
