import React from 'react'
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import {
   Loader,
   Flex,
   Dropdown,
   Spacer,
   TextButton,
   ButtonGroup,
   Text,
} from '@dailykit/ui'
import moment from 'moment'
import './tableStyle.css'
import options from './tableOptions'
import { Tooltip } from '../../components'
import { useTooltip, TooltipProvider } from '../../providers'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import {
   SUBSCRIPTION_VIEW_FULL_OCCURENCE_REPORT,
   FULL_OCCURENCE_REPORT,
} from './graphql'
import rRuleDay from '../../../apps/crm/Utils/rruleToText'
import { logger } from '../../utils'
import { ErrorState } from '../ErrorState'
import { InlineLoader } from '../InlineLoader'
const FullOccurrenceReport = () => {
   const [reports, setReports] = React.useState([])
   const [isLoading, setIsLoading] = React.useState(true)
   const [error, setError] = React.useState(false)
   const tableRef = React.useRef()
   // const { tooltip } = useTooltip()
   const groupByOptions = [
      { id: 1, title: 'Paused', payLoad: 'isPaused' },
      { id: 2, title: 'Skipped', payLoad: 'isSkipped' },
      { id: 3, title: 'Payment Status', payLoad: 'paymentStatus' },
      { id: 4, title: 'Title', payLoad: 'title' },
      { id: 5, title: 'Serving Size', payLoad: 'subscriptionServingSize' },
      { id: 6, title: 'Item Count', payLoad: 'subscriptionItemCount' },
      { id: 7, title: 'Delivery Day', payLoad: 'rrule' },
      { id: 8, title: 'Email', payLoad: 'email' },
      { id: 9, title: 'Fulfillment Data', payLoad: 'fulfillmentDate' },
      {
         id: 10,
         title: 'Sub. Occurence Id',
         payLoad: 'subscriptionOccurenceId',
      },
      { id: 11, title: 'All Time Rank', payLoad: 'allTimeRank' },
      { id: 12, title: 'Sub. Item Count', payLoad: 'subscriptionItemCount' },
      {
         id: 13,
         title: 'Sub. Serving Size',
         payLoad: 'subscriptionServingSize',
      },
      { id: 14, title: 'Item Count Valid', payLoad: 'isItemCountValid' },
      { id: 15, title: 'Between Paused', payLoad: 'betweenPause' },
      { id: 16, title: '% Skipped', payLoad: 'percentageSkipped' },
      {
         id: 17,
         title: 'Item Count Valid Comment',
         payLoad: 'itemCountValidComment',
      },
   ]
   //query
   useQuery(FULL_OCCURENCE_REPORT, {
      variables: {
         brandCustomerFilter: {
            isSubscriber: { _eq: true },
            isSubscriptionCancelled: { _eq: false },
         },
      },
      onCompleted: data => {
         if (
            !Array.isArray(data?.FullOccurenceReport) &&
            data.FullOccurenceReport.length === 0
         )
            return
         setReports(data.FullOccurenceReport)
         setIsLoading(false)
      },
      onError: error => {
         console.log(error)
         setError(true)
         setIsLoading(false)
      },
   })
   const columns = [
      {
         title: 'Email',
         field: 'email',
         headerFilter: true,
         width: 200,
         frozen: true,
      },
      {
         title: 'Cart Id',
         field: 'cartId',
         width: 200,
         headerFilter: true,
         headerTooltip: function (column) {
            const identifier = 'subscription_full_cart_id_column'
            return column.getDefinition().title
         },
      },
      {
         title: 'Cut Off Time',
         field: 'cutoffTimeStamp',
         width: 200,
         headerFilter: true,
         formatter: reactFormatter(<CutoffTimeStampFormatter />),
         headerTooltip: function (column) {
            const identifier =
               'subscription_full_occurrence_cutoff_time_stamp_column'
            return column.getDefinition().title
         },
      },
      {
         title: 'Fulfillment Date',
         field: 'fulfillmentDate',
         width: 200,
         headerFilter: true,
         headerTooltip: function (column) {
            const identifier =
               'subscription_full_occurrence_fulfillment_date_column'
            return column.getDefinition().title
         },
      },
      {
         title: 'Delivery Day',
         field: 'rrule',
         width: 200,
         formatter: reactFormatter(<DeliveryDateFormatter />),
      },
      {
         title: 'All Time Rank',
         field: 'allTimeRank',
         width: 200,
         headerFilter: true,
         headerTooltip: function (column) {
            const identifier =
               'subscription_full_occurrence_all_time_rank_column'
            return column.getDefinition().title
         },
      },
      {
         title: 'Sub. Occurence Id',
         field: 'subscriptionOccurenceId',
         width: 200,
         headerFilter: true,
         headerTooltip: function (column) {
            const identifier =
               'subscription_full_occurrence_subscription_occurrence_id_column'
            return column.getDefinition().title
         },
      },
      {
         title: 'Sub. Item Count',
         field: 'subscriptionItemCount',
         width: 200,
         headerFilter: true,
         headerTooltip: function (column) {
            const identifier =
               'subscription_full_occurrence_subscription_occurrence_id_column'
            return column.getDefinition().title
         },
      },
      {
         title: 'Sub. Serving Size',
         field: 'subscriptionServingSize',
         width: 200,
         headerFilter: true,
         headerTooltip: function (column) {
            const identifier =
               'subscription_full_occurrence_subscription_occurrence_id_column'
            return column.getDefinition().title
         },
      },
      {
         title: 'Title',
         field: 'title',
         width: 200,
         headerFilter: true,
         headerTooltip: function (column) {
            const identifier =
               'subscription_full_occurrence_subscription_occurrence_id_column'
            return column.getDefinition().title
         },
      },
      {
         title: '# Products In Cart',
         field: 'addedProductsCount',
         headerFilter: 'number',
         headerFilterPlaceholder: 'Equal to',
         headerFilterFunc: '=',
         width: 200,
         headerTooltip: function (column) {
            const identifier =
               'subscription_full_occurrence_#_products_in_cart_column'
            return column.getDefinition().title
         },
      },
      {
         title: 'Item Count Valid',
         field: 'isItemCountValid',
         width: 200,
         headerFilter: 'true',
         headerTooltip: function (column) {
            const identifier =
               'subscription_full_occurrence_item_count_valid_column'
            return column.getDefinition().title
         },
      },
      {
         title: 'Between Paused',
         field: 'betweenPause',
         width: 200,
         headerFilter: true,
         headerTooltip: function (column) {
            const identifier =
               'subscription_full_occurrence_between_pause_column'
            return column.getDefinition().title
         },
      },
      {
         title: 'Paused',
         field: 'isPaused',
         width: 200,
         headerFilter: true,
         headerTooltip: function (column) {
            const identifier = 'subscription_full_occurrence_pause_column'
            return column.getDefinition().title
         },
      },
      {
         title: 'Skipped',
         field: 'isSkipped',
         width: 200,
         headerFilter: true,
         headerTooltip: function (column) {
            const identifier = 'subscription_full_occurrence_is_skipped_column'
            return column.getDefinition().title
         },
      },
      {
         title: '% Skipped',
         field: 'percentageSkipped',
         width: 200,
         headerFilter: true,
         formatter: reactFormatter(<SkippedFormatter />),

         headerTooltip: function (column) {
            const identifier =
               'subscription_full_occurrence_percentage_skipped_column'
            return column.getDefinition().title
         },
      },
      {
         title: 'Skipped Stage',
         field: 'skippedAtThisStage',
         width: 200,
         headerFilter: true,
         headerTooltip: function (column) {
            const identifier =
               'subscription_full_occurrence_skipped_at_this_stage_column'
            return column.getDefinition().title
         },
      },
      {
         title: 'Discount',
         field: 'discount',
         width: 200,
         headerFilter: true,
         headerTooltip: function (column) {
            const identifier =
               'subscription_full_occurrence_payment_retry_attempt_column'
            return column.getDefinition().title
         },
      },
      {
         title: 'Payment Retry Attempt',
         field: 'paymentRetryAttempt',
         width: 200,
         headerFilter: true,
         headerTooltip: function (column) {
            const identifier =
               'subscription_full_occurrence_payment_retry_attempt_column'
            return column.getDefinition().title
         },
      },
      {
         title: 'Payment Status',
         field: 'paymentStatus',
         width: 200,
         headerFilter: true,
         headerTooltip: function (column) {
            const identifier =
               'subscription_full_occurrence_payment_status_column'
            return column.getDefinition().title
         },
      },
      {
         title: 'Item Valid Comment',
         field: 'itemCountValidComment',
         frozen: true,
         minWidth: 200,
         hozAlign: 'left',
      },
   ]
   const clearHeaderFilter = () => {
      tableRef.current.table.clearHeaderFilter()
   }
   const defaultIDS = () => {
      let arr = []
      const occurrenceGroup = localStorage.getItem(
         'tabulator-full_occurrence_table-group'
      )
      const occurrenceGroupParse =
         occurrenceGroup !== undefined &&
         occurrenceGroup !== null &&
         occurrenceGroup.length !== 0
            ? JSON.parse(occurrenceGroup)
            : null
      if (occurrenceGroupParse !== null) {
         occurrenceGroupParse.forEach(x => {
            const foundGroup = groupByOptions.find(y => y.payLoad == x)
            arr.push(foundGroup.id)
         })
      }
      console.log('this is arr', arr)
      return arr.length == 0 ? [9] : arr
   }
   const downloadCsvData = () => {
      tableRef.current.table.download(
         'csv',
         'full_subscription_occurrence_table.csv'
      )
   }

   const downloadPdfData = () => {
      tableRef.current.table.downloadToTab(
         'pdf',
         'full_subscription_occurrence_table.pdf'
      )
   }

   const downloadXlsxData = () => {
      tableRef.current.table.download(
         'xlsx',
         'full_subscription_occurrence_table.xlsx'
      )
   }
   const tableLoaded = () => {
      const occurrenceGroup = localStorage.getItem(
         'tabulator-full_occurrence_table-group'
      )
      const occurrenceGroupParse =
         occurrenceGroup !== undefined &&
         occurrenceGroup !== null &&
         occurrenceGroup.length !== 0
            ? JSON.parse(occurrenceGroup)
            : null
      console.log('this is uccurrnec', occurrenceGroupParse)
      tableRef.current.table.setGroupBy(
         !!occurrenceGroupParse && occurrenceGroupParse.length > 0
            ? occurrenceGroupParse
            : 'fulfillmentDate'
      )
      tableRef.current.table.setGroupHeader(function (
         value,
         count,
         data1,
         group
      ) {
         // let [totalOrders, totalPaid] = [0, 0]
         // const foo = (group, col) => {
         //    let total = 0
         //    if (group.groupList.length != 0) {
         //       group.groupList.forEach(each => (total += foo(each, col)))
         //    } else {
         //       group.rows.forEach(row => (total += row.data[col]))
         //    }
         //    return total
         // }
         // totalOrders = foo(group._group, 'orders')
         // totalPaid = foo(group._group, 'paid')
         // const avg = parseFloat(totalPaid / totalOrders).toFixed(2)
         let newHeader
         switch (group._group.field) {
            case 'paymentStatus':
               newHeader = 'Payment Status'
               break
            case 'isPaused':
               newHeader = 'Paused'
               break
            case 'isSkipped':
               newHeader = 'Skipped'
               break
            case 'fulfillmentDate':
               newHeader = 'Fulfillment Date'
               break

            case 'title':
               newHeader = 'Title'
               break

            case 'subscriptionServingSize':
               newHeader = 'Serving Size'
               break

            case 'subscriptionItemCount':
               newHeader = 'Item Count'
               break

            case 'rrule':
               newHeader = 'Delivery Day'
               value = rRuleDay(value)
               break
            case 'email':
               newHeader = 'Email'
               break
            case 'subscriptionOccurenceId':
               newHeader = 'Sub. Occurence Id'
               break
            case 'allTimeRank':
               newHeader = 'All Time Rank'
               break
            case 'subscriptionItemCount':
               newHeader = 'Sub. Item Count'
               break
            case 'subscriptionServingSize':
               newHeader = "Sub. Serving Size'"
               break
            case 'isItemCountValid':
               newHeader = 'Item Count Valid'
               break
            case 'betweenPause':
               newHeader = 'Between Paused'
               break
            case 'percentageSkipped':
               newHeader = '% Skipped '
               break
            case 'itemCountValidComment':
               newHeader = 'Item Count Valid Comment '
               break
            default:
               break
         }
         return `${newHeader} - ${value} || ${count} Order opportunity `
      })
   }
   if (isLoading) {
      return <InlineLoader />
   }
   if (error) {
      logger(error)
      toast.error(
         'Could not get the subscription occurence data, please refresh the page!'
      )
      return (
         <ErrorState
            height="320px"
            message="Could not get the subscription occurence data, please refresh the page!"
         />
      )
   }
   return (
      <>
         <TooltipProvider>
            <Flex padding="0px 42px 21px 42px">
               <Flex
                  container
                  height="80px"
                  alignItems="center"
                  justifyContent="space-between"
               >
                  <Flex container>
                     <Text as="title">Subscription Report</Text>
                     <Tooltip identifier="customer_list_heading" />
                  </Flex>
                  <Flex container alignItems="center">
                     <Text as="text1">Group By:</Text>
                     <Spacer size="5px" xAxis />
                     <Dropdown
                        type="multi"
                        variant="revamp"
                        disabled={true}
                        defaultIds={defaultIDS()}
                        options={groupByOptions}
                        searchedOption={() => {}}
                        selectedOption={value => {
                           localStorage.setItem(
                              'tabulator-full_occurrence_table-group',
                              JSON.stringify(value.map(x => x.payLoad))
                           )
                           tableRef.current.table.setGroupBy(
                              value.map(x => x.payLoad)
                           )
                        }}
                        typeName="groupBy"
                     />
                     <ButtonGroup align="left">
                        <TextButton
                           type="ghost"
                           size="sm"
                           onClick={() => clearHeaderFilter()}
                        >
                           Clear All Filter
                        </TextButton>
                     </ButtonGroup>
                     <Flex
                        margin="10px 0"
                        container
                        alignItems="center"
                        justifyContent="space-between"
                     >
                        <TextButton
                           onClick={downloadCsvData}
                           type="solid"
                           size="sm"
                        >
                           CSV
                        </TextButton>
                        <Spacer size="10px" xAxis />
                        <TextButton
                           onClick={downloadPdfData}
                           type="solid"
                           size="sm"
                        >
                           PDF
                        </TextButton>
                        <Spacer size="10px" xAxis />
                        <TextButton
                           onClick={downloadXlsxData}
                           type="solid"
                           size="sm"
                        >
                           XLSX
                        </TextButton>
                     </Flex>
                  </Flex>
               </Flex>
               <Spacer size="30px" />
               <ReactTabulator
                  columns={columns}
                  className="custom-css-class"
                  data={reports}
                  dataLoaded={tableLoaded}
                  data-custom-attr="test-custom-attribute"
                  options={options}
                  ref={tableRef}
               />
            </Flex>
         </TooltipProvider>
      </>
   )
}
const CutoffTimeStampFormatter = ({ cell }) => {
   return (
      <>
         <Text as="text2">
            {moment(cell._cell.value).format('MMMM Do YYYY, h:mm a')}
         </Text>
      </>
   )
}
const SkippedFormatter = ({ cell }) => {
   console.log('this is skipped', parseFloat(cell._cell.value).toFixed(2))
   console.log('this is skipped', cell)
   return (
      <>
         <Text as="text2">{parseFloat(cell._cell.value).toFixed(2)}</Text>
      </>
   )
}
const DeliveryDateFormatter = ({ cell }) => {
   return (
      <>
         <Text as="text2">{rRuleDay(cell._cell.value)}</Text>
      </>
   )
}
export default FullOccurrenceReport
