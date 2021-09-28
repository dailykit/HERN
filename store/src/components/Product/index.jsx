import React from 'react'
import { BookingProduct, RsvpProduct } from './components'
import { useUser } from '../../Providers'

export default function Product() {
   const { state: userState } = useUser()
   const { productModalType } = userState
   console.log('productModalType', productModalType)
   if (productModalType === 'booking') {
      return <BookingProduct />
   } else {
      return <RsvpProduct />
   }
}
