import { useSubscription } from '@apollo/react-hooks'
import { ReactTabulator } from '@dailykit/react-tabulator'
import { Filler, Flex, Spacer, Text } from '@dailykit/ui'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import {
   ErrorState,
   InlineLoader,
} from '../../../../../../../shared/components'
import { useTabs } from '../../../../../../../shared/providers'
import { get_env, logger } from '../../../../../../../shared/utils'
import {
   RECIPE_EARNING,
   ORDER_BY_RECIPE,
   RECIPE_COUNT,
} from '../../../../../graphql'
import { StyledFlex } from '../../../Product/styled'
//currencies
const currency = {
   USD: '$',
   INR: '₹',
   EUR: '€',
}
const RecipeInsights = props => {
   const { recipeId } = props
   const {
      loading: subsLoading,
      error: subsError,
      data: { cartItemsAggregate = {} } = {},
   } = useSubscription(RECIPE_EARNING, {
      variables: {
         cartItemWhere: {
            level: { _eq: 3 },
            simpleRecipeYield: { simpleRecipeId: { _eq: recipeId } },
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
         },
      },
   })
   const {
      loading: orderAggLoading,
      error: orderAggError,
      data: { ordersAggregate = {} } = {},
   } = useSubscription(RECIPE_COUNT, {
      variables: {
         where: {
            cart: {
               cartItems: {
                  simpleRecipeYield: { simpleRecipeId: { _eq: recipeId } },
                  level: { _eq: 3 },
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

   return (
      <>
         <StyledFlex
            as="section"
            container
            alignItems="start"
            justifyContent="space-between"
         >
            <Flex>
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
                     {subsLoading
                        ? '...'
                        : subsError
                        ? 'Data not found'
                        : (currency[get_env('REACT_APP_CURRENCY')] ||
                             `${get_env('REACT_APP_CURRENCY')} `) +
                          (cartItemsAggregate.aggregate.sum.unitPrice || 0)}
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
                     {orderAggLoading
                        ? '...'
                        : orderAggError
                        ? 'Data not found'
                        : ordersAggregate.aggregate.count}
                  </span>
               </Styles.Card>
            </Flex>
            <Flex width="100%">
               <div style={{ width: '100%' }}>
                  <DataTable recipeId={recipeId} />
               </div>
            </Flex>
         </StyledFlex>
      </>
   )
}
const DataTable = props => {
   const { recipeId } = props
   const { addTab } = useTabs()
   const [orderData, setOrderData] = useState([])
   const [status, setStatus] = useState('loading')

   //subscription for orders which includes this recipe
   const { loading: orderSubsLoading, error: orderSubsError } = useSubscription(
      ORDER_BY_RECIPE,
      {
         variables: {
            where: {
               cart: {
                  cartItems: {
                     level: { _eq: 3 },
                     simpleRecipeYield: { simpleRecipeId: { _eq: recipeId } },
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
               each.createdAt = each.created_at
               return each
            })
            setOrderData(newData)
            setStatus('success')
         },
      }
   )

   //columns for table
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
      maxHeight: 420,
      resizableColumns: false,
      virtualDomBuffer: 20,
      placeholder: 'No Data Available',
      index: 'id',
      layout: 'fitDataStretch',
      resizableColumns: true,
      tooltips: true,
   }

   //error handler
   if (orderSubsError) {
      logger(orderSubsError)
      toast.error('Could not get recent orders for this recipe')
      return (
         <ErrorState
            height="320px"
            message="Could not get recent orders for this recipe"
         />
      )
   }

   //loading
   if (orderSubsLoading || status === 'loading') {
      return <InlineLoader />
   }

   return (
      <>
         <Flex padding="0 0 0 16px">
            <div
               style={{
                  background: '#FFFFFF',
                  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
                  borderRadius: '10px',
                  padding: '15px 0px',
               }}
            >
               <Text as="h2" style={{ padding: '0px 15px' }}>
                  Recent orders
               </Text>
               <Spacer size="10px" />
               {orderData.length === 0 ? (
                  <Filler message="No Orders For This Product" />
               ) : (
                  <ReactTabulator
                     columns={columns}
                     options={options}
                     data={orderData}
                     className="recipe-insight-table"
                  />
               )}
            </div>
         </Flex>
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
export default RecipeInsights
