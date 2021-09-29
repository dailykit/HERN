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
import { RECIPE_SUMMARY } from '../../graphql/subscription'
const RecipeSummaryApp = () => {
   const [recipeSummaryList, setRecipeSummaryList] = useState([])
   const [status, setStatus] = useState({
      loading: true,
   })
   const history = useHistory()

   const { dashboardTableState } = React.useContext(DashboardTableContext)
   const { loading: subsLoading, error: subsError } = useSubscription(
      RECIPE_SUMMARY,
      {
         variables: {
            recipeSummaryArgs: {
               params: {
                  where: `\"paymentStatus\"='SUCCEEDED' ${
                     dashboardTableState.from && dashboardTableState.to
                        ? `AND created_at >= '${dashboardTableState.from}' AND created_at <= '${dashboardTableState.to}'`
                        : ''
                  }`,
               },
            },
         },
         onSubscriptionData: ({ subscriptionData }) => {
            console.log('Recipe Summary', subscriptionData)
            setRecipeSummaryList(
               subscriptionData.data.insights_analytics[0].getTopRecipes
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

   const tableHandleOnClick = () => {
      history.push('products/recipes')
   }
   const columns = [
      {
         title: 'Recipe Name',
         field: 'name',
         width: 230,
      },
      {
         title: 'Last Ordered',
         field: 'lastOrderedAt',
         formatter: reactFormatter(<DateFormatter />),
      },
      {
         title: 'Updated At',
         field: 'updated_at',
         formatter: reactFormatter(<DateFormatter />),
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
   if (recipeSummaryList.length == 0) {
      return <Filler message="No Recipe Summary Available" />
   }
   return (
      <>
         <TableHeader heading="Recipe Summary" onClick={tableHandleOnClick}>
            <ReactTabulator
               columns={columns}
               options={TableOptions}
               data={recipeSummaryList}
               className="dashboard-table"
            />
         </TableHeader>
      </>
   )
}
const DateFormatter = ({ cell }) => {
   return (
      <>
         <Text as="text2">
            {cell._cell.value ? moment(cell._cell.value).format('ll') : 'N/A'}
         </Text>
      </>
   )
}
export default RecipeSummaryApp
