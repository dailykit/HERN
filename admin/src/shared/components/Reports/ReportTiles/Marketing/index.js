import {
   Flex,
   Spacer,
   Text,
   Tunnel,
   TunnelHeader,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import React from 'react'
import { Tile } from '../../../DashboardTiles'
import { useSubscription } from '@apollo/react-hooks'
import moment from 'moment'
import { MARKETING_EARNING } from './graphql/subscription'
import { get_env } from '../../../../utils'
import BrandShopDate from '../../../BrandShopDateProvider'
import styled from 'styled-components'
import SalesByCoupons from './Tunnels/salesByCoupons'
//currencies
const currency = {
   USD: '$',
   INR: '₹',
   EUR: '€',
}
const MarketingReport = () => {
   const [marketingTunnels, openMarketingTunnel, closeMarketingTunnel] =
      useTunnel(1)
   const {
      loading: subsLoading,
      error: subsError,
      data: { ordersAggregate = {} } = {},
   } = useSubscription(MARKETING_EARNING, {
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
            rewardHistories: { id: { _is_null: false } },
         },
      },
   })

   return (
      <>
         <Tunnels tunnels={marketingTunnels}>
            <Tunnel size="full" layer={1}>
               <TunnelHeader
                  title="Sales from coupons"
                  close={() => closeMarketingTunnel(1)}
                  description="This is a description"
               />
               <TunnelBody>
                  <BrandShopDate
                     brandProvider
                     shopTypeProvider
                     datePickerProvider
                     compareProvider
                  >
                     <SalesByCoupons />
                  </BrandShopDate>
               </TunnelBody>
            </Tunnel>
         </Tunnels>
         <Tile>
            <Tile.Head title="Marketing"></Tile.Head>
            <Tile.Body>
               <Flex width="100%">
                  <Flex
                     container
                     flexDirection="column"
                     alignItems="flex-start"
                     padding="0px 8px"
                  >
                     <Text as="subtitle">
                        EARNING ATTRIBUTED TO MARKETING LAST 30 DAYS
                     </Text>
                     <Spacer size="7px" />
                     <Text as="h3">
                        {currency[get_env('REACT_APP_CURRENCY')]}
                        {subsLoading
                           ? '...'
                           : subsError
                           ? 'Could not get Earning'
                           : ordersAggregate.aggregate.sum.amountPaid || 0}
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
                     <Text as="text1" style={{ marginLeft: '8px' }}>
                        Reports
                     </Text>
                     <Spacer size="5px" />
                     <Text
                        as="text2"
                        title="View sales from coupons"
                        style={{
                           marginLeft: '8px',
                           fontWeight: '400',
                           cursor: 'pointer',
                           color: '#367bf5',
                           lineHeight: '24px',
                        }}
                        onClick={() => openMarketingTunnel(1)}
                     >
                        Sales from coupons
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
export default MarketingReport
