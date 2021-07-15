import React from 'react'
import { toast } from 'react-toastify'
import { useSubscription, useMutation } from '@apollo/react-hooks'

import { Styles } from './styled'
import { RightIcon } from '../../assets/icons'
import { logger } from '../../../../shared/utils'
import { QUERIES, MUTATIONS } from '../../graphql'
import { Details, Products, Actions, Header } from './sections'
import { IconButton } from '@dailykit/ui'
import { DeleteIcon } from '../../../../shared/assets/icons'

const OrderListItem = ({ containerId, order = {} }) => {
   const [updateCart] = useMutation(MUTATIONS.CART.UPDATE.ONE, {
      onCompleted: () => {
         toast.success('Successfully updated the order!')
      },
      onError: error => {
         logger(error)
         toast.error('Failed to update the order')
      },
   })
   const [updateOrder] = useMutation(MUTATIONS.ORDER.UPDATE, {
      onCompleted: () => {
         toast.success('Successfully deleted the order!')
      },
      onError: error => {
         logger(error)
         toast.error('Failed to delete the order')
      },
   })

   const {
      data: { order_orderStatusEnum: statuses = [] } = {},
   } = useSubscription(QUERIES.ORDER.STATUSES)

   const updateStatus = () => {
      if (Boolean(order.isAccepted !== true && order.isRejected !== true)) {
         toast.error('Pending order confirmation!')
         return
      }
      if (order.cart?.status === 'ORDER_DELIVERED') return
      const status_list = statuses.map(status => status.value)
      const next = status_list.indexOf(order.cart?.status)
      if (next + 1 < status_list.length) {
         updateCart({
            variables: {
               pk_columns: { id: order.cart.id },
               _set: { status: status_list[next + 1] },
            },
         })
      }
   }

   const deleteOrder = () => {
      const isConfirmed = window.confirm(
         'Are you sure you want to delete this order?'
      )
      if (isConfirmed) {
         updateOrder({
            variables: {
               id: order.id,
               _set: { isArchived: true },
            },
         })
      }
   }

   return (
      <Styles.Order status={order.cart?.status} id={containerId}>
         <Details order={order} />
         <Header order={order} />
         <Products order={order} />
         <Actions order={order} />
         <Styles.Status status={order.cart?.status} onClick={updateStatus}>
            {order.cart?.orderStatus?.title}
            <span>
               <RightIcon size={20} color="#fff" />
            </span>
         </Styles.Status>
         <Styles.DeleteBtn tabIndex={0} role="button" onClick={deleteOrder}>
            <IconButton type="ghost" size="sm">
               <DeleteIcon color="#FF5A52" />
            </IconButton>
         </Styles.DeleteBtn>
      </Styles.Order>
   )
}

export default OrderListItem
