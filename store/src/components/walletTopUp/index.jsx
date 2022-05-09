import React, { useState, useEffect } from 'react'
import { formatCurrency } from '../../utils'
import { PaymentOptionsRenderer } from "../../components";

function WalletTopUp(props){
   const [topUpAmount, setTopUpAmount] = useState(null)

   const handleFixTopUpClick = (e) => {
      const amount = parseInt(e.target.dataset.amount)
      setTopUpAmount(amount);
   }

   return (
      <div className="hern-wallet__top-up">
         <h2 className="hern-wallet__top-up-header">Add Money</h2>
         <div className="hern-wallet__top-up-field-group">
            <p className='hern-wallet__top-up-field-group-label'>We suggest an average balance of {formatCurrency(1000)}</p>
            <div className='hern-wallet__top-up-amount-block'>
               <div className='hern-wallet__top-up-amount-field-group'>
                  <span className='hern-wallet__top-up-amount-field-icon'>{formatCurrency('')}</span>
                  <input
                     type="text"
                     placeholder="Amount"
                     value={topUpAmount}
                     onChange={e => setTopUpAmount(e.target.value)}
                     className="hern-wallet__top-up-amount"
                  />
               </div>
               <button className='hern-wallet__top-up-amount-add' data-amount={500} onClick={handleFixTopUpClick}>{formatCurrency(500)}</button>
               <button className='hern-wallet__top-up-amount-add' data-amount={1000} onClick={handleFixTopUpClick}>{formatCurrency(1000)}</button>
            </div>
         </div>
         <div className='hern-wallet__top-up-payment-block'>
            <h2 className="hern-wallet__top-up-header">Select Method to add money</h2>
            <PaymentOptionsRenderer
               cartId={5147}
               setPaymentTunnelOpen={() => { console.log("Payment Closed") }}
            />
         </div>
      </div>
   )
}

export default WalletTopUp