import React, { useState } from 'react'
import * as Styles from './styled'
import WeeklyEarning from './WeeklyEarning'
import WeeklyOrderReceive from './WeeklyOrderReceive'
import WeeklySubscribers from './WeeklySubscribers'

const DashboardWeeklyAnalysis = () => {
   return (
      <>
         <Styles.WeeklyReportContainer>
            <Styles.WeeklyReports>
               <WeeklyEarning />
               <WeeklyOrderReceive />
               <WeeklySubscribers />
            </Styles.WeeklyReports>
         </Styles.WeeklyReportContainer>
      </>
   )
}
export default DashboardWeeklyAnalysis
