import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import {
   ComboButton,
   Flex,
   IconButton,
   Spacer,
   Text,
   TextButton,
} from '@dailykit/ui'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
   Banner,
   ErrorState,
   InlineLoader,
   Tooltip,
   InsightDashboard,
} from '../../../../../shared/components'
import { ResponsiveFlex } from '../styled'
import { AddIcon, DeleteIcon } from '../../../assets/icons'
import { logger, randomSuffix } from '../../../../../shared/utils'
import { useTooltip, useTabs } from '../../../../../shared/providers'
import {
   CREATE_COLLECTION,
   DELETE_COLLECTION,
   S_COLLECTIONS,
} from '../../../graphql'
import tableOptions from '../tableOption'

const address = 'apps.menu.views.listings.collectionslisting.'

const CollectionsListing = () => {
   const { t } = useTranslation()
   const { tab, addTab } = useTabs()
   const { tooltip } = useTooltip()

   const tableRef = React.useRef()

   // Queries
   const {
      data: { collections = [] } = {},
      loading,
      error,
   } = useSubscription(S_COLLECTIONS)

   React.useEffect(() => {
      if (!tab) {
         addTab('Collections', '/menu/collections')
      }
   }, [tab, addTab])

   // Mutation
   const [createCollection] = useMutation(CREATE_COLLECTION, {
      variables: {
         object: {
            name: `collection-${randomSuffix()}`,
         },
      },
      onCompleted: data => {
         addTab(
            data.createCollection.name,
            `/menu/collections/${data.createCollection.id}`
         )
         toast.success('Collection created!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const [deleteCollection] = useMutation(DELETE_COLLECTION, {
      onCompleted: () => {
         toast.success('Collection deleted!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   // Handler
   const deleteCollectionHandler = collection => {
      if (
         window.confirm(
            `Are you sure you want to delete collection - ${collection.name}?`
         )
      ) {
         deleteCollection({
            variables: {
               id: collection.id,
            },
         })
      }
   }

   const columns = [
      {
         title: t(address.concat('collection name')),
         field: 'name',
         headerFilter: true,
         hozAlign: 'left',
         headerHozAlign: 'left',
         cellClick: (e, cell) => {
            const { name, id } = cell._cell.row.data
            addTab(name, `/menu/collections/${id}`)
         },
         headerTooltip: function (column) {
            const identifier = 'collection_listing_name_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         cssClass: 'colHover',
      },
      {
         title: t(address.concat('categories')),
         field: 'categoriesCount',
         headerFilter: true,
         hozAlign: 'right',
         headerHozAlign: 'right',
         width: 150,
      },
      {
         title: t(address.concat('products')),
         field: 'productsCount',
         headerFilter: true,
         hozAlign: 'right',
         headerHozAlign: 'right',
         width: 150,
      },
      {
         title: t(address.concat('availability')),
         field: 'rrule',
         hozAlign: 'left',
         headerHozAlign: 'left',
      },
      {
         title: 'Actions',
         headerFilter: false,
         headerSort: false,
         hozAlign: 'center',
         formatter: reactFormatter(
            <DeleteCollection onDelete={deleteCollectionHandler} />
         ),
         headerHozAlign: 'center',
         width: 100,
      },
   ]

   if (!loading && error) {
      toast.error('Failed to fetch Collections!')
      logger(error)
      return <ErrorState />
   }

   return (
      <ResponsiveFlex maxWidth="1280px" margin="0 auto">
         <Banner id="menu-app-collections-listing-top" />
         <Flex
            container
            alignItems="center"
            justifyContent="space-between"
            height="72px"
         >
            <Flex container alignItems="center">
               <Text as="h2">Collections({collections.length})</Text>
               <Tooltip identifier="collections_list_heading" />
            </Flex>
         </Flex>
         <Flex container alignItems="center" justifyContent="space-between">
            <TextButton
               type="outline"
               onClick={() => tableRef.current.table.clearHeaderFilter()}
            >
               Clear Filters
            </TextButton>
            <ComboButton type="solid" onClick={createCollection}>
               <AddIcon color="#fff" size={24} /> Create Collection
            </ComboButton>
         </Flex>
         <Spacer size="16px" />
         {loading ? (
            <InlineLoader />
         ) : (
            <ReactTabulator
               ref={tableRef}
               columns={columns}
               data={collections}
               options={tableOptions}
            />
         )}
         <InsightDashboard
            appTitle="Menu App"
            moduleTitle="Collection Listing"
            showInTunnel={false}
         />
         <Banner id="menu-app-collections-listing-bottom" />
      </ResponsiveFlex>
   )
}

function DeleteCollection({ cell, onDelete }) {
   const collection = cell.getData()

   return (
      <IconButton type="ghost" onClick={() => onDelete(collection)}>
         <DeleteIcon color="#FF5A52" />
      </IconButton>
   )
}

export default CollectionsListing
