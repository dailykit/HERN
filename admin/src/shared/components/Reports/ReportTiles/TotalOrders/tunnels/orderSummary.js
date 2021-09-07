import { Flex, Spacer } from '@dailykit/ui'
import React from 'react'
import {
   AnalyticsApiArgsContext,
   AnalyticsApiArgsProvider,
} from '../../../../DashboardAnalytics/context/apiArgs'
import { TotalOrderRecTunnel } from '../../../../DashboardAnalytics/Tunnels/DrillDownTunnel'
import OrderSummaryTable from './listing/orderSummary'
const TotalOrderRecTunnelForReport = () => {
   const { analyticsApiArgState } = React.useContext(AnalyticsApiArgsContext)

   return (
      <>
         <Flex container flexDirection="column" padding="0px 21px">
            <TotalOrderRecTunnel />
         </Flex>
      </>
   )
}

const OrderSummary = () => {
   return (
      <>
         <AnalyticsApiArgsProvider>
            <TotalOrderRecTunnelForReport />
         </AnalyticsApiArgsProvider>
      </>
   )
}
export default OrderSummary
