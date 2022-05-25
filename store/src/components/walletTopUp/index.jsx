import React, { useState, useEffect, useRef } from 'react'
import { formatCurrency } from '../../utils'
import { PaymentOptionsRenderer } from "../../components";
import { useUser } from '../../context';
import { useRouter } from 'next/router'

function WalletTopUp(props){
   const { user } = useUser()
   const router = useRouter()

   const [topUpAmount, setTopUpAmount] = useState(null)
   const [showPaymentOptions, setShowPaymentOptions] = useState(false)
   const amountField = useRef();
   
   const handleFixTopUpClick = (e) => {
      const amount = parseInt(e.target.dataset.amount)
      amountField.current.value = amount;
      setTopUpAmount(amount);
   }

   const handleSetAmountChange = (e) => {
      let amount = parseFloat(e.target.value);
      if( !isNaN(e.target.value) && amount!=NaN && amount > 0 ){
         setTopUpAmount(e.target.value)
      }else{
         setTopUpAmount(0)
         e.target.value = ""
      }
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
                     onChange={handleSetAmountChange}
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
                     availablePaymentOptionIds={props.availablePaymentOptionIds}
                     metaData={{
                        paymentFor: "walletTopUp",
                        walletId: user.wallet.id,
                        amount: topUpAmount,
                        walletAmount: topUpAmount,
                        redirectTo: router.asPath
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