import React, { useState } from 'react'
import { useSubscription } from '@apollo/react-hooks'
import { useTranslation, useUser } from '../../context'
import {
   combineCartItems,
   formatCurrency,
   useQueryParamState,
} from '../../utils'

import { GET_ORDER_DETAILS } from '../../graphql'
import {
   ProfileSidebar,
   Button,
   Tunnel,
   CartOrderDetails,
   Empty,
} from '../../components'
import classNames from 'classnames'
import moment from 'moment'
import { Select } from 'antd'
import _ from 'lodash'

export const OrderHistory = () => {
   return (
      <main className="hern-orders__main">
         <ProfileSidebar />
         <OrderCards />
      </main>
   )
}

const OrderCards = () => {
   const { t } = useTranslation()
   const { user, isLoading } = useUser()
   const [status, setOrderStatus] = useState('')
   const [orderDate, setOrderDate] = useState('')
   //Get all the Carts to the particular user where status are not CART_PENDING
   const [orders, setOrders] = useState([])
   const {
      error,
      loading: orderHistoryLoading,
      data: { carts = [] } = {},
   } = useSubscription(GET_ORDER_DETAILS, {
      skip: !user?.keycloakId,
      variables: {
         where: {
            customerKeycloakId: {
               _eq: user?.keycloakId,
            },
            status: { _neq: 'CART_PENDING' },
         },
      },
   })
   React.useEffect(() => {
      if (status === '' && orderDate === '') {
         setOrders(carts)
      } else if (!_.isEmpty(status) && orderDate === '') {
         const orders = carts.filter(cart => cart.status === status)
         setOrders(orders)
      } else if (!_.isEmpty(orderDate) && status === '') {
         const orders = carts.filter(
            cart =>
               moment(cart.order.created_at).format('DD MMM YYYY') === orderDate
         )
         setOrders(orders)
      } else {
         const orders = carts.filter(
            cart =>
               cart.status === status &&
               moment(cart.order.created_at).format('DD MMM YYYY') === orderDate
         )
         setOrders(orders)
      }
   }, [carts, status, orderDate])
   if (orderHistoryLoading || isLoading) return <OrderListSkeleton />

   if (error) return <p>{t('Error')}</p>

   const orderDates = _.uniq(
      carts.map(cart => moment(cart.order.created_at).format('DD MMM YYYY'))
   )
   const orderStatus = _.uniq(carts.map(cart => cart.status))
   if (_.isEmpty(orders))
      return (
         <Empty
            title={t('No Orders yet !')}
            description={t(
               'Looks like you haven’t made any order yet. Order some yummy items'
            )}
            route="/order"
            buttonLabel={t('Go to menu')}
         />
      )
   return (
      <div className="hern-order-history__wrapper">
         <h2 className="hern-order-history__title">{t('Orders')}</h2>
         <div className="hern-order-hisoty__filter">
            <Select
               labelInValue
               defaultValue={{ value: t('Select Date') }}
               style={{ width: 120 }}
               onChange={data => setOrderDate(data.value)}
            >
               <Select.Option value="">{t('Select Date')}</Select.Option>
               {orderDates.map(date => (
                  <Select.Option key={date} value={date}>
                     {date}
                  </Select.Option>
               ))}
            </Select>
            <Select
               labelInValue
               defaultValue={{ value: t('All Orders') }}
               style={{ width: 240 }}
               onChange={data => setOrderStatus(data.value)}
            >
               <Select.Option value="">{t('All Orders')}</Select.Option>
               {orderStatus.map(status => (
                  <Select.Option key={status} value={status}>
                     {_.startCase(_.toLower(status.replaceAll('_', ' ')))}
                  </Select.Option>
               ))}
            </Select>
         </div>

         {orders.length > 0 ? (
            <ul>
               {orders.map(cart => (
                  <OrderCard key={cart.id} cart={cart} />
               ))}
            </ul>
         ) : (
            <Empty />
         )}
      </div>
   )
}

const OrderCard = ({ cart }) => {
   const { t } = useTranslation()
   const [cartId, setId, deleteId] = useQueryParamState('id')
   return (
      <div className="hern-order-history-card">
         <div className="hern-order-history-card__status">
            <div
               style={{
                  color: 'rgba(64, 64, 64, 0.6)',
                  fontSize: '16px',
               }}
            >
               {getTitle(cart?.fulfillmentInfo?.type)}
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
            <div
               style={{
                  color: selectColor(cart.status),
                  fontSize: '18px',
                  fontWeight: '600',
                  fontStyle: 'italic',
               }}
            >
               {_.startCase(_.toLower(cart.status.replaceAll('_', ' ')))}
            </div>
         </div>

         <CartItems products={cart?.cartItems} />
         <Button style={{ height: '3.5rem' }} onClick={() => setId(cart?.id)}>
            {t(' View Details')}
         </Button>
         <Tunnel.Right
            title={`Order #${cart.id}`}
            visible={Number(cartId) === cart.id}
            onClose={() => deleteId('id')}
         >
            <CartOrderDetails />
         </Tunnel.Right>
      </div>
   )
}

const CartItems = ({ products, border = false, title = false }) => {
   const cartItems = combineCartItems(products)
   const { t, dynamicTrans, locale } = useTranslation()

   const currentLang = React.useMemo(() => locale, [locale])

   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])

   return (
      <div
         className={classNames({
            'hern-order-history__cart-items__wrapper': border,
         })}
      >
         {title && (
            <h3 className="hern-order-history__cart-items__title">
               <span> {t('Items')}</span>({cartItems?.length})
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
                     <div data-translation="true">{product.name}</div>
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
   const { dynamicTrans, locale } = useTranslation()

   const currentLang = React.useMemo(() => locale, [locale])

   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])
   return (
      <div className="hern-order-history-card__modifier-list">
         <span data-translation="true">
            {data.childs[0].productOption.label || 'N/A'}
         </span>{' '}
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

const OrderListSkeleton = () => {
   const { t } = useTranslation()
   return (
      <aside className="hern-orders__list__skeleton">
         <h2>{t('Orders')}</h2>
         <ul>
            <li></li>
            <li></li>
            <li></li>
         </ul>
      </aside>
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
