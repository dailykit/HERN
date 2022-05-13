import React, { useState, useEffect, useRef } from 'react'
import { formatCurrency } from '../../utils'
import { PaymentOptionsRenderer } from "../../components";
import { useUser } from '../../context';

function WalletTopUp(props){
   const { user } = useUser()
   const [topUpAmount, setTopUpAmount] = useState(null)
   const [showPaymentOptions, setShowPaymentOptions] = useState(false)
   const amountField = useRef();
   
   const handleFixTopUpClick = (e) => {
      const amount = parseInt(e.target.dataset.amount)
      amountField.current.value = amount;
      setTopUpAmount(amount);
   }

   useEffect(()=>{
      if(topUpAmount>0){
         setShowPaymentOptions(true)
      }else{
         setShowPaymentOptions(false)
      }
   }, [topUpAmount])

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
                     ref={amountField}
                     placeholder="Amount"
                     onChange={e => setTopUpAmount(e.target.value)}
                     className="hern-wallet__top-up-amount"
                  />
               </div>
               <button className='hern-wallet__top-up-amount-add' data-amount={500} onClick={handleFixTopUpClick}>{formatCurrency(500)}</button>
               <button className='hern-wallet__top-up-amount-add' data-amount={1000} onClick={handleFixTopUpClick}>{formatCurrency(1000)}</button>
            </div>
         </div>
         <div className='hern-wallet__top-up-payment-block'>
            {showPaymentOptions &&
               <>
                  <h2 className="hern-wallet__top-up-header">Select Method to add money</h2>               
                  <PaymentOptionsRenderer
                     amount={topUpAmount}
                     availablePaymentOptionIds={[1001, 1003]}
                     metaData={{
                        paymentFor: "walletTopUp",
                        walletId: user.wallet.id,
                        amount: topUpAmount,
                        walletAmount: topUpAmount
                     }}
                     setPaymentTunnelOpen={() => { console.log("Payment Closed") }}
                     onPaymentSuccess={()=>{ 
                        console.log("===> Payment Success! [in functioned passed in paymentOptionRenderer]") 
                     }}
                     onPaymentCancel={()=>{
                        console.log("===> Payment Canceled! [in functioned passed in paymentOptionRenderer]") 
                     }}
                  />
               </>
            }
         </div>
      </div>
   )
}

export default WalletTopUp