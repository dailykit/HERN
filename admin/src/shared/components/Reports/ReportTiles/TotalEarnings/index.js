import { useSubscription } from '@apollo/react-hooks'
import {
   ButtonGroup,
   Flex,
   Spacer,
   Text,
   Tunnel,
   TunnelHeader,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { EarningIcon } from '../../../../assets/icons'
import { get_env, logger } from '../../../../utils'
import BrandShopDate from '../../../BrandShopDateProvider'
import { Tile } from '../../../DashboardTiles'
import { ErrorState } from '../../../ErrorState'
import { InlineLoader } from '../../../InlineLoader'
import { TOTAL_EARNING } from './graphql/subscription'
import EarningByCustomer from './Tunnels/earningByCustomer'
import EarningByProduct from './Tunnels/earningByProduct'
import EarningOverTime from './Tunnels/earningOverTime'
//currencies
const currency = {
   USD: '$',
   INR: '₹',
   EUR: '€',
}
const TotalEarningReport = () => {
   const [reportTunnels, openReportTunnel, closeReportTunnel] = useTunnel(6)
   const [showMore, setShowMore] = useState(false)
   const {
      loading: subsLoading,
      error: subsError,
      data: { ordersAggregate = {} } = {},
   } = useSubscription(TOTAL_EARNING, {
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
   console.log('ordersAggregate', ordersAggregate)
   if (!subsError && subsLoading) {
      return <InlineLoader />
   }
   if (subsError) {
      logger(subsError)
      toast.error('Could not total Earning in last 30 days')
      return (
         <ErrorState
            height="320px"
            message="Could not total Earning in last 30 days"
         />
      )
   }
   return (
      <>
         <Tunnels tunnels={reportTunnels}>
            <Tunnel size="full" layer={1}>
               <TunnelHeader
                  title="Earning over time"
                  close={() => closeReportTunnel(1)}
                  description="This is a description"
               />

               <EarningOverTime />
            </Tunnel>
            <Tunnel size="full" layer={2}>
               <TunnelHeader
                  title="Earning by product"
                  close={() => closeReportTunnel(2)}
                  description="This is a description"
               />
               <TunnelBody>
                  <BrandShopDate
                     brandProvider
                     shopTypeProvider
                     datePickerProvider
                     compareProvider
                  >
                     <EarningByProduct />
                  </BrandShopDate>
               </TunnelBody>
            </Tunnel>
            <Tunnel size="full" layer={3}>
               <TunnelHeader
                  title="Earning by customer"
                  close={() => closeReportTunnel(3)}
                  description="This is a description"
               />
               <TunnelBody>
                  <BrandShopDate
                     brandProvider
                     shopTypeProvider
                     datePickerProvider
                     compareProvider
                  >
                     <EarningByCustomer />
                  </BrandShopDate>
               </TunnelBody>
            </Tunnel>
            <Tunnel size="full" layer={4}>
               <TunnelHeader
                  title="Earning by discount"
                  close={() => closeReportTunnel(4)}
                  description="This is a description"
               />
            </Tunnel>
            <Tunnel size="full" layer={5}>
               <TunnelHeader
                  title="Earning by location"
                  close={() => closeReportTunnel(5)}
                  description="This is a description"
               />
            </Tunnel>
            <Tunnel size="full" layer={6}>
               <TunnelHeader
                  title="Earning by vendor"
                  close={() => closeReportTunnel(6)}
                  description="This is a description"
               />
            </Tunnel>
         </Tunnels>
         <Tile>
            <Tile.Head title="Earnings" svg={EarningIcon}></Tile.Head>
            <Tile.Body>
               <Flex width="100%">
                  <Flex
                     container
                     flexDirection="column"
                     alignItems="flex-start"
                     padding="0px 8px"
                  >
                     <Text as="subtitle">TOTAL EARNING LAST 30 DAYS</Text>
                     <Spacer size="7px" />

                     <Text as="h3">
                        {currency[get_env('REACT_APP_CURRENCY')]}
                        {ordersAggregate.aggregate.sum.amountPaid}
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
                        title="View earning overtime report"
                        style={{
                           marginLeft: '8px',
                           fontWeight: '400',
                           cursor: 'pointer',
                           color: '#367bf5',
                           lineHeight: '24px',
                        }}
                        onClick={() => openReportTunnel(1)}
                     >
                        Earnings over time
                     </Text>
                     <Text
                        as="text2"
                        style={{
                           marginLeft: '8px',
                           fontWeight: '400',
                           cursor: 'pointer',
                           color: '#367bf5',
                           lineHeight: '24px',
                        }}
                        title="View earning by product report"
                        onClick={() => openReportTunnel(2)}
                     >
                        Earnings by product
                     </Text>
                     <Text
                        as="text2"
                        style={{
                           marginLeft: '8px',
                           fontWeight: '400',
                           cursor: 'pointer',
                           color: '#367bf5',
                           lineHeight: '24px',
                        }}
                        title="View earning by customer report"
                        onClick={() => openReportTunnel(3)}
                     >
                        Earnings by customer
                     </Text>
                     {/* {showMore && (
                        <>
                           <Text
                              as="text2"
                              style={{
                                 marginLeft: '8px',
                                 fontWeight: '400',
                                 cursor: 'pointer',
                                 color: '#367bf5',
                                 lineHeight: '24px',
                              }}
                              title="View earning by discounts report"
                              onClick={() => openReportTunnel(4)}
                           >
                              Earnings by discounts
                           </Text>
                           <Text
                              as="text2"
                              style={{
                                 marginLeft: '8px',
                                 fontWeight: '400',
                                 cursor: 'pointer',
                                 color: '#367bf5',
                                 lineHeight: '24px',
                              }}
                              title="View earning by location report"
                              onClick={() => openReportTunnel(5)}
                           >
                              Earnings by location
                           </Text>
                           <Text
                              as="text2"
                              style={{
                                 marginLeft: '8px',
                                 fontWeight: '400',
                                 cursor: 'pointer',
                                 color: '#367bf5',
                                 lineHeight: '24px',
                              }}
                              title="View earning by vendor report"
                              onClick={() => openReportTunnel(6)}
                           >
                              Earnings by vendor
                           </Text>
                        </>
                     )}
                     <Flex container justifyContent="flex-end" width="100%">
                        <Text
                           as="helpText"
                           style={{
                              color: '#367BF5',
                              cursor: 'pointer',
                              marginRight: '8px',
                           }}
                           onClick={() => setShowMore(!showMore)}
                        >
                           Show {showMore ? 'less ▲' : 'more ▼'}
                        </Text>
                     </Flex> */}
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
export default TotalEarningReport
