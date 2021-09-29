import React, { useState } from 'react'
import { useSubscription } from '@apollo/react-hooks'
import {
   INGREDIENT_ORDER_COUNT,
   SALES_BY_INGREDIENT,
   ORDER_LIST_FROM_INGREDIENT,
} from '../../../../../graphql'
import { StyledFlex } from '../../../Product/styled'
import styled from 'styled-components'
import { Flex, Text, Spacer, Filler } from '@dailykit/ui'
import moment from 'moment'
import './tableStyle.css'
import { get_env, logger } from '../../../../../../../shared/utils'
import {
   ErrorState,
   InlineLoader,
} from '../../../../../../../shared/components'
import { toast } from 'react-toastify'
import { useTabs } from '../../../../../../../shared/providers'
import { ReactTabulator } from '@dailykit/react-tabulator'

//currencies
const currency = {
   USD: '$',
   INR: '₹',
   EUR: '€',
}

const IngredientInsight = props => {
   const { ingredientId } = props
   const {
      loading: orderCountLoading,
      error: orderCountError,
      data: { ordersAggregate = {} } = {},
   } = useSubscription(INGREDIENT_ORDER_COUNT, {
      variables: {
         where: {
            cart: {
               cartItems: {
                  level: { _eq: 4 },
                  ingredientSachet: { ingredientId: { _eq: ingredientId } },
               },
               paymentStatus: { _eq: 'SUCCEEDED' },
            },
            isAccepted: { _eq: true },
            _or: [
               { isRejected: { _eq: false } },
               { isRejected: { _is_null: true } },
            ],
         },
      },
   })
   const {
      loading: salesLoading,
      error: salesError,
      data: { cartItemsAggregate = {} } = {},
   } = useSubscription(SALES_BY_INGREDIENT, {
      variables: {
         where: {
            cart: {
               paymentStatus: { _eq: 'SUCCEEDED' },
               order: {
                  isAccepted: { _eq: true },
                  _or: [
                     { isRejected: { _eq: false } },
                     { isRejected: { _is_null: true } },
                  ],
               },
            },
            ingredientSachet: { ingredientId: { _eq: ingredientId } },
            level: { _eq: 4 },
         },
      },
   })
   console.log('ingredientInsight', ordersAggregate, cartItemsAggregate)
   return (
      <>
         <StyledFlex
            as="section"
            container
            alignItems="start"
            justifyContent="space-between"
         >
            <Flex padding="3px 0 3px 37px ">
               <Styles.Card>
                  <span>Order Placed</span>
                  <br />
                  <span
                     style={{
                        color: '#367BF5',
                        fontWeight: '500',
                        fontsize: '36px',
                        lineHeight: '42px',
                     }}
                  >
                     {orderCountLoading
                        ? '...'
                        : orderCountError
                        ? 'Data not found'
                        : ordersAggregate.aggregate.count || 0}
                  </span>
               </Styles.Card>
               <Styles.Card>
                  <span>Sales</span>
                  <span
                     style={{
                        color: '#367BF5',
                        fontWeight: '500',
                        fontsize: '36px',
                        lineHeight: '42px',
                     }}
                  >
                     {salesLoading
                        ? '...'
                        : salesError
                        ? 'Data not found'
                        : (currency[get_env('REACT_APP_CURRENCY')] ||
                             `${get_env('REACT_APP_CURRENCY')} `) +
                          (cartItemsAggregate.aggregate.sum.unitPrice || 0)}
                  </span>
               </Styles.Card>
            </Flex>
            <Flex width="100%" padding="3px 0">
               <DataTable ingredientId={ingredientId} />
            </Flex>
         </StyledFlex>
      </>
   )
}

const DataTable = props => {
   const { ingredientId } = props
   const { addTab, tab } = useTabs()

   const [orderData, setOrderData] = useState([])
   const [status, setStatus] = useState('loading')
   const { loading: orderListLoading, error: orderListError } = useSubscription(
      ORDER_LIST_FROM_INGREDIENT,
      {
         variables: {
            where: {
               cart: {
                  cartItems: {
                     level: { _eq: 4 },
                     ingredientSachet: { ingredientId: { _eq: ingredientId } },
                  },
                  paymentStatus: { _eq: 'SUCCEEDED' },
               },
               isAccepted: { _eq: true },
               _or: [
                  { isRejected: { _eq: false } },
                  { isRejected: { _is_null: true } },
               ],
            },
         },
         onSubscriptionData: ({ subscriptionData }) => {
            const newData = subscriptionData.data.orders.map(each => {
               each.customerEmail = each.customer?.email || 'N/A'
               each.createdAt = moment(each.created_at).format('DD-MM-YYYY')
               return each
            })
            setOrderData(newData)
            setStatus('success')
         },
      }
   )
   const columns = [
      {
         title: 'OrderId',
         field: 'id',
         hozAlign: 'center',
         cellClick: (e, cell) => {
            const { id } = cell._cell.row.data
            addTab(`ORD${id}`, `/order/orders/${id}`)
         },
         cssClass: 'click-col',
      },
      {
         title: 'Customer Email',
         field: 'customerEmail',
         width: 350,
      },
      {
         title: 'Created At',
         field: 'createdAt',
      },
   ]

   //tableOptions
   const options = {
      cellVertAlign: 'middle',
      autoResize: true,
      maxHeight: 400,
      resizableColumns: false,
      virtualDomBuffer: 20,
      placeholder: 'No Data Available',
      index: 'id',
      layout: 'fitDataStretch',
      resizableColumns: true,
      tooltips: true,
   }

   if (orderListError) {
      logger(orderListError)
      toast.error('Could not get recent orders for this ingredient')
      return (
         <ErrorState
            height="320px"
            message="Could not get recent orders for this ingredient"
         />
      )
   }

   if (orderListLoading || status === 'loading') {
      return <InlineLoader />
   }

   return (
      <>
         <div
            style={{
               background: '#FFFFFF',
               boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
               borderRadius: '10px',
               padding: '15px 0',
               margin: '0 16px',
            }}
         >
            <Text as="h2" style={{ padding: '0px 15px' }}>
               Recent orders
            </Text>
            <Spacer size="10px" />

            {orderData.length === 0 ? (
               <Filler message="No Orders For This Ingredient" />
            ) : (
               <ReactTabulator
                  columns={columns}
                  options={options}
                  data={orderData}
                  className="ingredient-insight-table"
               />
            )}
         </div>
      </>
   )
}
const Styles = {
   Card: styled.div`
      width: 270px;
      height: 130px;
      background: #f9f9f9;
      border-radius: 15px;
      margin-bottom: 16px;
      padding: 15px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      span {
         font-weight: 500;
         font-size: 28px;
         line-height: 33px;
         letter-spacing: 0.44px;
      }
   `,
}
export default IngredientInsight
