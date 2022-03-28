import React, { useContext } from 'react'
import moment from 'moment'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { useSubscription } from '@apollo/react-hooks'
import {
   Flex,
   Text,
   Spacer,
   ClearIcon,
   IconButton,
   TextButton,
   CloseIcon,
} from '@dailykit/ui'

import { useOrder } from '../../context'
import { MetricItem } from '../MetricItem'
import { QUERIES, QUERIES2 } from '../../graphql'
import { Wrapper, FilterSection, StyledIconButton } from './styled'
import { logger, currencyFmt } from '../../../../shared/utils'
import { InlineLoader, ErrorState } from '../../../../shared/components'
import { BrandContext } from '../../../../App'

const address = 'apps.order.components.ordersummary.'

export const OrderSummary = ({ closeOrderSummaryTunnel }) => {
   const { t } = useTranslation()
   const { state, dispatch } = useOrder()
   const [brandContext, setBrandContext] = useContext(BrandContext)
   const [ordersAggregate, setOrdersAggregate] = React.useState([])

   const { data: { orders = {} } = {} } = useSubscription(
      QUERIES.ORDERS.AGGREGATE.TOTAL,
      {
         variables: {
            where: {
               isArchived: { _eq: false },
               brandId: {
                  _in: brandContext.brandId
               }, locationId: {
                  _in: brandContext.locationId
               }
            }
         },
      }
   )
   // const { data: { orders: cancelledOrders = {} } = {} } = useSubscription(
   //    QUERIES.ORDERS.AGGREGATE.CANCELLED,
   //    {
   //       variables: {
   //          brandId: {
   //             _in: brandContext.brandId
   //          }, locationId: {
   //             _in: brandContext.locationId
   //          }
   //       }
   //    }
   // )

   // const {
   //    loading,
   //    error,
   //    data: { ordersAggregate = [] } = {},
   // } = useSubscription(QUERIES2.ORDERS_AGGREGATE)
   // console.log("orderSummary", ordersAggregate);

   const {
      loading,
      error,
   } = useSubscription(QUERIES2.ORDERS_AGGREGATE, {
      variables: {
         brandId: brandContext.brandId === null ? { _is_null: true } : {
            _in: brandContext.brandId
         },
         locationId: brandContext.locationId === null ? { _is_null: true } : {
            _in: brandContext.locationId
         },
      },
      onSubscriptionData: ({
         subscriptionData: { data: { order_orderStatusEnum = [] } = {} },
      }) => {
         const result = order_orderStatusEnum.map(order => {
            return (
               {
                  title: order.title,
                  value: order.value,
                  count: order.groupedOrderSummary[0]?.count || 0,
                  sum: order.groupedOrderSummary[0]?.sum || 0,
                  avg: order.groupedOrderSummary[0]?.avg || 0,
               }
            )
         })
         setOrdersAggregate(result)
         // console.log("orderSummary", order_orderStatusEnum);
      }
   })
   console.log("orderSummary", ordersAggregate);

   const clearFilters = () => {
      dispatch({ type: 'CLEAR_READY_BY_FILTER' })
      dispatch({ type: 'CLEAR_FULFILLMENT_FILTER' })
      dispatch({ type: 'CLEAR_FULFILLMENT_TYPE_FILTER' })
      dispatch({ type: 'CLEAR_SOURCE_FILTER' })
      dispatch({ type: 'CLEAR_AMOUNT_FILTER' })
   }

   if (loading) return <InlineLoader />
   if (error) {
      logger(error)
      toast.error('Failed to fetch the order summary!')
      return <ErrorState message="Failed to fetch the order summary!" />
   }
   return (
      <Wrapper>
         <Spacer size="8px" />
         <Flex container alignItems="center" justifyContent="space-between">
            <Text as="h4">{t(address.concat('quick info'))}</Text>
            <StyledIconButton
               type="outline"
               size="sm"
               onClick={() => closeOrderSummaryTunnel(1)}
            >
               <CloseIcon />
            </StyledIconButton>
         </Flex>
         {/* <Spacer size="6px" />
         <Flex>
            {state?.orders?.where?.cart?.order?.fulfillmentType?._eq && (
               <Tag>
                  {state?.orders?.where?.cart?.order?.fulfillmentType?._eq}
                  <styledButton
                     size="sm"
                     type="ghost"
                     onClick={() => clearFilters()}
                     style={{ marginLeft: '5px' }}
                  >
                     <Close color="#919699" size="7" />
                  </styledButton>
               </Tag>
            )}
         </Flex> */}
         <Spacer size="8px" />
         {/* <MetricItem
            title="All"
            variant="ORDER_ALL"
            count={orders?.aggregate?.count}
            amount={orders?.aggregate?.sum?.amountPaid}
            average={orders?.aggregate?.avg?.amountPaid}
            closeOrderSummaryTunnel={closeOrderSummaryTunnel}
         /> */}
         <ul>
            {ordersAggregate.map(({ title, value, count, sum, avg }) => (
               <MetricItem
                  key={value}
                  title={title}
                  variant={value}
                  count={count}
                  amount={sum}
                  average={avg}
                  closeOrderSummaryTunnel={closeOrderSummaryTunnel}
               />
            ))}
         </ul>
         {/* <MetricItem
            title="Rejected or Cancelled"
            variant="ORDER_REJECTED_OR_CANCELLED"
            count={cancelledOrders?.aggregate?.count}
            amount={cancelledOrders?.aggregate?.sum?.amountPaid}
            average={cancelledOrders?.aggregate?.avg?.amountPaid}
            closeOrderSummaryTunnel={closeOrderSummaryTunnel}
         /> */}
         <Flex container alignItems="center" justifyContent="space-between">
            <Text as="h4">Advanced Filters</Text>
            <Flex container alignItems="center">
               <IconButton
                  size="sm"
                  type="ghost"
                  onClick={() => clearFilters()}
               >
                  <ClearIcon color="#000" />
               </IconButton>
               <Spacer size="8px" xAxis />
               <TextButton
                  size="sm"
                  type="outline"
                  onClick={() =>
                     dispatch({
                        type: 'TOGGLE_FILTER_TUNNEL',
                        payload: { tunnel: true },
                     })
                  }
               >
                  View
               </TextButton>
            </Flex>
         </Flex>
         <Spacer size="16px" />
         {state.orders.where?.readyByTimestamp &&
            Object.keys(state.orders.where?.readyByTimestamp).length > 0 && (
               <>
                  <FilterSection>
                     <h3>Ready By</h3>
                     <Flex container alignItems="center" margin="8px 0 0 0">
                        <span title="From">
                           {state.orders.where?.readyByTimestamp?._gte
                              ? moment(
                                 state.orders.where?.readyByTimestamp?._gte
                              ).format('HH:MM - MMM DD, YYYY')
                              : ''}
                        </span>
                        <Spacer size="16px" xAxis />
                        <span title="To">
                           {state.orders.where?.readyByTimestamp?._lte
                              ? moment(
                                 state.orders.where?.readyByTimestamp?._lte
                              ).format('HH:MM - MMM DD, YYYY')
                              : ''}
                        </span>
                     </Flex>
                  </FilterSection>
                  <Spacer size="16px" />
               </>
            )}
         {state.orders.where?.fulfillmentTimestamp &&
            Object.keys(state.orders.where?.fulfillmentTimestamp).length >
            0 && (
               <>
                  <FilterSection>
                     <h3>Fulfillment Time</h3>
                     <Flex container alignItems="center" margin="8px 0 0 0">
                        <span title="From">
                           {state.orders.where?.fulfillmentTimestamp?._gte
                              ? moment(
                                 state.orders.where?.fulfillmentTimestamp
                                    ?._gte
                              ).format('HH:MM - MMM DD, YYYY')
                              : ''}
                        </span>
                        <Spacer size="16px" xAxis />
                        <span title="To">
                           {state.orders.where?.fulfillmentTimestamp?._lte
                              ? moment(
                                 state.orders.where?.fulfillmentTimestamp
                                    ?._lte
                              ).format('HH:MM - MMM DD, YYYY')
                              : ''}
                        </span>
                     </Flex>
                  </FilterSection>
                  <Spacer size="16px" />
               </>
            )}
         {state.orders.where?.fulfillmentType &&
            Object.keys(state.orders.where?.fulfillmentType).length > 0 && (
               <>
                  <FilterSection>
                     <h3>Fulfillment Type</h3>
                     <Flex container alignItems="center" margin="8px 0 0 0">
                        <span>{state.orders.where?.fulfillmentType?._eq}</span>
                     </Flex>
                  </FilterSection>
                  <Spacer size="16px" />
               </>
            )}
         {state.orders.where?.source &&
            Object.keys(state.orders.where?.cart?.source).length > 0 && (
               <>
                  <FilterSection>
                     <h3>Source</h3>
                     <Flex container alignItems="center" margin="8px 0 0 0">
                        <span>{state.orders.where?.cart?.source?._eq}</span>
                     </Flex>
                  </FilterSection>
                  <Spacer size="16px" />
               </>
            )}
         {state.orders.where?.amountPaid &&
            Object.keys(state.orders.where?.amountPaid).length > 0 && (
               <>
                  <FilterSection>
                     <h3>Amount</h3>
                     <Flex container alignItems="center" margin="8px 0 0 0">
                        {state.orders.where?.amountPaid?._gte && (
                           <span>
                              {currencyFmt(
                                 state.orders.where?.amountPaid?._gte || 0
                              )}
                           </span>
                        )}
                        <Spacer size="16px" xAxis />
                        {state.orders.where?.amountPaid?._lte && (
                           <span>
                              {currencyFmt(
                                 state.orders.where?.amountPaid?._lte || 0
                              )}
                           </span>
                        )}
                     </Flex>
                  </FilterSection>
                  <Spacer size="16px" />
               </>
            )}
      </Wrapper>
   )
}
