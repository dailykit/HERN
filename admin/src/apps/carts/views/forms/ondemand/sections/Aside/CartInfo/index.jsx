import React from 'react'
import styled from 'styled-components'
import { toast } from 'react-toastify'
import format from 'date-fns/format'
import { Text, Flex, Spacer, Avatar, Filler, IconButton } from '@dailykit/ui'

import { useManual } from '../../../state'
import EmptyIllo from '../../../../../../assets/svgs/EmptyIllo'
import * as Icon from '../../../../../../../../shared/assets/icons'
import { parseAddress } from '../../../../../../../../shared/utils'

const CartInfo = () => {
   const {
      cart,
      brand,
      tunnels,
      address,
      fulfillment,
      customer,
      paymentMethod,
   } = useManual()

   const renderFulfillmentInfo = f => {
      const renderMode = () => {
         switch (f.type) {
            case 'ONDEMAND_DELIVERY':
               return 'Deliver Now'
            case 'ONDEMAND_PICKUP':
               return 'Pickup Now'
            case 'PREORDER_PICKUP':
               return 'Pickup Later'
            case 'PREORDER_DELIVERY':
               return 'Deliver Later'
            default:
               return '-'
         }
      }

      return (
         <Flex>
            <Text as="text1"> {renderMode()} </Text>
            <Spacer size="4px" />
            <Text as="text2">{format(new Date(f.slot.from), 'PPp')} - {format(new Date(f.slot.to), 'PPp')}</Text>
            <Spacer size="4px" />
            {f.type.includes('DELIVERY') && (
               <>
                  {address.id ? (
                     <Text as="text2">{parseAddress(address)}</Text>
                  ) : (
                     <small>
                        We could not resolve your address. Please select your
                        address again!
                     </small>
                  )}
               </>
            )}
         </Flex>
      )
   }

   return (
      <section>
         <Styles.Card>
            <Header title="Store" />
            <Flex as="main" padding="0 8px 8px 8px">
               {brand?.id ? (
                  <>
                     <Flex container alignItems="center">
                        {brand?.title && (
                           <>
                              <Avatar title={brand.title} />
                              <Spacer size="22px" xAxis />
                           </>
                        )}
                        <Flex>
                           <Text as="p">{brand?.title}</Text>
                           <Text as="p">{brand?.domain}</Text>
                        </Flex>
                     </Flex>
                  </>
               ) : (
                  <Styles.Filler
                     height="100px"
                     message="Please select a brand"
                     illustration={<EmptyIllo width="120px" />}
                  />
               )}
            </Flex>
         </Styles.Card>
         <Spacer size="8px" />
         <Styles.Card>
            <Header title="Customer" />
            <Flex as="main" padding="0 8px 8px 8px">
               {customer?.id && customer?.email ? (
                  <>
                     <Flex container alignItems="center">
                        {customer?.fullName && (
                           <>
                              <Avatar title={customer?.fullName || ''} />
                              <Spacer size="22px" xAxis />
                           </>
                        )}
                        <Flex>
                           <Text as="p">{customer?.fullName}</Text>
                           <Text as="p">{customer?.email}</Text>
                           <Text as="p">{customer?.phoneNumber}</Text>
                        </Flex>
                     </Flex>
                  </>
               ) : (
                  <Styles.Filler
                     height="100px"
                     message="Please select a customer"
                     illustration={<EmptyIllo width="120px" />}
                  />
               )}
            </Flex>
         </Styles.Card>
         <Spacer size="8px" />
         <Styles.Card>
            <Header
               title="Fulfillment"
               canEdit={cart?.paymentStatus === 'PENDING'}
               onEdit={() => {
                  if (!customer?.id) {
                     return toast.warning('Please select a customer first.')
                  }
                  tunnels.fulfillment[1](1)
               }}
            />
            <Flex as="main" padding="0 8px 8px 8px">
               {fulfillment?.type ? (
                  renderFulfillmentInfo(fulfillment)
               ) : (
                  <Styles.Filler
                     height="100px"
                     message="Please add fulfillment details"
                     illustration={<EmptyIllo width="120px" />}
                  />
               )}
            </Flex>
         </Styles.Card>
         <Spacer size="8px" />
         {paymentMethod?.id && paymentMethod?.last4 && (
            <>
               <Styles.Card>
                  <Header title="Payment Details" />
                  <Flex as="main" padding="0 8px 8px 8px">
                     <div>
                        <Text as="p">Name: {paymentMethod?.name}</Text>
                        <Text as="p">
                           Expiry: {paymentMethod?.expMonth}/
                           {paymentMethod?.expYear}
                        </Text>
                        <Text as="p">Last 4: {paymentMethod?.last4}</Text>
                     </div>
                  </Flex>
               </Styles.Card>
               <Spacer size="8px" />
            </>
         )}
      </section>
   )
}

export default CartInfo

const Header = ({ title = '', canEdit, onEdit = null }) => {
   return (
      <Flex
         container
         as="header"
         height="36px"
         padding="0 8px"
         alignItems="center"
         justifyContent="space-between"
      >
         <Text as="text2">{title}</Text>
         {canEdit && onEdit && (
            <IconButton type="ghost" size="sm" onClick={onEdit}>
               <Icon.EditIcon size="12px" />
            </IconButton>
         )}
      </Flex>
   )
}

const Styles = {
   Card: styled.div`
      border-radius: 2px;
      background: #ffffff;
      box-shadow: 0 2px 40px 2px rgb(222 218 218);
      > header {
         button {
            width: 28px;
            height: 28px;
         }
      }
   `,
   Filler: styled(Filler)`
      p {
         font-size: 14px;
         text-align: center;
      }
   `,
}
