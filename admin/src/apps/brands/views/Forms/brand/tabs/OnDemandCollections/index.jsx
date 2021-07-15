import React from 'react'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { Text, Spacer, Form } from '@dailykit/ui'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'

import tableOptions from '../../../../../tableOption'
import { BRANDS, COLLECTIONS } from '../../../../../graphql'
import {
   Flex,
   InlineLoader,
   Tooltip,
} from '../../../../../../../shared/components'
import { useTooltip } from '../../../../../../../shared/providers'
import { logger } from '../../../../../../../shared/utils'

export const OnDemandCollections = () => {
   const { tooltip } = useTooltip()
   const params = useParams()
   const tableRef = React.useRef()
   const [collections, setCollections] = React.useState({})
   const [updateBrandCollection] = useMutation(BRANDS.UPSERT_BRAND_COLLECTION, {
      onCompleted: () => toast.success('Successfully updated!'),
      onError: error => {
         toast.error('Failed to update, please try again!')
         logger(error)
      },
   })
   const { loading, error } = useSubscription(COLLECTIONS.LIST, {
      variables: {
         brandId: {
            _eq: params.id,
         },
      },
      onSubscriptionData: ({
         subscriptionData: { data: { collections: list = {} } = {} } = {},
      }) => {
         const transform = node => ({
            ...node,
            endTime: node.endTime || 'N/A',
            rrule: node.rrule?.text || 'N/A',
            startTime: node.startTime || 'N/A',
            totalBrands: node.totalBrands.aggregate.count,
            isActive: isEmpty(node.brands) ? false : node.brands[0].isActive,
         })

         setCollections({ ...list, nodes: list.nodes.map(transform) })
      },
   })

   if (error) {
      toast.error('Something went wrong!')
      logger(error)
   }

   const toggleStatus = ({ id, isActive }) => {
      updateBrandCollection({
         variables: {
            object: {
               isActive,
               collectionId: id,
               brandId: params.id,
            },
         },
      })
   }

   const columns = React.useMemo(
      () => [
         {
            title: 'Name',
            field: 'name',
            headerFilter: true,
            headerTooltip: function (column) {
               const identifier = 'collections_listing_name_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            title: 'Start Time',
            field: 'startTime',
            headerTooltip: function (column) {
               const identifier = 'collections_listing_startTime_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            title: 'End Time',
            field: 'endTime',
            headerTooltip: function (column) {
               const identifier = 'collections_listing_endTime_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            title: 'Availability',
            field: 'rrule',
            headerTooltip: function (column) {
               const identifier = 'collections_listing_availability_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            headerFilter: true,
            title: 'Total Categories',
            field: 'details.categoriesCount',
            hozAlign: 'right',
            headerHozAlign: 'right',
            headerTooltip: function (column) {
               const identifier = 'collections_listing_categories_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            headerFilter: true,
            title: 'Total Products',
            field: 'details.productsCount',
            hozAlign: 'right',
            headerHozAlign: 'right',
            headerTooltip: function (column) {
               const identifier = 'collections_listing_products_column'
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
            headerTooltip: function (column) {
               const identifier = 'collections_listing_brands_column'
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
            width: 100,
            headerTooltip: function (column) {
               const identifier = 'collections_listing_published_column'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
      ],
      [toggleStatus]
   )

   return (
      <Flex padding="16px">
         <Flex container alignItems="center">
            <Text as="h2">
               Collections ({collections?.aggregate?.count || 0})
            </Text>
            <Tooltip identifier="brands_collection_listing_heading" />
         </Flex>
         <Spacer size="24px" />
         {loading ? (
            <InlineLoader />
         ) : (
            <>
               {collections?.aggregate?.count > 0 && (
                  <ReactTabulator
                     ref={tableRef}
                     columns={columns}
                     options={{
                        ...tableOptions,
                        placeholder: 'No Collection Available Yet !',
                     }}
                     data={collections?.nodes || []}
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
   }, [checked])

   return (
      <Form.Toggle
         name={`brandOnDemand-${cell.getData().id}`}
         onChange={() => setChecked(!checked)}
         value={checked}
      />
   )
}
