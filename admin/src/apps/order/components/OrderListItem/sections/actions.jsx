import React from 'react'
import { toast } from 'react-toastify'
import usePortal from 'react-useportal'
import { useMutation } from '@apollo/react-hooks'
import {
   Flex,
   TextButton,
   ComboButton,
   Popup,
   ButtonGroup,
   Spacer,
} from '@dailykit/ui'
import { useTranslation } from 'react-i18next'
import { MUTATIONS } from '../../../graphql'

import { useOrder } from '../../../context'

// import { CardIcon } from '../../../assets/icons'

import { useTabs } from '../../../../../shared/providers'
import { Tick, Cross } from '../../../assets/icons'
import { logger } from '../../../../../shared/utils'
import { formatDate } from '../../../utils'
import { ResponsiveFlex, StyledText, StyledStatus } from './styled'

const address = 'apps.order.components.orderlistitem.'

const isPickup = value => ['ONDEMAND_PICKUP', 'PREORDER_PICKUP'].includes(value)

export const Actions = ({ order }) => {
   const { addTab } = useTabs()
   const { dispatch } = useOrder()
   const createTab = () => {
      addTab(`ORD${order.id}`, `/order/orders/${order.id}`)
   }
   const { t } = useTranslation()
   const { openPortal, closePortal, isOpen, Portal } = usePortal({
      bindTo: document && document.getElementById('popups'),
   })
   const [updateOrder] = useMutation(MUTATIONS.ORDER.UPDATE, {
      onCompleted: () => {
         toast.success('Successfully updated the order!')
      },
      onError: error => {
         logger(error)
         toast.error('Failed to update the order')
      },
   })
   return (
      <Flex as="aside">
         <Flex>
            <Flex as="section" container alignItems="center">
               <StyledStatus>
                  <span>{t(address.concat('ordered on'))} &nbsp;</span>
                  <span>{formatDate(order?.created_at)}</span>
               </StyledStatus>
               {!order.thirdPartyOrderId && (
                  <>
                     <Spacer size="16px" xAxis />
                     <TimeSlot
                        type={order.fulfillmentType}
                        time={order.cart.fulfillmentInfo?.slot}
                     />
                  </>
               )}
            </Flex>
         </Flex>
         <Spacer size="50px" />
         {/* <StyledText as="h3">Actions</StyledText> */}
         <TextButton
            size="md"
            type="solid"
            style={{ width: '196px' }}
            onClick={() => createTab(order.id)}
         >
            <span>Go to Order</span>
         </TextButton>
         <Spacer size="16px" />
         {!order.paymentId && (
            <TextButton
               type="outline"
               size="md"
               style={{ width: '196px' }}
               onClick={() =>
                  dispatch({ type: 'SET_CART_ID', payload: order.cart.id })
               }
            >
               {order.cart.paymentStatus}
            </TextButton>
         )}
         <Spacer size="16px" />
         <ResponsiveFlex container>
            <TextButton
               type="solid"
               variant="secondary"
               disabled={order.isAccepted}
               size="sm"
               onClick={() =>
                  updateOrder({
                     variables: {
                        id: order.id,
                        _set: {
                           isAccepted: true,
                           ...(order.isRejected && { isRejected: false }),
                        },
                     },
                  })
               }
               style={{
                  display: 'flex',
                  alignItems: 'center',
                  columnGap: '2px',
               }}
            >
               <Tick />

               <Spacer size="6px" />
               {order.isAccepted ? 'Accepted' : 'Accept'}
            </TextButton>

            <Spacer size="8px" xAxis />

            <TextButton
               type="solid"
               variant="secondary"
               onClick={openPortal}
               size="sm"
               style={{
                  display: 'flex',
                  alignItems: 'center',
                  columnGap: '2px',
               }}
            >
               <Cross />

               {order.isRejected ? 'UnReject' : 'Reject'}
            </TextButton>
         </ResponsiveFlex>
         <Portal>
            <Popup show={isOpen}>
               <Popup.Text type="danger">
                  {order.thirdPartyOrderId
                     ? `${
                          order.isRejected ? 'Unrejecting' : 'Rejecting'
                       } a third party order would not ${
                          order.isRejected ? 'unreject' : 'reject'
                       } the order from said third party app. Are you sure you want to ${
                          order.isRejected ? 'unreject' : 'reject'
                       } this order?`
                     : `Are you sure you want to ${
                          order.isRejected ? 'unreject' : 'reject'
                       } this order?`}
               </Popup.Text>
               <Popup.Actions>
                  <ButtonGroup align="left">
                     <TextButton
                        type="solid"
                        onClick={e => {
                           closePortal(e)
                           updateOrder({
                              variables: {
                                 id: order.id,
                                 _set: {
                                    isRejected: !order.isRejected,
                                 },
                              },
                           })
                        }}
                     >
                        {order.isRejected ? 'Un Reject' : 'Reject'}
                     </TextButton>
                     <TextButton type="ghost" onClick={closePortal}>
                        Close
                     </TextButton>
                  </ButtonGroup>
               </Popup.Actions>
            </Popup>
         </Portal>
      </Flex>
   )
}

const TimeSlot = ({ type, time = {} }) => {
   const { t } = useTranslation()
   return (
      <StyledStatus>
         <span>
            {isPickup(type)
               ? t(address.concat('pickup'))
               : t(address.concat('Delivery'))}
            &nbsp;
         </span>
         <span>
            {time?.from
               ? formatDate(time.from, {
                    month: 'short',
                    day: 'numeric',
                 })
               : 'N/A'}
            |&nbsp;
            {time.from
               ? formatDate(time.from, {
                    minute: 'numeric',
                    hour: 'numeric',
                 })
               : 'N/A'}
            {/* -
            {time.to
               ? formatDate(time.to, {
                    minute: 'numeric',
                    hour: 'numeric',
                 })
               : 'N/A'} */}
         </span>
      </StyledStatus>
   )
}
