import React, { useState } from 'react'
import moment from 'moment'
import { useSubscription } from '@apollo/react-hooks'
import { DashboardTableContext } from '../../context'
import { InlineLoader } from '../../../InlineLoader'
import { logger } from '../../../../utils'
import { TableHeader } from '../../shared'
import { toast } from 'react-toastify'
import { ErrorState } from '../../../ErrorState'
import { Filler, Text } from '@dailykit/ui'
import { ReactTabulator } from '@dailykit/react-tabulator'
import TableOptions from '../../tableOptions'
import { useHistory } from 'react-router-dom'

import '../../tableStyle.css'
import { ORDER_OPPORTUNITY } from '../../graphql/subscription'
const OrderOpportunityTable = () => {
   const [subsOccurenceList, setSubsOccurenceList] = useState([])
   const [status, setStatus] = useState({
      loading: true,
   })
   const history = useHistory()

   const tableHandleOnClick = () => {
      history.push('subscription/subscription-occurrences')
   }

   //subscription for order opportunity
   const { loading: subsLoading, error: subsError } = useSubscription(
      ORDER_OPPORTUNITY,
      {
         variables: {
            brandCustomerFilter: {
               isSubscriber: { _eq: true },
               isSubscriptionCancelled: { _eq: false },
            },
         },
         onSubscriptionData: ({ subscriptionData }) => {
            setSubsOccurenceList(
               subscriptionData.data.FullOccurenceReport.map(occurence => ({
                  ...occurence,
                  orderId: occurence.id || 'N/A',
               }))
            )
            setStatus({ ...status, loading: false })
         },
      }
   )
   const columns = [
      {
         title: 'Order Id',
         field: 'orderId',
      },
      {
         title: 'Full Name',
         field: 'fullName',
      },
      {
         title: 'Email',
         field: 'email',
      },
      {
         title: '% Skipped',
         field: 'percentageSkipped',
      },
      {
         title: '% Paused',
         field: 'percentagePaused',
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
   if (subsOccurenceList.length == 0) {
      return <Filler message="No Recipe Summary Available" />
   }
   return (
      <>
         <TableHeader
            heading="Order Opportunities"
            onClick={tableHandleOnClick}
         >
            <ReactTabulator
               columns={columns}
               options={TableOptions}
               data={subsOccurenceList}
               className="dashboard-table"
            />
         </TableHeader>
      </>
   )
}

export default OrderOpportunityTable
