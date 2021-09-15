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
import styled from 'styled-components'
import { OrderIcon } from '../../../../assets/icons'
import BrandShopDate from '../../../BrandShopDateProvider'
import { Tile } from '../../../DashboardTiles'
import { ORDERS_COUNT } from './graphql/subscription'
import OrderByLocation from './tunnels/orderByLocation'
import OrderCancelOrRejectReport from './tunnels/orderReject'
import OrderSummaryReport from './tunnels/orderSummary'

const OrdersReport = () => {
   const [orderReportTunnels, openOrderReportTunnel, closeOrderReportTunnel] =
      useTunnel(3)
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
                  title="Order Summary Report"
                  close={() => closeOrderReportTunnel(1)}
                  description="This is a description"
               />
               <TunnelBody>
                  <OrderSummaryReport />
               </TunnelBody>
            </Tunnel>
            <Tunnel size="full" layer={2}>
               <TunnelHeader
                  title="Rejected orders over time"
                  close={() => closeOrderReportTunnel(2)}
                  description="This is a description"
               />
               <TunnelBody>
                  <BrandShopDate
                     shopTypeProvider
                     brandProvider
                     datePickerProvider
                     compareProvider
                     groupTimeProvider
                  >
                     <OrderCancelOrRejectReport />
                  </BrandShopDate>
               </TunnelBody>
            </Tunnel>
            <Tunnel size="full" layer={3}>
               <TunnelHeader
                  title="Order By Location"
                  close={() => closeOrderReportTunnel(3)}
                  description="This is a description"
               />
               <TunnelBody>
                  <BrandShopDate
                     shopTypeProvider
                     brandProvider
                     datePickerProvider
                     compareProvider
                  >
                     <OrderByLocation />
                  </BrandShopDate>
               </TunnelBody>
            </Tunnel>
         </Tunnels>
         <Tile>
            <Tile.Head title="Orders" svg={OrderIcon}></Tile.Head>
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
                     padding="0px 0px 10px 0px"
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
                        Order summary
                     </Text>
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
                        onClick={() => openOrderReportTunnel(2)}
                     >
                        Rejected orders over time
                     </Text>
                     <Text
                        as="text2"
                        title="View order by location"
                        style={{
                           marginLeft: '8px',
                           fontWeight: '400',
                           cursor: 'pointer',
                           color: '#367bf5',
                           lineHeight: '24px',
                        }}
                        onClick={() => openOrderReportTunnel(3)}
                     >
                        Order by location
                     </Text>
                  </Flex>
               </Flex>
            </Tile.Body>
         </Tile>
      </>
   )
}
const TunnelBody = styled.div`
   padding: 10px 16px 0px 32px;
   height: calc(100% - 103px);
   overflow: auto;
`
export default OrdersReport
