import { Tunnel, TunnelHeader, Tunnels, useTunnel } from '@dailykit/ui'
import React, { useState } from 'react'
import EarningOverTime from '../Reports/ReportTiles/TotalEarnings/Tunnels/earningOverTime'
import OrderSummaryReport from '../Reports/ReportTiles/TotalOrders/tunnels/orderSummary'

import * as Styles from './styled'
import WeeklyEarning from './WeeklyEarning'
import WeeklyOrderReceive from './WeeklyOrderReceive'
import WeeklySubscribers from './WeeklySubscribers'

const DashboardWeeklyAnalysis = () => {
   const [tunnels, openTunnel, closeTunnel] = useTunnel(2)

   return (
      <>
         <Styles.WeeklyReportContainer>
            <Styles.WeeklyReports>
               <WeeklyEarning onClick={() => openTunnel(1)} />
               <WeeklyOrderReceive onClick={() => openTunnel(2)} />
               <WeeklySubscribers />
            </Styles.WeeklyReports>
         </Styles.WeeklyReportContainer>
         <Tunnels tunnels={tunnels}>
            <Tunnel size="full" layer={1}>
               <TunnelHeader
                  title="Earning over time"
                  close={() => closeTunnel(1)}
                  description="This is a description"
               />
               <EarningOverTime />
            </Tunnel>
            <Tunnel size="full" layer={2}>
               <TunnelHeader
                  title="Order Summary Report"
                  close={() => closeTunnel(2)}
                  description="This is a description"
               />
               <OrderSummaryReport />
            </Tunnel>
         </Tunnels>
      </>
   )
}
export default DashboardWeeklyAnalysis
