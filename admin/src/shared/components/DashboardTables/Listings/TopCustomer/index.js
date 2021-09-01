import { useSubscription } from '@apollo/react-hooks'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import '../../tableStyle.css'
import { Filler, Text } from '@dailykit/ui'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { logger } from '../../../../utils'
import { ErrorState } from '../../../ErrorState'
import { InlineLoader } from '../../../InlineLoader'
import { DashboardTableContext, DashboardTableProvider } from '../../context'
import { TOP_CUSTOMERS } from '../../graphql/subscription'
import { TableHeader } from '../../shared'
import TableOptions from '../../tableOptions'
import { useHistory } from 'react-router-dom'

const TopCustomer = () => {
   const { dashboardTableState } = React.useContext(DashboardTableContext)
   const [topCustomerList, setTopCustomerList] = useState([])
   const [status, setStatus] = useState({ loading: true })
   const history = useHistory()

   const { loading: subsLoading, error: subsError } = useSubscription(
      TOP_CUSTOMERS,
      {
         variables: {
            topCustomersArgs: {
               params: {
                  where: `id IS NOT NULL ${
                     dashboardTableState.from && dashboardTableState.to
                        ? `AND \"created_at\" >= '${dashboardTableState.from}' AND \"created_at\" <= '${dashboardTableState.to}'`
                        : ''
                  }`,
                  customerWhere: 'id IS NOT NULL',
                  limit: 'LIMIT 10',
               },
            },
         },
         onSubscriptionData: ({ subscriptionData }) => {
            const newTopCustomerData =
               subscriptionData.data.insights_analytics[0].getTopCustomers.map(
                  customer => {
                     const newCustomer = {}
                     newCustomer.email = customer.email || 'N/A'
                     newCustomer.fullName = `${customer.firstName || 'N/A'} ${
                        customer.lastName || ''
                     }`
                     newCustomer.phoneNumber = customer.phoneNumber || 'N/A'
                     newCustomer.totalAmountPaid = customer.totalAmountPaid || 0
                     return newCustomer
                  }
               )
            setTopCustomerList(newTopCustomerData)
            setStatus({ ...status, loading: false })
         },
      }
   )
   useEffect(() => {
      if (subsLoading) {
         setStatus({ ...status, loading: true })
      }
   }, [subsLoading])
   const tableHeaderOnClick = () => {
      history.push('crm/customers')
   }
   const columns = [
      {
         title: `Revenue Generated (${dashboardTableState.currency})`,
         field: 'totalAmountPaid',
         formatter: reactFormatter(<RevenueFormatter />),
         width: 70,
         headerTooltip: true,
      },
      {
         title: 'Customer Name',
         field: 'fullName',
         width: 120,
         headerTooltip: true,
      },
      {
         title: 'Email',
         field: 'email',
         width: 170,
      },
      {
         title: 'Phone',
         field: 'phoneNumber',
         width: 90,
      },
   ]
   if (!subsError && (subsLoading || status.loading)) {
      return <InlineLoader />
   }
   if (subsError) {
      logger(subsError)
      toast.error('Could not get the Insight data')
      return (
         <ErrorState height="320px" message="Could not get the Insight data" />
      )
   }
   if (topCustomerList.length == 0) {
      return <Filler message="No Top Customer Available" />
   }
   return (
      <>
         <TableHeader heading="Top Customer" onClick={tableHeaderOnClick}>
            <ReactTabulator
               data={topCustomerList}
               columns={columns}
               options={TableOptions}
               className="dashboard-table"
            />
         </TableHeader>
      </>
   )
}
const RevenueFormatter = ({ cell }) => {
   const nFormatter = num => {
      if (num >= 1000000) {
         return (num / 1000000).toFixed(2).replace(/\.00$/, '') + 'M'
      }
      if (num >= 1000) {
         return (num / 1000).toFixed(2).replace(/\.00$/, '') + 'K'
      }
      return num
   }
   const newRevenue = nFormatter(cell._cell.value)
   return (
      <>
         <Text as="text2">{newRevenue}</Text>
      </>
   )
}
export default TopCustomer
