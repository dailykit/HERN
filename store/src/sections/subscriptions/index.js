import React from 'react'
import { useRouter } from 'next/router'
import { useSubscription } from '@apollo/react-hooks'

import { useConfig } from '../../lib'
import { useUser } from '../../context'
import { formatDate, getRoute, isClient } from '../../utils'
import { ORDER_HISTORY, ORDER } from '../../graphql'
import { HelperBar, ProfileSidebar, ProductSkeleton } from '../../components'
import OrderInfo from '../../sections/OrderInfo'
import classNames from 'classnames'

export const Subscriptions = () => {
   return (
      <main className="hern-orders__main">
         <ProfileSidebar />
         <div className="hern-orders__order-history">
            <Listing />
            <Details />
         </div>
      </main>
   )
}
const Listing = () => {
   const router = useRouter()
   const { user } = useUser()
   const { configOf } = useConfig()
   const [orderWindow, setOrderWindow] = React.useState(1)
   const { loading, data: { orders = {} } = {} } = useSubscription(
      ORDER_HISTORY,
      {
         variables: {
            keycloakId: { _eq: user?.keycloakId },
         },
         onSubscriptionData: ({
            subscriptionData: { data: { orders = {} } = {} } = {},
         }) => {
            if (orders.aggregate.count > 0) {
               const queryId = new URL(location.href).searchParams.get('id')
               if (!queryId) {
                  const [node] = orders.nodes
                  router.push(
                     getRoute(`/account/orders?id=${node.occurenceId}`)
                  )
               }
            }
         },
      }
   )
   const theme = configOf('theme-color', 'Visual')

   const selectOrder = id => {
      router.push(getRoute(`/account/orders?id=${id}`))
   }

   if (loading) return <OrderListSkeleton />
   return (
      <aside className="hern-orders__order-listing">
         <h2
            className="hern-orders__order-listing__heading"
            style={{
               color: `${theme.accent ? theme.accent : 'rgba(5,150,105,1)'}`,
            }}
            theme={theme}
         >
            Orders
         </h2>
         <ul className="hern-orders__order-listing__list">
            {orders.nodes.map(
               (node, i) =>
                  (i + 1 <= orderWindow ||
                     (isClient && window.innerWidth > 786)) && (
                     <li
                        key={node.occurrenceId}
                        onClick={() => selectOrder(node.occurenceId)}
                        style={{
                           backgroundColor: `${
                              theme.highlight &&
                              node.occurenceId === Number(router.query.id)
                                 ? theme.highlight
                                 : '#fff'
                           }`,
                        }}
                        className={classNames(
                           'hern-orders__order-listing__list-item',
                           {
                              'hern-orders__order-listing__list-item--active':
                                 node.occurenceId === Number(router.query.id),
                           }
                        )}
                     >
                        {formatDate(node.occurence.date, {
                           month: 'short',
                           day: 'numeric',
                           year: 'numeric',
                        })}
                     </li>
                  )
            )}
            {orders.nodes.length > orderWindow && (
               <div
                  className="hern-orders__order-listing__view-more"
                  onClick={() => setOrderWindow(orderWindow + 4)}
               >
                  View More
               </div>
            )}
         </ul>
      </aside>
   )
}

const Details = () => {
   const router = useRouter()
   const { user } = useUser()
   const { configOf } = useConfig()
   const {
      error,
      loading,
      data: { order = {} } = {},
   } = useSubscription(ORDER, {
      skip: !user?.keycloakId || !user?.brandCustomerId || !router.query.id,
      variables: {
         keycloakId: user?.keycloakId,
         subscriptionOccurenceId: router.query.id,
         brand_customerId: user?.brandCustomerId,
      },
   })
   if (!loading && error) {
      console.log(error)
   }

   const paymentMethod = user?.platform_customer?.paymentMethods.find(
      node => node.paymentMethodId === order?.cart?.paymentMethodId
   )
   const theme = configOf('theme-color', 'Visual')

   if (loading) return <OrderDetailsSkeleton />

   if (!router.query.id)
      return (
         <div className="hern-orders__order-details">
            <HelperBar type="warning">
               <HelperBar.SubTitle>
                  Select a date to view an order details
               </HelperBar.SubTitle>
            </HelperBar>
         </div>
      )
   return (
      <main className="hern-orders__order-details">
         <header className="hern-orders__order-details__header">
            <h2
               className="hern-orders__order-details__header__title"
               style={{
                  color: `${
                     theme?.accent ? theme?.accent : 'rgba(5,150,105,1)'
                  }`,
               }}
            >
               Order Details
            </h2>
            {order?.cart?.orderStatus?.title && (
               <span
                  className="hern-orders__order-details__status"
                  style={{
                     backgroundColor: `${selectColor(
                        order?.cart?.orderStatus?.title
                     )}`,
                  }}
               >
                  {order?.cart?.orderStatus?.title}
               </span>
            )}
         </header>
         <OrderInfo cart={order?.cart} />
         <h4 className="hern-orders__order-details__payment__heading">
            Payment
         </h4>
         {order?.cart?.paymentStatus !== 'SUCCEEDED' && (
            <button
               className="hern-orders__order-details__payment__complete-payment"
               onClick={() => router.push(`/checkout?id=${order?.cart?.id}`)}
            >
               Complete Payment
            </button>
         )}
         <section className="hern-orders__order-details__payment-method">
            {paymentMethod ? (
               <>
                  <div className="hern-orders__order-details__payment__card">
                     <span className="hern-orders__order-details__payment__card__name">
                        {paymentMethod?.cardHolderName}
                     </span>
                     <div>
                        <span>{paymentMethod?.expMonth}</span>
                        &nbsp;/&nbsp;
                        <span>{paymentMethod?.expYear}</span>
                     </div>
                  </div>
                  <span>
                     <span>Last 4:</span>
                     {paymentMethod?.last4}
                  </span>
               </>
            ) : (
               <p>Payment method linked to this order has been deleted.</p>
            )}
         </section>
      </main>
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
const OrderDetailsSkeleton = () => (
   <main classNames="hern-orders__order-details__skeleton">
      <h2>Order Details</h2>
      <ProductSkeleton />
      <ProductSkeleton />
   </main>
)

const selectColor = variant => {
   switch (variant) {
      case 'ORDER_PENDING':
         return '#FF5A52'
      case 'ORDER_UNDER_PROCESSING':
         return '#FBB13C'
      case 'ORDER_READY_TO_DISPATCH':
         return '#3C91E6'
      case 'ORDER_OUT_FOR_DELIVERY':
         return '#1EA896'
      case 'ORDER_DELIVERED':
         return '#53C22B'
      default:
         return '#FF5A52'
   }
}
