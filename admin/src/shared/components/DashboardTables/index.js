import { Flex } from '@dailykit/ui'
import React from 'react'
import styled from 'styled-components'
import { DashboardTableContext, DashboardTableProvider } from './context'

import { DatePicker, Space } from 'antd'
import moment from 'moment'
import RecentOrderTable from './Listings/RecentOrder'
import 'antd/es/date-picker/style/css'
const { RangePicker } = DatePicker
const DashboardTables = () => {
   return (
      <>
         {/* <DateRangePicker /> */}
         <Tables>
            <RecentOrderTable />
            {/* <TopCustomerTable />
            <RecipeSummaryApp />
            <MenuSummary />
            <OrderOpportunityTable />
            <SubscribersTable /> */}
         </Tables>
      </>
   )
}
const DashboardProvider = () => {
   return (
      <DashboardTableProvider>
         <DashboardTables />
      </DashboardTableProvider>
   )
}
const DateRangePicker = () => {
   const { dashboardTableDispatch } = React.useContext(DashboardTableContext)
   function onChange(dates, dateStrings) {
      if (dates) {
         dashboardTableDispatch({
            type: 'FROM',
            payload: dateStrings[0],
         })
         dashboardTableDispatch({
            type: 'TO',
            payload: dateStrings[1],
         })
      } else {
         dashboardTableDispatch({
            type: 'FROM',
            payload: false,
         })
         dashboardTableDispatch({
            type: 'TO',
            payload: false,
         })
      }
   }
   return (
      <Flex container padding="14px 0px">
         <Space direction="vertical" size={12}>
            <RangePicker
               ranges={{
                  Today: [moment(), moment()],
                  'This Month': [
                     moment().startOf('month'),
                     moment().endOf('month'),
                  ],
               }}
               onChange={onChange}
            />
         </Space>
      </Flex>
   )
}
const Tables = styled.div`
   margin: 20px 0px;
   // display: grid;
   // grid-template-columns: 50% 50%;
   // grid-gap: 7px;
   // grid-template-rows: repeat(500px);
`
export default DashboardProvider
