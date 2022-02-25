import React, { useEffect } from 'react'
import { CartOrderDetails as OrderDetails } from '../../components'
import { useCart } from '../../context'

export const CartOrderDetails = () => {
   const { setStoredCartId } = useCart()
   useEffect(() => {
      localStorage.removeItem('cart-id')
      setStoredCartId(null)
   }, [])
   return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px' }}>
         <OrderDetails />
      </div>
   )
}
