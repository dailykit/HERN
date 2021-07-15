import React from 'react'
import _ from 'lodash'
import moment from 'moment'
import DateTime from 'react-datetime'
import styled from 'styled-components'
import {
   Text,
   Flex,
   Form,
   Spacer,
   Dropdown,
   ClearIcon,
   RadioGroup,
   IconButton,
   TunnelHeader,
} from '@dailykit/ui'

import 'react-datetime/css/react-datetime.css'
import { useOrder, useConfig } from '../../context'
import { Banner, Tooltip } from '../../../../shared/components'

const formatDateTime = input => moment(input).format('YYYY-MM-DD HH:MM')
const isValidDateTime = input => moment(input, 'YYYY-MM-DD HH:MM').isValid()

export const FilterTunnel = () => {
   const { state, dispatch } = useOrder()
   const [fulfillmentTypes] = React.useState([
      { id: 1, title: 'PREORDER_DELIVERY' },
      { id: 2, title: 'ONDEMAND_DELIVERY' },
      { id: 3, title: 'PREORDER_PICKUP' },
      { id: 4, title: 'ONDEMAND_PICKUP' },
   ])

   const onDateTimeBlur = ({ data, field, op }) => {
      const datetime = formatDateTime(data)
      if (!isValidDateTime(datetime)) return

      dispatch({
         type: 'SET_FILTER',
         payload: {
            cart: {
               ...state?.where?.cart,
               order: {
                  ...(state?.where?.cart?.order || {}),
                  [field]: {
                     ...(state?.where?.cart?.order?.[field] || ''),
                     [op]: datetime,
                  },
               },
            },
         },
      })
   }

   return (
      <>
         <TunnelHeader
            title="Advanced Filters"
            close={() =>
               dispatch({
                  type: 'TOGGLE_FILTER_TUNNEL',
                  payload: { tunnel: false },
               })
            }
            tooltip={<Tooltip identifier="app_order_tunnel_filter_heading" />}
         />
         <Banner id="order-app-filter-tunnel-top" />
         <Wrapper padding="16px" overflowY="auto" height="calc(100% - 105px)">
            {/* <Flex container alignItems="center" justifyContent="space-between">
               <Text as="h3">Ready By</Text>
               <IconButton
                  size="sm"
                  type="ghost"
                  onClick={() => dispatch({ type: 'CLEAR_READY_BY_FILTER' })}
               >
                  <ClearIcon size={20} />
               </IconButton>
            </Flex>
            <Spacer size="8px" />
            <Flex container alignItems="center">
               <DateTime
                  inputProps={{
                     className: 'field__datetime',
                     placeholder: 'greater than',
                  }}
                  onBlur={data =>
                     onDateTimeBlur({
                        data,
                        op: '_gte',
                        field: 'readyByTimestamp',
                     })
                  }
                  value={
                     isValidDateTime(state.orders.where?.readyByTimestamp?._gte)
                        ? formatDateTime(
                             state.orders.where?.readyByTimestamp?._gte
                          )
                        : ''
                  }
               />
               <Spacer size="8px" xAxis />
               <DateTime
                  inputProps={{
                     placeholder: 'less than',
                     className: 'field__datetime',
                  }}
                  value={
                     isValidDateTime(state.orders.where?.readyByTimestamp?._lte)
                        ? formatDateTime(
                             state.orders.where?.readyByTimestamp?._lte
                          )
                        : ''
                  }
                  onBlur={data =>
                     onDateTimeBlur({
                        data,
                        op: '_lte',
                        field: 'readyByTimestamp',
                     })
                  }
               />
            </Flex>
            <Spacer size="16px" />
             */}
            <Flex container alignItems="center" justifyContent="space-between">
               <Text as="h3">Fulfillment Time</Text>
               <IconButton
                  size="sm"
                  type="ghost"
                  onClick={() => dispatch({ type: 'CLEAR_FULFILLMENT_FILTER' })}
               >
                  <ClearIcon size={20} />
               </IconButton>
            </Flex>
            <Spacer size="8px" />
            <Flex container alignItems="center">
               <DateTime
                  inputProps={{
                     className: 'field__datetime',
                     placeholder: 'greater than',
                  }}
                  value={
                     isValidDateTime(
                        state.orders.where?.cart?.order?.fulfillmentTimestamp
                           ?._gte
                     )
                        ? formatDateTime(
                             state.orders.where?.cart?.order
                                ?.fulfillmentTimestamp?._gte
                          )
                        : ''
                  }
                  onBlur={data =>
                     onDateTimeBlur({
                        data,
                        op: '_gte',
                        field: 'fulfillmentTimestamp',
                     })
                  }
               />
               <Spacer size="8px" xAxis />
               <DateTime
                  inputProps={{
                     placeholder: 'less than',
                     className: 'field__datetime',
                  }}
                  value={
                     isValidDateTime(
                        state.orders.where?.fulfillmentTimestamp?._lte
                     )
                        ? formatDateTime(
                             state.orders.where?.fulfillmentTimestamp?._lte
                          )
                        : ''
                  }
                  onBlur={data =>
                     onDateTimeBlur({
                        data,
                        field: 'fulfillmentTimestamp',
                        op: '_lte',
                     })
                  }
               />
            </Flex>
            <Spacer size="16px" />
            <Flex container alignItems="center" justifyContent="space-between">
               <Text as="h3">Source</Text>
               <IconButton
                  size="sm"
                  type="ghost"
                  onClick={() => dispatch({ type: 'CLEAR_SOURCE_FILTER' })}
               >
                  <ClearIcon size={20} />
               </IconButton>
            </Flex>
            <Spacer size="8px" />
            <RadioGroup
               options={[
                  { id: 1, title: 'a-la-carte' },
                  { id: 2, title: 'Subscription' },
               ]}
               onChange={option =>
                  dispatch({
                     type: 'SET_FILTER',
                     payload: {
                        cart: {
                           ...state.orders.where?.cart,
                           source: {
                              _eq:
                                 option.id === 1
                                    ? 'a-la-carte'
                                    : 'subscription',
                           },
                        },
                     },
                  })
               }
            />
            <Spacer size="16px" />
            <Flex container alignItems="center" justifyContent="space-between">
               <Text as="h3">Amount</Text>
               <IconButton
                  size="sm"
                  type="ghost"
                  onClick={() => dispatch({ type: 'CLEAR_AMOUNT_FILTER' })}
               >
                  <ClearIcon size={20} />
               </IconButton>
            </Flex>
            <Spacer size="8px" />
            <Flex container alignItems="center">
               <Form.Group>
                  <Form.Label htmlFor="greater_than" title="greater_than">
                     Greater Than*
                  </Form.Label>
                  <Form.Text
                     id="greater_than"
                     name="greater_than"
                     placeholder="greater than"
                     value={
                        state.orders.where?.cart?.order?.amountPaid?._gte ?? ''
                     }
                     onChange={e =>
                        dispatch({
                           type: 'SET_FILTER',
                           payload: {
                              cart: {
                                 ...state.orders.where?.cart,
                                 order: {
                                    ...(state.orders.where?.cart?.order || {}),
                                    amountPaid: {
                                       ...state.orders.where?.cart?.order
                                          ?.amountPaid,
                                       _gte: Number(e.target.value),
                                    },
                                 },
                              },
                           },
                        })
                     }
                  />
               </Form.Group>
               <Spacer size="12px" xAxis />
               <Form.Group>
                  <Form.Label htmlFor="less_than" title="less_than">
                     Less Than*
                  </Form.Label>
                  <Form.Text
                     id="less_than"
                     name="less_than"
                     placeholder="less than"
                     value={
                        state.orders.where?.cart?.order?.amountPaid?._lte ?? ''
                     }
                     onChange={e =>
                        dispatch({
                           type: 'SET_FILTER',
                           payload: {
                              cart: {
                                 ...state.orders.where?.cart,
                                 order: {
                                    ...(state.orders.where?.cart?.order || {}),
                                    amountPaid: {
                                       ...state.orders.where?.cart?.order
                                          ?.amountPaid,
                                       _lte: Number(e.target.value),
                                    },
                                 },
                              },
                           },
                        })
                     }
                  />
               </Form.Group>
            </Flex>
            <Spacer size="16px" />
            <Flex container alignItems="center" justifyContent="space-between">
               <Text as="h3">Fulfillment Type</Text>
               <IconButton
                  size="sm"
                  type="ghost"
                  onClick={() =>
                     dispatch({ type: 'CLEAR_FULFILLMENT_TYPE_FILTER' })
                  }
               >
                  <ClearIcon size={20} />
               </IconButton>
            </Flex>
            <Spacer size="8px" />
            <div className="fulfillmentType">
               <Dropdown
                  type="single"
                  options={fulfillmentTypes}
                  searchedOption={() => {}}
                  defaultValue={
                     state.orders.where?.cart?.order?.fulfillmentType?._eq
                        ? fulfillmentTypes.findIndex(
                             type =>
                                type.title ===
                                state.orders.where?.cart?.order?.fulfillmentType
                                   ?._eq
                          ) + 1
                        : null
                  }
                  placeholder="search for fulfillment types..."
                  selectedOption={option =>
                     dispatch({
                        type: 'SET_FILTER',
                        payload: {
                           cart: {
                              ...state.orders.where?.cart,
                              order: {
                                 ...(state.orders.where?.cart?.order || {}),
                                 fulfillmentType: { _eq: option.title },
                              },
                           },
                        },
                     })
                  }
               />
            </div>
         </Wrapper>
         <Banner id="order-app-filter-tunnel-bottom" />
      </>
   )
}

const Wrapper = styled(Flex)`
   .field__datetime {
      width: 100%;
      height: 40px;
      padding: 0 12px;
      font-size: 16px;
      border-radius: 4px;
      border: 1px solid #e3e3e3;
   }
   .station {
      > div > div:last-child {
         z-index: 100;
      }
   }
   .fulfillmentType {
      > div > div:last-child {
         z-index: 99;
      }
   }
`
