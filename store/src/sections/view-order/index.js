import React, { useEffect } from 'react'
import { CartOrderDetails as OrderDetails } from '../../components'
import { useCart } from '../../context'
import { usePayment } from '../../lib'

export const CartOrderDetails = () => {
   const { setStoredCartId } = useCart()
   const { resetPaymentProviderStates } = usePayment()
   useEffect(() => {
      localStorage.removeItem('cart-id')
      setStoredCartId(null)
      resetPaymentProviderStates()
   }, [])
   return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px' }}>
         <OrderDetails />
      </div>
   )
}
