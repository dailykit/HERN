import React, { useEffect, useState, useRef, useContext } from 'react'
import { Text, Flex, useTunnel } from '@dailykit/ui'
import { useQuery, useSubscription } from '@apollo/react-hooks'
import { useHistory } from 'react-router-dom'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import OrderComp from './order'
import { OCCURENCES } from '../../../graphql'
import { NewInfoIcon } from '../../../../../shared/assets/icons'
import { StyledInfo, StyledActionText } from './styled'
import options from '../../tableOptions'
import {
   Tooltip,
   InlineLoader,
   ActivityLogs,
} from '../../../../../shared/components'
import { useTooltip, useTabs } from '../../../../../shared/providers'
import { currencyFmt, logger } from '../../../../../shared/utils'
import { toast } from 'react-toastify'
import BrandContext from '../../../context/Brand'
import { OCCURENCES_REPORT } from '../../../graphql/queries'


const SubscriptionTable = ({ brandCustomerId }) => {
   const [context, setContext] = useContext(BrandContext)
   const { dispatch, tab } = useTabs()
   const { tooltip } = useTooltip()
   const history = useHistory()
   const [occurences, setOccurences] = useState([])
   const tableRef = useRef(null)
   const [tunnels, openLogsTunnel, closeLogsTunnel] = useTunnel(1)
   const [occurenceId, setOccurenceId] = React.useState(null)

   const { loading: listLoading, data: occurencesData } = useSubscription(
      OCCURENCES_REPORT,
      {
         variables: {
            brand_customerId: { _eq: brandCustomerId },
         },
         onSubscriptionData: data => {
            const { report } = data.subscriptionData.data

            console.log({ report })
         },
      }
   )
   // console.log('Report error: ', error)

   useEffect(() => {
      if (!tab) {
         history.push('/crm/customers')
      }
   }, [history, tab])

   const columns = React.useMemo(   
      () => [
         {
            title: 'ID',
            field: 'id',
            hozAlign: 'left',
            frozen: true,
            cssClass: 'rowClick',
            cellClick: (e, cell) => {
               const data = cell.getData()
               if (data?.id) {
                  setOccurenceId(data?.id)
                  openLogsTunnel(1)
               }
            },
            headerTooltip: function (column) {
               const identifier = 'subscription_occurence_sub_id_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            width: 100,
         },
         {
            title: 'Fulfillment Date',
            field: 'fulfillmentDate',
            hozAlign: 'left',
            frozen: true,
            headerTooltip: function (column) {
               const identifier =
                  'subscription_occurence_fulfillment_date_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            width: 150,
         },
         {
            title: 'Cut-off Time',
            field: 'cutoffTimeStamp',
            hozAlign: 'left',
            headerTooltip: function (column) {
               const identifier =
                  'subscription_occurence_fulfillment_date_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            width: 150,
         },
         {
            title: 'Item Count Valid',
            field: 'isItemCountValid',
            hozAlign: 'left',
            headerTooltip: function (column) {
               const identifier =
                  'subscription_occurence_fulfillment_date_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            width: 150,
         },
         {
            title: 'Skipped',
            field: 'isSkipped',
            hozAlign: 'left',
            headerTooltip: function (column) {
               const identifier =
                  'subscription_occurence_fulfillment_date_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            width: 150,
         },
         {
            title: 'Products Added',
            field: 'addedProductsCount',
            hozAlign: 'left',
            headerTooltip: function (column) {
               const identifier =
                  'subscription_occurence_fulfillment_date_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            width: 150,
         },
         {
            title: 'Products to be Added',
            field: 'totalProductsToBeAdded',
            hozAlign: 'left',
            headerTooltip: function (column) {
               const identifier =
                  'subscription_occurence_products_to_be_added_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            width: 100,
         },
         {
            title: 'Cart ID',
            field: 'cartId',
            hozAlign: 'right',
            headerTooltip: function (column) {
               const identifier =
                  'subscription_occurence_fulfillment_date_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            width: 150,
         },
         {
            title: 'Between Pause',
            field: 'betweenPause',
            hozAlign: 'left',
            headerTooltip: function (column) {
               const identifier =
                  'subscription_occurence_fulfillment_date_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            width: 150,
         },
         {
            title: 'All Time Rank',
            field: 'allTimeRank',
            hozAlign: 'left',
            headerTooltip: function (column) {
               const identifier =
                  'subscription_occurence_fulfillment_date_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            width: 150,
         },
         {
            title: 'Payment Status',
            field: 'paymentStatus',
            hozAlign: 'left',
            headerTooltip: function (column) {
               const identifier =
                  'subscription_occurence_fulfillment_date_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            width: 150,
         },
         {
            title: 'Cart Payment Status',
            field: 'cartPaymentStatus',
            hozAlign: 'left',
            headerTooltip: function (column) {
               const identifier =
                  'subscription_occurence_fulfillment_date_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            width: 150,
         },
         {
            title: 'Cart Status',
            field: 'cartStatus',
            hozAlign: 'left',
            headerTooltip: function (column) {
               const identifier =
                  'subscription_occurence_fulfillment_date_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            width: 150,
         },
         {
            title: 'Cart Amount',
            field: 'cartAmount',
            hozAlign: 'left',
            headerTooltip: function (column) {
               const identifier =
                  'subscription_occurence_fulfillment_date_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            width: 150,
         },
         {
            title: 'Percentage Skipped',
            field: 'percentageSkipped',
            hozAlign: 'left',
            headerTooltip: function (column) {
               const identifier =
                  'subscription_occurence_fulfillment_date_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            width: 150,
         },
         {
            title: 'Skipped at Stage',
            field: 'skippedAtThisStage',
            hozAlign: 'left',
            headerTooltip: function (column) {
               const identifier =
                  'subscription_occurence_fulfillment_date_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            width: 150,
         },
         {
            title: 'Paused',
            field: 'isPaused',
            hozAlign: 'left',
            headerTooltip: function (column) {
               const identifier =
                  'subscription_occurence_fulfillment_date_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            width: 150,
         },
         {
            title: 'Auto',
            field: 'isAuto',
            hozAlign: 'left',
            headerTooltip: function (column) {
               const identifier =
                  'subscription_occurence_fulfillment_date_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            width: 150,
         },
      ],
      []
   )

   const setOrder = (orderId, order) => {
      dispatch({
         type: 'STORE_TAB_DATA',
         payload: {
            path: tab?.path,
            data: { oid: orderId, isOccurencesClicked: order },
         },
      })
   }

   useEffect(() => {
      setOrder('', false)
   }, [])

   const rowClick = (e, cell) => {
      const orderId = cell._cell.row.data.oid.toString()
      setOrder(orderId, true)
   }

   console.log({ occurences })

   const renderTabulator = React.useCallback(() => {
      if (!occurencesData) return null
      console.log({ occurencesData })
      const data = occurencesData?.report?.nodes.map(node => ({
         id: node.subscriptionOccurenceId ?? '-',
         totalProductsToBeAdded: node.totalProductsToBeAdded ?? '-',
         fulfillmentDate: node.fulfillmentDate ?? '-',
         cutoffTimeStamp: node.cutoffTimeStamp ?? '-',
         cartId: node.cartId ?? '-',
         betweenPause: node.betweenPause ?? '-',
         allTimeRank: node.allTimeRank ?? '-',
         addedProductsCount: node.addedProductsCount ?? '-',
         paymentStatus: node.paymentStatus ?? '-',
         percentageSkipped: node.percentageSkipped ?? '-',
         skippedAtThisStage: node.skippedAtThisStage ?? '-',
         isSkipped: node.isSkipped ?? '-',
         isPaused: node.isPaused ?? '-',
         isItemCountValid: node.isItemCountValid ?? '-',
         isAuto: node.isAuto ?? '-',
         cartPaymentStatus: node.cart?.paymentStatus ?? '-',
         cartStatus: node.cart?.status ?? '-',
         cartAmount: node.cart?.amount ?? '-',
      }))

      return (
         <ReactTabulator
            columns={columns}
            data={data}
            options={{
               ...options,
               placeholder: 'No Occurences Available Yet !',
            }}
            ref={tableRef}
            className='crmCustomerTable'
         />
      )
   }, [occurencesData])

   if (listLoading) return <InlineLoader />
   return (
      <>
         <Flex maxWidth="1280px" width="calc(100vw-64px)" margin="0 auto">
            {tab.data.isOccurencesClicked ? (
               <OrderComp />
            ) : (
               <>
                  <Flex
                     container
                     height="80px"
                     padding="16px"
                     alignItems="center"
                  >
                     <Text as="title">
                        Occurences(
                        {occurencesData?.report?.aggregate?.count || 'N/A'})
                     </Text>
                     <Tooltip identifier="order_list_heading" />
                  </Flex>
                  {Boolean(occurences) && renderTabulator()}
               </>
            )}
            <ActivityLogs
               tunnels={tunnels}
               openTunnel={openLogsTunnel}
               closeTunnel={closeLogsTunnel}
               brand_customerId={brandCustomerId}
               subscriptionOccurenceId={occurenceId}
            />
         </Flex>
      </>
   )
}

export default SubscriptionTable

const InfoButton = ({ cell }) => {
   const rowData = cell._cell.row.data
   return (
      <Text as="p">
         {rowData.date} &nbsp;&nbsp;
         <StyledInfo>
            <NewInfoIcon size="16" />
            <div>
               <Text as="subtitle">CutoffTimestamp </Text>
               <Text as="p">{rowData.startTimeStamp} </Text>
               <Text as="subtitle">StartTimestamp </Text>
               <Text as="p">{rowData.cutoffTimeStamp}</Text>
            </div>
         </StyledInfo>
      </Text>
   )
}

const ActionText = ({ cell }) => {
   const rowData = cell._cell.row.data
   switch (rowData.action) {
      case 'Skipped':
         return (
            <StyledActionText color="#E6C02A">
               {`[${rowData.action}]`}
            </StyledActionText>
         )
      case 'Order Placed':
         return (
            <StyledActionText color="#28C1F7">{`[${rowData.action}]`}</StyledActionText>
         )
      case 'Added To Cart':
         return (
            <StyledActionText color="#53C22B">
               {`[${rowData.action}]`}
            </StyledActionText>
         )
      case 'No Action':
         return (
            <StyledActionText color="#C4C4C4">
               {rowData.action}
            </StyledActionText>
         )
      default:
         return <StyledActionText>{rowData.action}</StyledActionText>
   }
}
