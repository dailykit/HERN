import React from 'react'
import { useTranslation } from 'react-i18next'
import { Flex, Spacer, IconButton, TextButton, ComboButton } from '@dailykit/ui'

import { StyledStatus, HeaderFlex } from './styled'

import { formatDate } from '../../../utils'

import { useOrder } from '../../../context'
import pickUpIcon from '../../../assets/svgs/pickup.png'
import deliveryIcon from '../../../assets/svgs/delivery.png'
import { NewTabIcon, PrintIcon } from '../../../assets/icons'
import { useTabs } from '../../../../../shared/providers'
import { get_env } from '../../../../../shared/utils'

const address = 'apps.order.components.orderlistitem.'

const isPickup = value => ['ONDEMAND_PICKUP', 'PREORDER_PICKUP'].includes(value)

export const Header = ({ order }) => {
   const { addTab } = useTabs()
   const { t } = useTranslation()
   const { dispatch } = useOrder()
   const createTab = () => {
      addTab(`ORD${order.id}`, `/order/orders/${order.id}`)
   }
   const print = () => {
      const template = encodeURIComponent(
         JSON.stringify({ name: 'bill1', type: 'bill', format: 'pdf' })
      )
      const data = encodeURIComponent(JSON.stringify({ id: order.id }))
      window.open(
         `${get_env(
            'REACT_APP_TEMPLATE_URL'
         )}?template=${template}&data=${data}`,
         '_blank'
      )
   }
   return (
      <HeaderFlex as="header" container alignItems="center">
         <Flex container>
            {!order.thirdPartyOrderId && (
               <>
                  <Flex
                     container
                     width="28px"
                     height="28px"
                     alignItems="center"
                     justifyContent="center"
                  >
                     {isPickup(order.fulfillmentType) ? (
                        <img
                           alt="Pick Up"
                           width="28px"
                           title="Pick Up"
                           src={pickUpIcon}
                        />
                     ) : (
                        <img
                           alt="Delivery"
                           width="28px"
                           title="Delivery"
                           src={deliveryIcon}
                        />
                     )}
                  </Flex>
                  <Spacer size="8px" xAxis />
               </>
            )}
            <ComboButton
               size="sm"
               type="outline"
               onClick={() => createTab(order.id)}
            >
               {/* displaying cartId instead of orderId */}
               {`ORD${order?.cart?.id} ${order?.cart?.isTest ? '(Test)' : ''}`}
               <NewTabIcon size={14} />
            </ComboButton>
            <Spacer size="8px" xAxis />
            {!order.thirdPartyOrderId && (
               <IconButton size="sm" type="outline" onClick={() => print()}>
                  <PrintIcon size={16} />
               </IconButton>
            )}
            {!order.thirdPartyOrderId && !isPickup(order.fulfillmentType) && (
               <>
                  <Spacer size="8px" xAxis />
                  <TextButton
                     size="sm"
                     type="outline"
                     fallBackMessage="Pending order confirmation!"
                     hasAccess={Boolean(order.isAccepted && !order.isRejected)}
                     onClick={() =>
                        dispatch({
                           type: 'DELIVERY_PANEL',
                           payload: { orderId: order.id },
                        })
                     }
                  >
                     {order?.deliveryCompany?.name ? 'View' : 'Select'} Delivery
                  </TextButton>
               </>
            )}
         </Flex>
         <Spacer size="24px" xAxis />
         <HeaderFlex as="section" container alignItems="center">
            <StyledStatus>
               <span>{t(address.concat('ordered on'))}:&nbsp;</span>
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
         </HeaderFlex>
      </HeaderFlex>
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
            :&nbsp;
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
            -
            {time.to
               ? formatDate(time.to, {
                    minute: 'numeric',
                    hour: 'numeric',
                 })
               : 'N/A'}
         </span>
      </StyledStatus>
   )
}
