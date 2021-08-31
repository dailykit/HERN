import React from 'react'
import {
   AnalyticsApiArgsContext,
   AnalyticsApiArgsProvider,
} from '../../../../DashboardAnalytics/context/apiArgs'

import { TotalEarningTunnel } from '../../../../DashboardAnalytics/Tunnels/DrillDownTunnel'

const TotalEarningOverTime = () => {
   const { analyticsApiArgState } = React.useContext(AnalyticsApiArgsContext)
   return (
      <>
         <TotalEarningTunnel currency={analyticsApiArgState.currency} />
      </>
   )
}
const EarningOverTime = () => (
   <AnalyticsApiArgsProvider>
      <TotalEarningOverTime />
   </AnalyticsApiArgsProvider>
)
export default EarningOverTime
