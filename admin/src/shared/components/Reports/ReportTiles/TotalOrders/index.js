import { useSubscription } from '@apollo/react-hooks'
import {
   Flex,
   Text,
   Tunnel,
   TunnelHeader,
   Tunnels,
   useTunnel,
   Spacer,
} from '@dailykit/ui'
import moment from 'moment'
import React from 'react'
import { Tile } from '../../../DashboardTiles'
import { ORDERS_COUNT } from './graphql/subscription'

const OrdersReport = () => {
   const [orderReportTunnels, openOrderReportTunnel, closeOrderReportTunnel] =
      useTunnel(1)
   const {
      loading: subsLoading,
      error: subsError,
      data: { ordersAggregate } = {},
   } = useSubscription(ORDERS_COUNT, {
      variables: {
         where: {
            _and: [
               {
                  created_at: {
                     _gte: moment().subtract(30, 'days').format('YYYY MM DD'),
                  },
               },
               { created_at: { _lte: moment().format('YYYY MM DD') } },
            ],
            isAccepted: { _eq: true },
            cart: { paymentStatus: { _eq: 'SUCCEEDED' } },
            isRejected: { _is_null: true },
         },
      },
   })

   return (
      <>
         <Tunnels tunnels={orderReportTunnels}>
            <Tunnel size="full" layer={1}>
               <TunnelHeader
                  title="Order over time"
                  close={() => closeOrderReportTunnel(1)}
                  description="This is a description"
               />
            </Tunnel>
         </Tunnels>
         <Tile>
            <Tile.Head title="Orders"></Tile.Head>
            <Tile.Body>
               <Flex width="100%">
                  <Flex
                     container
                     flexDirection="column"
                     alignItems="flex-start"
                     padding="0px 8px"
                  >
                     <Text as="subtitle">ORDERS LAST 30 DAYS</Text>
                     <Spacer size="7px" />
                     <Text as="h3">
                        {subsLoading
                           ? '...'
                           : subsError
                           ? 'Could not get orders'
                           : ordersAggregate.aggregate.count}
                     </Text>
                  </Flex>
                  <div
                     style={{
                        borderBottom: '1px solid #e3e8ee',
                        height: '2px',
                        margin: '0px 8px',
                     }}
                  ></div>
                  <Spacer size="11px" />

                  <Flex
                     container
                     flexDirection="column"
                     width="100%"
                     alignItems="flex-start"
                  >
                     <Text as="text1" style={{ marginLeft: '8px' }}>
                        Reports
                     </Text>
                     <Spacer size="5px" />
                     <Text
                        as="text2"
                        title="View order overtime report"
                        style={{
                           marginLeft: '8px',
                           fontWeight: '400',
                           cursor: 'pointer',
                           color: '#367bf5',
                           lineHeight: '24px',
                        }}
                        onClick={() => openOrderReportTunnel(1)}
                     >
                        Order over time
                     </Text>
                  </Flex>
               </Flex>
            </Tile.Body>
         </Tile>
      </>
   )
}
export default OrdersReport
