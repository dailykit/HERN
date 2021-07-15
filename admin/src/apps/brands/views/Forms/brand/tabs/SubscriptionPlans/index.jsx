import React from 'react'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { Text, Spacer, Form } from '@dailykit/ui'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'

import tableOptions from '../../../../../tableOption'
import { BRANDS, PLANS } from '../../../../../graphql'
import {
   Flex,
   InlineLoader,
   Tooltip,
} from '../../../../../../../shared/components'
import { useTooltip } from '../../../../../../../shared/providers'
import { logger } from '../../../../../../../shared/utils'

export const SubscriptionPlans = () => {
   const { tooltip } = useTooltip()
   const params = useParams()
   const tableRef = React.useRef()
   const [plans, setPlans] = React.useState({})
   const [updateBrandCollection] = useMutation(BRANDS.UPSERT_BRAND_TITLE, {
      onCompleted: () => toast.success('Successfully updated!'),
      onError: error => {
         toast.error('Failed to update, please try again!')
         logger(error)
      },
   })
   const { loading, error } = useSubscription(PLANS.LIST, {
      variables: {
         brandId: {
            _eq: params.id,
         },
      },
      onSubscriptionData: ({
         subscriptionData: { data: { titles = {} } = {} } = {},
      }) => {
         const transform = node => ({
            ...node,
            totalBrands: node.totalBrands.aggregate.count,
            isActive: isEmpty(node.brands) ? false : node.brands[0].isActive,
         })

         setPlans({ ...titles, nodes: titles.nodes.map(transform) })
      },
   })

   const toggleStatus = ({ id, isActive }) => {
      updateBrandCollection({
         variables: {
            object: {
               isActive,
               brandId: params.id,
               subscriptionTitleId: id,
            },
         },
      })
   }

   const columns = React.useMemo(
      () => [
         {
            title: 'Title',
            field: 'title',
            headerFilter: true,
            headerTooltip: function (column) {
               const identifier = 'subscriptionPlans_listing_title_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            headerFilter: true,
            title: 'Total Brands',
            field: 'totalBrands',
            hozAlign: 'right',
            headerHozAlign: 'right',
            width: 200,
            headerTooltip: function (column) {
               const identifier = 'subscriptionPlans_listing_totalBrand_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            title: 'Published',
            field: 'isActive',
            hozAlign: 'center',
            headerHozAlign: 'center',
            headerSort: false,
            formatter: reactFormatter(<ToggleStatus update={toggleStatus} />),
            width: 150,
            headerTooltip: function (column) {
               const identifier = 'subscriptionPlans_listing_published_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
      ],
      [toggleStatus]
   )

   if (error) {
      toast.error('Something went wrong!')
      logger(error)
   }

   return (
      <Flex padding="16px">
         <Flex container alignItems="center">
            <Text as="h2">
               Subscription Plans ({plans?.aggregate?.count || 0})
            </Text>
            <Tooltip identifier="brands_subscriptionPlans_listing_heading" />
         </Flex>
         <Spacer size="24px" />
         {loading ? (
            <InlineLoader />
         ) : (
            <>
               {plans?.aggregate?.count > 0 && (
                  <ReactTabulator
                     ref={tableRef}
                     columns={columns}
                     options={{
                        ...tableOptions,
                        placeholder: 'No Subscription Plans Available Yet !',
                     }}
                     data={plans?.nodes || []}
                  />
               )}
            </>
         )}
      </Flex>
   )
}

const ToggleStatus = ({ update, cell }) => {
   const [checked, setChecked] = React.useState(cell.getData().isActive)

   React.useEffect(() => {
      if (checked !== cell.getData().isActive) {
         update({
            id: cell.getData().id,
            isActive: checked,
         })
      }
   }, [checked, update, cell])

   return (
      <Form.Toggle
         name={`brandSubscription-${cell.getData().id}`}
         onChange={() => setChecked(!checked)}
         value={checked}
      />
   )
}
