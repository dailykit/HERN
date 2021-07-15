import React from 'react'
import moment from 'moment'
import { toast } from 'react-toastify'
import { useSubscription } from '@apollo/react-hooks'
import { Flex, Text, Spacer, useTunnel } from '@dailykit/ui'
import { ReactTabulator, reactFormatter } from '@dailykit/react-tabulator'

import tableOptions from '../../../../tableOption'
import { logger } from '../../../../../../shared/utils'
import { useTooltip } from '../../../../../../shared/providers'
import { ActivityLogs } from '../../../../../../shared/components'
import { SUBSCRIPTION_OCCURENCES_LIST } from '../../../../graphql'
import {
   Tooltip,
   ErrorState,
   InlineLoader,
} from '../../../../../../shared/components'
import { AddOnProductsTunnel, PlanProductsTunnel } from '../../../../components'

const Occurences = ({ id, setOccurencesTotal }) => {
   const tableRef = React.useRef()
   const { tooltip } = useTooltip()
   const [occurenceId, setOccurenceId] = React.useState(null)
   const [subscriptionId, setSubscriptionId] = React.useState(null)
   const [addOnTunnels, openAddOnTunnel, closeAddOnTunnel] = useTunnel(1)
   const [menuTunnels, openMenuTunnel, closeMenuTunnel] = useTunnel(1)
   const [logTunnels, openLogTunnel, closeLogTunnel] = useTunnel(1)
   const [logOccurenceId, setLogOccurenceId] = React.useState(null)
   const {
      error,
      loading,
      data: { subscription_occurences = {} } = {},
   } = useSubscription(SUBSCRIPTION_OCCURENCES_LIST, {
      variables: { id },
      onSubscriptionData: ({ subscriptionData: { data = {} } = {} }) => {
         const {
            aggregate = {},
         } = data.subscription_occurences?.occurences_aggregate
         setOccurencesTotal(aggregate?.count || 0)
      },
   })

   const editAddOns = (e, { _cell = {} }) => {
      const data = _cell.row.getData()
      setOccurenceId(data.id)
      setSubscriptionId(data.subscription.id)
      openAddOnTunnel(1)
   }

   const editMenu = (e, { _cell = {} }) => {
      const data = _cell.row.getData()
      setOccurenceId(data.id)
      setSubscriptionId(data.subscription.id)
      openMenuTunnel(1)
   }

   const columns = [
      {
         title: 'Fulfillment Date',
         field: 'fulfillmentDate',
         cssClass: 'cell',
         cellClick: (e, cell) => {
            const data = cell.getData()
            if (data?.id) {
               setLogOccurenceId(data?.id)
               openLogTunnel(1)
            }
         },
         formatter: ({ _cell: { value } }) =>
            moment(value).format('MMM DD, YYYY'),
         headerTooltip: column => {
            const identifier = 'listing_occurences_column_fulfillment'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Cut Off Time',
         field: 'cutoffTimeStamp',
         formatter: ({ _cell: { value } }) =>
            moment(value).format('MMM DD, YYYY HH:mm A'),
         headerTooltip: column => {
            const identifier = 'listing_occurences_column_cutoff'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Start Time',
         field: 'startTimeStamp',
         formatter: ({ _cell: { value } }) =>
            moment(value).format('MMM DD, YYYY HH:mm A'),
         headerTooltip: column => {
            const identifier = 'listing_occurences_column_start'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         cssClass: 'cell',
         hozAlign: 'right',
         cellClick: editAddOns,
         title: 'Add On Products',
         formatter: reactFormatter(<AddOnProductsCount />),
         headerTooltip: column => {
            const identifier = 'listing_occurences_column_products'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         cssClass: 'cell',
         hozAlign: 'right',
         cellClick: editMenu,
         title: 'Menu Products',
         formatter: reactFormatter(<ProductsCount />),
         headerTooltip: column => {
            const identifier = 'listing_occurences_column_products'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
   ]

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Failed to fetch the list of occurences!')
      logger(error)
      return <ErrorState message="Failed to fetch the list of occurences!" />
   }
   return (
      <>
         <Flex container alignItems="center">
            <Text as="h3">Occurences</Text>
            <Tooltip identifier="form_subscription_section_delivery_day_section_occurences" />
         </Flex>
         <Spacer size="16px" />
         <ReactTabulator
            ref={tableRef}
            columns={columns}
            options={{
               ...tableOptions,
               layout: 'fitColumns',
               pagination: 'local',
               paginationSize: 10,
            }}
            data={subscription_occurences?.occurences_aggregate?.nodes || []}
         />
         <AddOnProductsTunnel
            occurenceId={occurenceId}
            subscriptionId={subscriptionId}
            tunnel={{ list: addOnTunnels, close: closeAddOnTunnel }}
         />
         <PlanProductsTunnel
            occurenceId={occurenceId}
            subscriptionId={subscriptionId}
            tunnel={{ list: menuTunnels, close: closeMenuTunnel }}
         />
         <ActivityLogs
            tunnels={logTunnels}
            openTunnel={openLogTunnel}
            closeTunnel={closeLogTunnel}
            subscriptionOccurenceId={logOccurenceId}
         />
      </>
   )
}

export default Occurences

const ProductsCount = ({ cell: { _cell } }) => {
   const data = _cell.row.getData()
   return (
      <div>
         <span title="Added to this occurence">
            {data.products.aggregate.count}
         </span>
         /
         <span title="Added to the subscription">
            {data.subscription.products.aggregate.count}
         </span>
      </div>
   )
}

const AddOnProductsCount = ({ cell: { _cell } }) => {
   const data = _cell.row.getData()
   return (
      <div>
         <span title="Added to this occurence">
            {data.addOnProducts.aggregate.count}
         </span>
         /
         <span title="Added to the subscription">
            {data.subscription.addOnProducts.aggregate.count}
         </span>
      </div>
   )
}
