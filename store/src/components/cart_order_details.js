import React from 'react'
import _ from 'lodash'
import { useSubscription } from '@apollo/react-hooks'
import moment from 'moment'
import classNames from 'classnames'

import { CartBillingDetails } from './cart_billing_details'
import { DebitCardIcon, LocationIcon } from '../assets/icons'
import TimeIcon from '../assets/icons/Time'
import { GET_ORDER_DETAILS } from '../graphql'
import { combineCartItems, formatCurrency, useQueryParamState } from '../utils'
import { Loader } from './loader'
import { Empty } from 'antd'

export const CartOrderDetails = () => {
   const [cartId] = useQueryParamState('id')

   const {
      error,
      loading: orderHistoryLoading,
      data: { carts = [] } = {},
   } = useSubscription(GET_ORDER_DETAILS, {
      skip: !cartId,
      variables: {
         where: {
            id: { _eq: Number(cartId) },
         },
      },
   })
   if (!cartId) return <Empty />

   if (orderHistoryLoading) return <Loader />
   if (error)
      return (
         <h2 style={{ padding: '75px 0', textAlign: 'center' }}>
            Something went wrong! <br /> Please reload the page
         </h2>
      )
   const cart = carts[0]
   const addressInfo = cart?.address

   return (
      <>
         <div className="hern-order-history-card__tunnel-address">
            <span style={{ minWidth: '24px' }}>
               <LocationIcon size={20} />
            </span>
            <span>
               {!_.isEmpty(addressInfo) && (
                  <div>
                     <span>{addressInfo.label}</span>
                     <span>{addressInfo.line1}</span>
                     <span>{addressInfo.line2}</span>
                     <span>
                        {addressInfo.city} {addressInfo.state}{' '}
                        {addressInfo.country}
                        {' ('}
                        {addressInfo.zipcode}
                        {')'}
                     </span>
                  </div>
               )}
            </span>
         </div>
         <div className="hern-order-history-card__tunnel-fulfillment-info">
            <span style={{ minWidth: '24px' }}>
               <TimeIcon color="rgba(64, 64, 64, 0.6)" size={16} />
            </span>
            <div>
               {getTitle(cart?.fulfillmentInfo?.type)}{' '}
               {(cart?.fulfillmentInfo?.type === 'PREORDER_PICKUP' ||
                  cart?.fulfillmentInfo?.type === 'PREORDER_DELIVERY') && (
                  <span>
                     {' '}
                     on{' '}
                     {moment(cart?.fulfillmentInfo?.slot?.from).format(
                        'DD MMM YYYY'
                     )}
                     {' ('}
                     {moment(cart?.fulfillmentInfo?.slot?.from).format('HH:mm')}
                     {'-'}
                     {moment(cart?.fulfillmentInfo?.slot?.to).format('HH:mm')}
                     {')'}
                  </span>
               )}
            </div>
         </div>
         <div className="hern-order-history-card__tunnel-payment-info">
            <span style={{ minWidth: '24px' }}>
               <DebitCardIcon size={20} />
            </span>
            {cart?.cartPayments?.length > 0 && (
               <div>Payment: Paid by {cart?.availablePaymentOption?.label}</div>
            )}
         </div>
         <CartItems products={cart?.cartItems} border={true} title={true} />
         <CartBillingDetails billing={cart?.billingDetails} />
      </>
   )
}

const CartItems = ({ products, border = false, title = false }) => {
   const cartItems = combineCartItems(products)

   return (
      <div
         className={classNames({
            'hern-order-history__cart-items__wrapper': border,
         })}
      >
         {title && (
            <h3 className="hern-order-history__cart-items__title">
               Items({cartItems?.length})
            </h3>
         )}
         {cartItems.map((product, index) => {
            return (
               <div
                  className="hern-order-history__cart-items"
                  style={{
                     borderBottom: `${
                        cartItems?.length > 1
                           ? '1px solid rgba(64, 64, 64, 0.25)'
                           : 'none'
                     }`,
                     border: `${border && '1px solid rgba(64, 64, 64, 0.25)'}`,
                     paddingLeft: `${border && '16px'}`,
                  }}
               >
                  <div
                     className="hern-order-history-card__product-title"
                     key={index}
                  >
                     <div>{product.name}</div>
                     <span>x{product.ids.length}</span>
                  </div>
                  {product.childs.length > 0 && (
                     <ModifiersList data={product} />
                  )}
               </div>
            )
         })}
      </div>
   )
}
const ModifiersList = props => {
   const { data } = props
   return (
      <div className="hern-order-history-card__modifier-list">
         <span>{data.childs[0].productOption.label || 'N/A'}</span>{' '}
         {data.childs[0].price !== 0 && (
            <div>
               {data.childs[0].discount > 0 && (
                  <span
                     style={{
                        textDecoration: 'line-through',
                     }}
                  >
                     {formatCurrency(data.childs[0].price)}
                  </span>
               )}
               <span style={{ marginLeft: '6px' }}>
                  {formatCurrency(
                     data.childs[0].price - data.childs[0].discount
                  )}
               </span>
            </div>
         )}
      </div>
   )
}

const getTitle = type => {
   switch (type) {
      case 'ONDEMAND_DELIVERY':
         return 'Delivery'
      case 'PREORDER_DELIVERY':
         return 'Schedule Delivery'
      case 'PREORDER_PICKUP':
         return 'Schedule Pickup'
      case 'ONDEMAND_PICKUP':
         return 'Pickup'
   }
}
