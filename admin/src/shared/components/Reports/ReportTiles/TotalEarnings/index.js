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
import React, { useEffect, useState } from 'react'
import BrandShopDate from '../../../BrandShopDateProvider'
import { Tile } from '../../../DashboardTiles'
import EarningOverTime from './Tunnels/earningOverTime'

const TotalEarningReport = () => {
   const [reportTunnels, openReportTunnel, closeReportTunnel] = useTunnel(6)
   const [showMore, setShowMore] = useState(false)
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
            </Tunnel>
            <Tunnel size="full" layer={3}>
               <TunnelHeader
                  title="Earning by vendor"
                  close={() => closeReportTunnel(3)}
                  description="This is a description"
               />
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
                  title="Earning by customer"
                  close={() => closeReportTunnel(6)}
                  description="This is a description"
               />
            </Tunnel>
         </Tunnels>
         <Tile>
            <Tile.Head title="Earnings"></Tile.Head>
            <Tile.Body>
               <Flex
                  container
                  flexDirection="column"
                  width="100%"
                  alignItems="flex-start"
               >
                  <Text as="text1" style={{ marginLeft: '20px' }}>
                     Reports
                  </Text>
                  <Spacer size="10px" />
                  <Text
                     as="text2"
                     title="View earning overtime report"
                     style={{
                        marginLeft: '20px',
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
                        marginLeft: '20px',
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
                        marginLeft: '20px',
                        fontWeight: '400',
                        cursor: 'pointer',
                        color: '#367bf5',
                        lineHeight: '24px',
                     }}
                     title="View earning by vendor report"
                     onClick={() => openReportTunnel(3)}
                  >
                     Earnings by vendor
                  </Text>
                  {showMore && (
                     <>
                        <Text
                           as="text2"
                           style={{
                              marginLeft: '20px',
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
                              marginLeft: '20px',
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
                              marginLeft: '20px',
                              fontWeight: '400',
                              cursor: 'pointer',
                              color: '#367bf5',
                              lineHeight: '24px',
                           }}
                           title="View earning by customer report"
                           onClick={() => openReportTunnel(6)}
                        >
                           Earnings by customer
                        </Text>
                     </>
                  )}
                  <Flex container justifyContent="flex-end" width="100%">
                     <Text
                        as="helpText"
                        style={{ color: '#367BF5', cursor: 'pointer' }}
                        onClick={() => setShowMore(!showMore)}
                     >
                        Show {showMore ? 'less ▲' : 'more ▼'}
                     </Text>
                  </Flex>
               </Flex>
            </Tile.Body>
         </Tile>
      </>
   )
}
export default TotalEarningReport
