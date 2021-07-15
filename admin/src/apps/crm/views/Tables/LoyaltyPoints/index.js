import React, { useRef, useState, useContext } from 'react'
import { Text, Flex, ComboButton } from '@dailykit/ui'
import { ReactTabulator } from '@dailykit/react-tabulator'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useQuery, useSubscription } from '@apollo/react-hooks'
import options from '../../tableOptions'
import { useTooltip } from '../../../../../shared/providers'
import { logger } from '../../../../../shared/utils'
import { LOYALTYPOINTS_LISTING } from '../../../graphql'
import { Tooltip, InlineLoader } from '../../../../../shared/components'
import BrandContext from '../../../context/Brand'
import * as moment from 'moment'
import { PlusIcon } from '../../../../../shared/assets/icons'

const LoyaltyPointTable = ({ openLoyaltyPointsTxnTunnel }) => {
   const [context, setContext] = useContext(BrandContext)
   const tableRef = useRef()
   const { tooltip } = useTooltip()
   const { id } = useParams()
   const [loyaltyPointTxn, setLoyaltyPointTxn] = useState(null)
   const [txnCount, setTxnCount] = useState(0)

   // Query
   const { loading: listloading } = useSubscription(LOYALTYPOINTS_LISTING, {
      variables: {
         keycloakId: id,
         brandId: context.brandId,
      },
      onSubscriptionData: data => {
         const { loyaltyPointsTransactions } = data.subscriptionData.data
         const result = loyaltyPointsTransactions.map(loyaltyPnt => {
            return {
               date:
                  moment(loyaltyPnt?.created_at).format(
                     'MMMM Do YYYY, h:mm:ss a'
                  ) || 'N/A',
               reference: loyaltyPnt?.id || 'N/A',
               oid: loyaltyPnt?.orderCart?.orderId || 'N/A',
               type: loyaltyPnt.type,
               points: loyaltyPnt.points,
            }
         })

         setLoyaltyPointTxn(result)
         setTxnCount(loyaltyPointsTransactions.length)
      },
   })

   const columns = [
      {
         title: 'Transaction Date',
         field: 'date',
         headerFilter: true,
         hozAlign: 'left',
         titleFormatter: function (cell, formatterParams, onRendered) {
            cell.getElement().style.textAlign = 'left'
            return '' + cell.getValue()
         },
         headerTooltip: function (column) {
            const identifier = 'loyaltyPoints_listing_txnDate_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Reference number',
         field: 'reference',
         hozAlign: 'right',
         titleFormatter: function (cell, formatterParams, onRendered) {
            cell.getElement().style.textAlign = 'right'
            return '' + cell.getValue()
         },
         headerTooltip: function (column) {
            const identifier = 'loyaltyPoints_listing_referenceId_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Order Id',
         field: 'oid',
         hozAlign: 'right',
         titleFormatter: function (cell, formatterParams, onRendered) {
            cell.getElement().style.textAlign = 'right'
            return '' + cell.getValue()
         },
         headerTooltip: function (column) {
            const identifier = 'loyaltyPoints_listing_oid_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         width: 150,
      },
      {
         title: 'Type',
         field: 'type',
         hozAlign: 'right',
         titleFormatter: function (cell, formatterParams, onRendered) {
            cell.getElement().style.textAlign = 'right'
            return '' + cell.getValue()
         },
         headerTooltip: function (column) {
            const identifier = 'loyatlyPoints_listing_type_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         width: 100,
      },
      {
         title: 'Points',
         field: 'points',
         hozAlign: 'right',
         titleFormatter: function (cell, formatterParams, onRendered) {
            cell.getElement().style.textAlign = 'right'
            return '' + cell.getValue()
         },
         headerTooltip: function (column) {
            const identifier = 'loyaltyPoints_listing_points_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         width: 100,
      },
      // {
      //    title: 'Balance',
      //    field: 'balance',
      //    hozAlign: 'right',
      //    titleFormatter: function (cell, formatterParams, onRendered) {
      //       cell.getElement().style.textAlign = 'right'
      //       return '' + cell.getValue()
      //    },
      //    headerTooltip: function (column) {
      //       const identifier = 'loyaltyPoints_listing_balance_column'
      //       return (
      //          tooltip(identifier)?.description || column.getDefinition().title
      //       )
      //    },
      //    width: 100,
      // },
   ]

   if (listloading) return <InlineLoader />

   return (
      <Flex maxWidth="1280px" width="calc(100vw-64px)" margin="0 auto">
         <Flex
            container
            alignItems="center"
            justifyContent="space-between"
            margin="0 0 16px 0"
         >
            <Flex container alignItems="center">
               <Text as="title">Loyalty Points Transactions({txnCount})</Text>
               <Tooltip identifier="loyaltyPoints_list_heading" />
            </Flex>
            <ComboButton
               type="outline"
               size="sm"
               onClick={() => openLoyaltyPointsTxnTunnel(1)}
            >
               <PlusIcon />
               Create Transaction
            </ComboButton>
         </Flex>
         {Boolean(loyaltyPointTxn) && (
            <ReactTabulator
               columns={columns}
               data={loyaltyPointTxn}
               ref={tableRef}
               options={{
                  ...options,
                  placeholder: 'No Loyalty Points Data Available Yet !',
               }}
            />
         )}
      </Flex>
   )
}

export default LoyaltyPointTable
