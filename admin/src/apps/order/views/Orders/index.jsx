import React from 'react'
import { toast } from 'react-toastify'
import { Filler, Flex } from '@dailykit/ui'
import styled from 'styled-components'
import { useLocation } from 'react-router-dom'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'

import { paginate } from '../../utils'
import { QUERIES, MUTATIONS } from '../../graphql'
import { useOrder } from '../../context'
import { OrderListItem } from '../../components'
import { logger } from '../../../../shared/utils'
import { useTabs } from '../../../../shared/providers'
import { ErrorState, InlineLoader, Banner } from '../../../../shared/components'

const itemsFromBackend = [
   { id: 12, content: 'First task' },
   { id: 121, content: 'Second task' },
   { id: 123, content: 'Third task' },
   { id: 1232, content: 'Fourth task' },
   { id: 111, content: 'Fifth task' },
]

const Orders = () => {
   const location = useLocation()
   const { tab, addTab } = useTabs()
   const { state, dispatch } = useOrder()
   const [active, setActive] = React.useState(1)
   const [orders, setOrders] = React.useState([])
   const [columns, setColumns] = React.useState({
      pending: {
         name: 'Pending',
         status: 'ORDER_PENDING',
         items: [],
      },
      underProcessing: {
         name: 'Under Processing',
         status: 'ORDER_UNDER_PROCESSING',
         items: [],
      },
      readyToDispatch: {
         name: 'Ready to Dispatch',
         status: 'ORDER_READY_TO_DISPATCH',
         items: [],
      },
      outForDelivery: {
         name: 'Out For delivery',
         status: 'ORDER_OUT_FOR_DELIVERY',
         items: [],
      },
   })
   const {
      loading: loadingAggregate,
      data: { orders: ordersAggregate = {} } = {},
   } = useSubscription(QUERIES.ORDERS.AGGREGATE.TOTAL, {
      skip: !state.orders.where?.cart?.status?._eq,
      variables: {
         where: {
            isArchived: { _eq: false },
            cart: { status: { _eq: state.orders.where?.cart?.status?._eq } },
         },
      },
   })
   const { loading, error } = useSubscription(QUERIES.ORDERS.LIST, {
      variables: {
         where: state.orders.where,
         // ...(state.orders.limit && { limit: state.orders.limit }),
         // ...(state.orders.offset !== null && { offset: state.orders.offset }),
      },
      onSubscriptionData: ({
         subscriptionData: { data: { orders: list = [] } = {} } = {},
      }) => {
         setOrders(list)
         console.log({
            all: list,
            pending: list.filter(item => item.cart.status === 'ORDER_PENDING'),
            underProcessing: list.filter(
               item => item.cart.status === 'ORDER_UNDER_PROCESSING'
            ),
            readyToDispatch: list.filter(
               item => item.cart.status === 'ORDER_READY_TO_DISPATCH'
            ),
            outForDelivery: list.filter(
               item => item.cart.status === 'ORDER_OUT_FOR_DELIVERY'
            ),
            delivered: list.filter(
               item => item.cart.status === 'ORDER_DELIVERED'
            ),
         })
         setColumns(prev => ({
            pending: {
               ...prev.pending,
               items: list.filter(item => item.cart.status === 'ORDER_PENDING'),
            },
            underProcessing: {
               ...prev.underProcessing,
               items: list.filter(
                  item => item.cart.status === 'ORDER_UNDER_PROCESSING'
               ),
            },
            readyToDispatch: {
               ...prev.readyToDispatch,
               items: list.filter(
                  item => item.cart.status === 'ORDER_READY_TO_DISPATCH'
               ),
            },
            outForDelivery: {
               ...prev.outForDelivery,
               items: list.filter(
                  item => item.cart.status === 'ORDER_OUT_FOR_DELIVERY'
               ),
            },
         }))
         if (state.orders.limit) {
            if (!loadingAggregate && ordersAggregate?.aggregate?.count > 10) {
               dispatch({
                  type: 'SET_PAGINATION',
                  payload: { limit: null, offset: null },
               })
            }
            dispatch({ type: 'SET_ORDERS_STATUS', payload: false })
         }
      },
   })

   const [updateCart] = useMutation(MUTATIONS.CART.UPDATE.ONE, {
      onCompleted: () => {
         toast.success('Successfully updated the order!')
      },
      onError: error => {
         logger(error)
         toast.error('Failed to update the order')
      },
   })

   const onDragEnd = (result, columns, setColumns) => {
      if (!result.destination) return
      const { source, destination } = result
      if (source.droppableId !== destination.droppableId) {
         const sourceColumn = columns[source.droppableId]
         const destColumn = columns[destination.droppableId]
         const sourceItems = [...sourceColumn.items]
         const destItems = [...destColumn.items]
         const [draggedItem] = sourceItems.splice(source.index, 1)
         destItems.splice(destination.index, 0, draggedItem)

         // updating the status of the order
         if (
            Boolean(
               draggedItem.isAccepted !== true &&
                  draggedItem.isRejected !== true
            )
         ) {
            toast.error('Pending order confirmation!')
            return
         }
         if (draggedItem.cart?.status === 'ORDER_DELIVERED') return
         setColumns({
            ...columns,
            [source.droppableId]: {
               ...sourceColumn,
               items: sourceItems,
            },
            [destination.droppableId]: {
               ...destColumn,
               items: destItems,
            },
         })
         updateCart({
            variables: {
               pk_columns: { id: draggedItem.cart.id },
               _set: { status: destColumn.status },
            },
         }).then((resolve, reject) => {
            if (reject) {
               const [draggedItemToBeReverted] = destItems.splice(
                  destination.index,
                  1
               )
               sourceItems.splice(source.index, 0, draggedItemToBeReverted)
               setColumns({
                  ...columns,
                  [source.droppableId]: {
                     ...sourceColumn,
                     items: sourceItems,
                  },
                  [destination.droppableId]: {
                     ...destColumn,
                     items: destItems,
                  },
               })
            }
         })
      } else {
         const column = columns[source.droppableId]
         const copiedItems = [...column.items]
         const [draggedItem] = copiedItems.splice(source.index, 1)
         copiedItems.splice(destination.index, 0, draggedItem)
         setColumns({
            ...columns,
            [source.droppableId]: {
               ...column,
               items: copiedItems,
            },
         })
      }
   }

   React.useEffect(() => {
      if (!tab) {
         addTab('Orders', '/order/orders')
      }
   }, [tab, addTab])

   React.useEffect(() => {
      if (state.orders.limit === null && state.orders.offset === null) {
         dispatch({ type: 'SET_ORDERS_STATUS', payload: true })
         dispatch({
            type: 'SET_PAGINATION',
            payload: { limit: 10, offset: 0 },
         })
      }
   }, [location.pathname])

   React.useEffect(() => {
      window.addEventListener('hashchange', () => {
         setActive(Number(window.location.hash.slice(1)))
      })
      return () =>
         window.removeEventListener('hashchange', () => {
            setActive(Number(window.location.hash.slice(1)))
         })
   }, [])

   React.useEffect(() => {
      setActive(1)
   }, [state.orders.where.cart?.status])

   if (loading) {
      return <InlineLoader />
   }
   if (!loading && error) {
      logger(error)
      toast.error('Failed to fetch order list!')
      dispatch({ type: 'SET_ORDERS_STATUS', payload: false })
      return <ErrorState message="Failed to fetch order list!" />
   }
   return (
      <div>
         <Banner id="orders-app-orders-top" />
         <div
            style={{
               display: 'flex',
               justifyContent: 'center',
               height: '100%',
            }}
         >
            <DragDropContext
               onDragEnd={result => onDragEnd(result, columns, setColumns)}
            >
               {Object.entries(columns).map(([columnId, column], index) => {
                  return (
                     <div
                        style={{
                           display: 'flex',
                           flexDirection: 'column',
                           alignItems: 'center',
                        }}
                        key={columnId}
                     >
                        <h2>{column.name}</h2>
                        <div style={{ margin: 8 }}>
                           <Droppable droppableId={columnId} key={columnId}>
                              {(provided, snapshot) => {
                                 return (
                                    <div
                                       {...provided.droppableProps}
                                       ref={provided.innerRef}
                                       style={{
                                          background: snapshot.isDraggingOver
                                             ? 'lightblue'
                                             : 'lightgrey',
                                          padding: 4,
                                          width: 320,
                                          minHeight: 580,
                                          maxHeight: 580,
                                          overflowY: 'auto',
                                       }}
                                    >
                                       {column.items.length > 0 &&
                                          column.items.map((item, index) => {
                                             return (
                                                <Draggable
                                                   key={item.id}
                                                   draggableId={item.id.toString()}
                                                   index={index}
                                                >
                                                   {(provided, snapshot) => {
                                                      return (
                                                         <div
                                                            ref={
                                                               provided.innerRef
                                                            }
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{
                                                               userSelect:
                                                                  'none',
                                                               padding: '8px',
                                                               margin:
                                                                  '0 0 8px 0',
                                                               width: '100%',
                                                               // backgroundColor:
                                                               //    snapshot.isDragging
                                                               //       ? '#263B4A'
                                                               //       : '#456C86',
                                                               // color: 'white',
                                                               ...provided
                                                                  .draggableProps
                                                                  .style,
                                                            }}
                                                         >
                                                            {/* {item.content} */}
                                                            <OrderListItem
                                                               order={item}
                                                               key={item.id}
                                                               containerId={`${
                                                                  index % 10 ===
                                                                  0
                                                                     ? `${
                                                                          index /
                                                                             10 +
                                                                          1
                                                                       }`
                                                                     : ''
                                                               }`}
                                                            />
                                                         </div>
                                                      )
                                                   }}
                                                </Draggable>
                                             )
                                          })}
                                       {provided.placeholder}
                                    </div>
                                 )
                              }}
                           </Droppable>
                        </div>
                     </div>
                  )
               })}
            </DragDropContext>
         </div>
         {/* <Flex
            container
            height="48px"
            alignItems="center"
            padding="0 16px"
            justifyContent="space-between"
         >
            <h1>Orders</h1>
            <Pagination>
               {!loadingAggregate &&
                  ordersAggregate?.aggregate?.count > 10 &&
                  paginate(
                     active,
                     Math.ceil(ordersAggregate?.aggregate?.count / 10)
                  ).map((node, index) => (
                     <PaginationItem
                        key={index}
                        className={active === node ? 'active' : ''}
                     >
                        {typeof node === 'string' ? (
                           <span>{node}</span>
                        ) : (
                           <a href={`#${node}`}>{node}</a>
                        )}
                     </PaginationItem>
                  ))}
            </Pagination>
         </Flex> */}
         {/* <Flex
            as="section"
            overflowY="auto"
            height="calc(100vh - 128px)"
            style={{ scrollBehavior: 'smooth' }}
         >
            {orders.length > 0 ? (
               orders.map((order, index) => (
                  <OrderListItem
                     order={order}
                     key={order.id}
                     containerId={`${
                        index % 10 === 0 ? `${index / 10 + 1}` : ''
                     }`}
                  />
               ))
            ) : (
               <Filler message="No orders available!" />
            )}
         </Flex> */}
         <Banner id="orders-app-orders-bottom" />
      </div>
   )
}

export default Orders

const Pagination = styled.ul`
   display: flex;
   align-items: center;
   > :not(template) ~ :not(template) {
      --space-x-reverse: 0;
      margin-right: calc(12px * var(--space-x-reverse));
      margin-left: calc(12px * (1 - var(--space-x-reverse)));
   }
`

const PaginationItem = styled.li`
   list-style: none;
   border-radius: 2px;
   &.active {
      background: #65b565;
      a,
      span {
         color: #fff;
         border: none;
      }
   }
   a,
   span {
      width: 28px;
      height: 28px;
      color: #1a1d4b;
      align-items: center;
      display: inline-flex;
      justify-content: center;
   }
   a {
      border-radius: 2px;
      text-decoration: none;
      border: 1px solid #ffd5d5;
   }
`
