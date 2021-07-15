import React from 'react'
import { toast } from 'react-toastify'
import { Flex, Text, Spacer } from '@dailykit/ui'
import { useQuery, useSubscription } from '@apollo/react-hooks'
import { ReactTabulator, reactFormatter } from '@dailykit/react-tabulator'

import tableOptions from '../../../../tableOption'
import { logger } from '../../../../../../shared/utils'
import { SUBSCRIPTION_CUSTOMERS } from '../../../../graphql'
import { useTooltip } from '../../../../../../shared/providers'
import {
   Tooltip,
   ErrorState,
   InlineLoader,
} from '../../../../../../shared/components'

const Customers = ({ id, setCustomersTotal }) => {
   const tableRef = React.useRef()
   const { tooltip } = useTooltip()
   const {
      error,
      loading,
      data: { subscription_customers = {} } = {},
   } = useQuery(SUBSCRIPTION_CUSTOMERS, {
      variables: { id },
      onCompleted: ({ subscription_customers = {} }) => {
         setCustomersTotal(subscription_customers.customers.aggregate.count)
      },
   })
   const columns = [
      {
         frozen: true,
         title: 'Email',
         field: 'customer.email',
         headerFilter: true,
         headerFilterPlaceholder: 'Search by email...',
         headerTooltip: column => {
            const identifier = 'listing_customers_column_email'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Name',
         headerFilter: true,
         headerFilterPlaceholder: 'Search by names...',
         formatter: reactFormatter(<CustomerName />),
         headerTooltip: column => {
            const identifier = 'listing_customers_column_name'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Phone Number',
         headerFilter: true,
         field: 'customer.platform_customer.phoneNumber',
         headerFilterPlaceholder: 'Search by phone numbers...',
         headerTooltip: column => {
            const identifier = 'listing_customers_column_phone'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Subscription Cancelled',
         field: 'isSubscriptionCancelled',
         formatter: 'tickCross',
         headerTooltip: column => {
            const identifier =
               'listing_customers_column_isSubscriptionCancelled'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Pause Period',
         formatter: ({ _cell }) => {
            const { pausePeriod = {} } = _cell.row.getData()
            if (Object.keys(pausePeriod || {}).length > 0) {
               return `${pausePeriod?.startDate} - ${pausePeriod?.endDate}`
            } else {
               return 'N/A'
            }
         },
         headerTooltip: column => {
            const identifier = 'listing_customers_column_pause_period'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },

      {
         title: 'Brand',
         field: 'brand.title',
         headerTooltip: column => {
            const identifier = 'listing_customers_column_brand'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
   ]

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Failed to fetch the list of customers!')
      logger(error)
      return <ErrorState message="Failed to fetch the list of customers!" />
   }
   return (
      <>
         <Flex container alignItems="center">
            <Text as="h3">Customers</Text>
            <Tooltip identifier="form_subscription_section_delivery_day_section_customers" />
         </Flex>
         <Spacer size="16px" />
         <ReactTabulator
            ref={tableRef}
            columns={columns}
            data={subscription_customers.customers.nodes}
            options={{
               ...tableOptions,
               layout: 'fitColumns',
               pagination: 'local',
               paginationSize: 10,
               groupBy: 'brand.title',
            }}
         />
      </>
   )
}

export default Customers

const CustomerName = ({ cell: { _cell } }) => {
   const data = _cell.row.getData()

   if (!data.customer?.platform_customer?.firstName) return 'N/A'
   return (
      <div>
         {data.customer?.platform_customer?.firstName}{' '}
         {data.customer?.platform_customer?.lastName}
      </div>
   )
}
