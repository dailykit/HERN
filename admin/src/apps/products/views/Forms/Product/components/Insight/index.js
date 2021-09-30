import React, { useState } from 'react'
import { Filler, Flex, Spacer, Text } from '@dailykit/ui'
import styled from 'styled-components'
import { StyledFlex } from '../../styled'
import './tableStyle.css'
import {
   PRODUCT_EARNING_COUNT,
   ORDERS_LIST_BY_PRODUCT,
} from '../../../../../graphql'
import { useSubscription } from '@apollo/react-hooks'
import { ReactTabulator } from '@dailykit/react-tabulator'
import moment from 'moment'
import { get_env, logger } from '../../../../../../../shared/utils'
import {
   ErrorState,
   InlineLoader,
} from '../../../../../../../shared/components'
import { toast } from 'react-toastify'
import { useTabs } from '../../../../../../../shared/providers'

//currencies
const currency = {
   USD: '$',
   INR: '₹',
   EUR: '€',
}
const ProductInsight = props => {
   const { productId } = props
   const {
      loading: subsLoading,
      error: subsError,
      data: { insights_analytics = [] } = {},
   } = useSubscription(PRODUCT_EARNING_COUNT, {
      variables: {
         earningAndCountProductArgs: {
            params: {
               where: `"isAccepted" = true AND COALESCE("isRejected", false) = false AND "paymentStatus" = \'SUCCEEDED\' `,
               productWhere: `id = ${productId}`,
            },
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
                        : insights_analytics[0].getEarningsByProducts[0]
                             .orderCount}
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
                     {subsLoading
                        ? '...'
                        : subsError
                        ? 'Data not found'
                        : currency[get_env('REACT_APP_CURRENCY')] +
                          insights_analytics[0].getEarningsByProducts[0].total}
                  </span>
               </Styles.Card>
            </Flex>
            <Flex width="100%">
               <div style={{ width: '100%' }}>
                  <DataTable productId={productId} />
               </div>
            </Flex>
         </StyledFlex>
      </>
   )
}
const DataTable = props => {
   const { productId } = props
   const { addTab, tab } = useTabs()
   const [orderData, setOrderData] = useState([])
   const [status, setStatus] = useState('loading')
   const { loading: subsLoading, error: subsError } = useSubscription(
      ORDERS_LIST_BY_PRODUCT,
      {
         variables: {
            where: {
               cart: {
                  cartItems: {
                     productId: { _eq: productId },
                     level: { _eq: 1 },
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
               each.createdAt = moment(each.created_at).format('DD-MM-YYYY')
               each.customerEmail = each.customer?.email || 'N/A'
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
      maxHeight: 420,
      resizableColumns: false,
      virtualDomBuffer: 20,
      placeholder: 'No Data Available',
      index: 'id',
      layout: 'fitDataStretch',
      resizableColumns: true,
      tooltips: true,
   }

   if (subsError) {
      logger(subsError)
      toast.error('Could not get recent orders for this product')
      return (
         <ErrorState
            height="320px"
            message="Could not get recent orders for this product"
         />
      )
   }

   if (subsLoading || status === 'loading') {
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
                     className="product-insight-table"
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
export default ProductInsight
