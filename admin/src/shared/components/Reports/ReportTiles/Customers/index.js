import React from 'react'
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
import styled from 'styled-components'
import { Tile } from '../../../DashboardTiles'
import { CUSTOMERS_COUNT } from './graphql/subscription'
import BrandShopDate from '../../../BrandShopDateProvider'
import CustomerOverTime from './Tunnels/customerOverTime'
import FirstTimeVsReturningCustomerSales from './Tunnels/firstTimeVsReturningCustomerSales'
import { CustomerIcon } from '../../../../assets/icons'

const CustomerReport = () => {
   const [
      customerReportTunnels,
      openCustomerReportTunnel,
      closeCustomerReportTunnel,
   ] = useTunnel(2)
   const {
      loading: subsLoading,
      error: subsError,
      data: { customers_aggregate } = {},
   } = useSubscription(CUSTOMERS_COUNT, {
      variables: {
         where: {
            _and: [
               {
                  created_at: {
                     _gte: moment().subtract(30, 'days').format('YYYY MM DD'),
                  },
               },
               {
                  created_at: {
                     _lte: moment().add(1, 'day').format('YYYY MM DD'),
                  },
               },
            ],
         },
      },
   })
   return (
      <>
         <Tunnels tunnels={customerReportTunnels}>
            <Tunnel size="full" layer={1}>
               <TunnelHeader
                  title="Customer over time"
                  close={() => closeCustomerReportTunnel(1)}
                  description="This is a description"
               />
               <TunnelBody>
                  <BrandShopDate
                     brandProvider
                     shopTypeProvider
                     datePickerProvider
                     compareProvider
                     groupTimeProvider
                  >
                     <CustomerOverTime />
                  </BrandShopDate>
               </TunnelBody>
            </Tunnel>
            <Tunnel size="full" layer={2}>
               <TunnelHeader
                  title="First-time vs returning customer sales"
                  close={() => closeCustomerReportTunnel(2)}
                  description="This is a description"
               />
               <TunnelBody>
                  <BrandShopDate
                     brandProvider
                     shopTypeProvider
                     datePickerProvider
                     groupTimeProvider
                     locationProvider
                  >
                     <FirstTimeVsReturningCustomerSales />
                  </BrandShopDate>
               </TunnelBody>
            </Tunnel>
         </Tunnels>
         <Tile>
            <Tile.Head title="Customers" svg={CustomerIcon}></Tile.Head>
            <Tile.Body>
               <Flex width="100%">
                  <Flex
                     container
                     flexDirection="column"
                     alignItems="flex-start"
                     padding="0px 8px"
                  >
                     <Text as="subtitle">CUSTOMERS LAST 30 DAYS</Text>
                     <Spacer size="7px" />
                     <Text as="h3">
                        {subsLoading
                           ? '...'
                           : subsError
                           ? 'Could not get customers'
                           : customers_aggregate.aggregate.count}
                     </Text>
                  </Flex>
                  <div
                     style={{
                        borderBottom: '1px solid #e3e8ee',
                        height: '2px',
                        margin: '0px 8px',
                     }}
                  >
                     <Spacer size="11px" />
                  </div>
                  <Spacer size="11px" />

                  <Flex
                     container
                     flexDirection="column"
                     width="100%"
                     alignItems="flex-start"
                     padding="0px 0px 10px 0px"
                  >
                     <Text
                        as="text1"
                        style={{
                           marginLeft: '8px',
                           color: '#555B6E',
                           fontWeight: '400',
                        }}
                     >
                        Reports
                     </Text>
                     <Spacer size="5px" />
                     <Text
                        as="text2"
                        title="View customer overtime report"
                        style={{
                           marginLeft: '8px',
                           fontWeight: '400',
                           cursor: 'pointer',
                           color: '#367bf5',
                           lineHeight: '24px',
                        }}
                        onClick={() => openCustomerReportTunnel(1)}
                     >
                        Customer over time
                     </Text>
                     <Text
                        as="text2"
                        title="First-time vs returning customer sales"
                        style={{
                           marginLeft: '8px',
                           fontWeight: '400',
                           cursor: 'pointer',
                           color: '#367bf5',
                           lineHeight: '24px',
                        }}
                        onClick={() => openCustomerReportTunnel(2)}
                     >
                        First-time vs returning customer sales
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
export default CustomerReport
