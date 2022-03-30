import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { useSubscription } from '@apollo/react-hooks'
import { DashboardTableContext } from '../../context'
import { InlineLoader } from '../../../InlineLoader'
import { logger } from '../../../../utils'
import { TableHeader } from '../../shared'
import { toast } from 'react-toastify'
import { ErrorState } from '../../../ErrorState'
import { Filler, Text } from '@dailykit/ui'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import TableOptions from '../../tableOptions'
import { useHistory } from 'react-router-dom'

import '../../tableStyle.css'
import { TOP_PRODUCT_LIST } from '../../graphql/subscription'
const MenuSummary = () => {
   const [topProductsList, setTopProductsList] = useState([])
   const [status, setStatus] = useState({
      loading: true,
   })
   const { dashboardTableState } = React.useContext(DashboardTableContext)
   const history = useHistory()

   const tableHandleOnClick = () => {
      history.push('menu')
   }
   // console.log('menuSummary', {
   //    where: `"paymentStatus"=\'SUCCEEDED\' ${
   //       dashboardTableState.from && dashboardTableState.to
   //          ? `AND \"created_at\" >= '${moment(
   //               dashboardTableState.from
   //            ).format()}' AND \"created_at\" <= '${moment(
   //               dashboardTableState.to
   //            ).format()}'`
   //          : ''
   //    }`,
   // })
   //subscription for order opportunity
   const { loading: subsLoading, error: subsError } = useSubscription(
      TOP_PRODUCT_LIST,
      {
         variables: {
            topProductArgs: {
               params: {
                  where: `"paymentStatus"=\'SUCCEEDED\' ${
                     dashboardTableState.from && dashboardTableState.to
                        ? `AND "created_at" >= '${moment(
                             dashboardTableState.from
                          ).format()}' AND "created_at" <= '${moment(
                             dashboardTableState.to
                          ).format()}'`
                        : ''
                  }`,
               },
            },
         },
         onSubscriptionData: ({ subscriptionData }) => {
            setTopProductsList(
               subscriptionData.data.insights_analytics[0].getTopProducts
            )
            setStatus({ ...status, loading: false })
         },
      }
   )
   useEffect(() => {
      if (subsLoading) {
         setStatus({ ...status, loading: true })
      }
   }, [subsLoading])
   const columns = [
      {
         title: 'Product Name',
         field: 'name',
         width: 200,
         headerTooltip: true,
      },
      {
         title: 'Last Ordered',
         field: 'orderedAt',
         formatter: reactFormatter(<DateFormatter />),
         width: 90,
         headerTooltip: true,
      },
      {
         title: 'Ordered Time',
         field: 'orderedAt',
         formatter: reactFormatter(<DateFormatter withTime />),
         width: 90,
         headerTooltip: true,
      },
      {
         title: 'Status',
         field: 'isArchived',
         formatter: reactFormatter(<StatusFormatter />),
         width: 150,
         headerTooltip: true,
      },
   ]
   if (subsLoading || status.loading) {
      return <InlineLoader />
   }
   if (subsError) {
      logger(subsError)
      toast.error('Could not get the Insight data')
      return (
         <ErrorState height="320px" message="Could not get the Insight data" />
      )
   }
   if (topProductsList.length == 0) {
      return <Filler message="No Recipe Summary Available" />
   }
   return (
      <>
         <TableHeader heading="Menu Summary" onClick={tableHandleOnClick}>
            <ReactTabulator
               columns={columns}
               options={TableOptions}
               data={topProductsList}
               className="dashboard-table"
            />
         </TableHeader>
      </>
   )
}
const StatusFormatter = ({ cell }) => {
   return (
      <>
         <span style={{ color: `${cell._cell.value ? '#B02828' : '#8C50BC'}` }}>
            {cell._cell.value ? 'Not Available' : 'Available'}
         </span>
      </>
   )
}
const DateFormatter = ({ cell, withTime }) => {
   return (
      <>
         <Text as="text2">
            {cell._cell.value
               ? moment(cell._cell.value).format(withTime ? 'LT' : 'll')
               : 'N/A'}
         </Text>
      </>
   )
}
export default MenuSummary
