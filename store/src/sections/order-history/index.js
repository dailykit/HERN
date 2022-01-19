import React from 'react'
import { useSubscription } from '@apollo/react-hooks'
import { useUser } from '../../context'
import { useQueryParamState } from '../../utils'
import { GET_CARTS } from '../../graphql'
import { ProfileSidebar, OrderDetails } from '../../components'
import classNames from 'classnames'

export const OrderHistory = () => {
   return (
      <main className="hern-orders__main">
         <ProfileSidebar />
         <div className="hern-orders__order-history">
            <Listing />
            <OrderDetails />
         </div>
      </main>
   )
}

const Listing = () => {
   const [orderId, setOrderId] = useQueryParamState('id')
   const { user, isLoading } = useUser()

   //Get all the Carts to the particular user where status are not CART_PENDING
   const { loading: orderHistoryLoading, data: { carts = [] } = {} } =
      useSubscription(GET_CARTS, {
         skip: !user?.keycloakId,
         variables: {
            where: {
               customerKeycloakId: {
                  _eq: user?.keycloakId,
               },
               source: { _eq: 'a-la-carte' },
               status: { _neq: 'CART_PENDING' },
            },
         },
      })

   if (orderHistoryLoading || isLoading) return <OrderListSkeleton />
   if (!isLoading && !orderHistoryLoading && carts.length === 0)
      return <p>No orders found ! </p>
   return (
      <aside className="hern-orders__order-listing">
         <h2 className="hern-orders__order-listing__heading">Orders</h2>
         <ul className="hern-orders__order-listing__list">
            {carts.map(cart => (
               <li
                  key={cart.id}
                  className={classNames(
                     'hern-orders__order-listing__list-item',
                     {
                        'hern-orders__order-listing__list-item--active':
                           cart.id === Number(orderId),
                     }
                  )}
                  onClick={() => setOrderId(cart.id)}
               >
                  ORD: {cart.id}
               </li>
            ))}
         </ul>
      </aside>
   )
}

const OrderListSkeleton = () => {
   return (
      <aside className="hern-orders__list__skeleton">
         <h2>Orders</h2>
         <ul>
            <li></li>
            <li></li>
            <li></li>
         </ul>
      </aside>
   )
}
