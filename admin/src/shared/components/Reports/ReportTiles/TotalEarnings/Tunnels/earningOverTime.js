import React from 'react'
import { AnalyticsApiArgsProvider } from '../../../../DashboardAnalytics/context/apiArgs'

import { TotalEarningTunnel } from '../../../../DashboardAnalytics/Tunnels/DrillDownTunnel'

const EarningOverTime = () => {
   return (
      <>
         <AnalyticsApiArgsProvider>
            <TotalEarningTunnel />
         </AnalyticsApiArgsProvider>
      </>
   )
}

export default EarningOverTime
