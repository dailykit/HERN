import React from 'react'
import { v4 as uuid } from 'uuid'
import { toast } from 'react-toastify'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { ComboButton, Text, Flex, IconButton } from '@dailykit/ui'

import tableOptions from '../tableOption'
import { STATIONS } from '../../../graphql'
import { logger } from '../../../../../shared/utils'
import { useTooltip, useTabs } from '../../../../../shared/providers'
import { InlineLoader, Tooltip, Banner } from '../../../../../shared/components'
import { AddIcon, DeleteIcon } from '../../../../../shared/assets/icons'

const StationsListing = () => {
   const { tooltip } = useTooltip()
   const tableRef = React.useRef()
   const { tab, addTab } = useTabs()
   const { error, loading, data: { stations = {} } = {} } = useSubscription(
      STATIONS.LIST
   )
   const [create, { loading: creatingStation }] = useMutation(STATIONS.CREATE, {
      onCompleted: ({ insertStation = {} }) => {
         addTab(insertStation.name, `/settings/stations/${insertStation.id}`)
      },
      onError: error => {
         toast.success('Failed to create the station!')
         logger(error)
      },
   })
   const [remove] = useMutation(STATIONS.DELETE, {
      onCompleted: () => {
         toast.success('Successfully deleted the station!')
      },
      onError: error => {
         toast.success('Failed to delete the station!')
         logger(error)
      },
   })

   const rowClick = (e, cell) => {
      const { id = null, name = '' } = cell.getData() || {}
      if (id) {
         addTab(name, `/settings/stations/${id}`)
      }
   }

   if (!loading && error) {
      toast.error('Failed to load the stations.')
      logger(error)
   }

   const columns = [
      {
         title: 'Name',
         field: 'name',
         headerFilter: true,
         cssClass: 'cell',
         cellClick: (e, cell) => rowClick(e, cell),
         headerTooltip: column => {
            const identifier = 'station_listing_column_name'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         width: 150,
         title: 'Actions',
         headerFilter: false,
         headerSort: false,
         hozAlign: 'center',
         cssClass: 'center-text',
         formatter: reactFormatter(<Delete remove={remove} />),
      },
   ]

   React.useEffect(() => {
      if (!tab) {
         addTab('Stations', `/settings/stations`)
      }
   }, [tab, addTab])

   return (
      <Flex margin="0 auto" width="calc(100% - 32px)" maxWidth="1280px">
         <Banner id="settings-app-stations-listing-top" />

         <Flex
            container
            as="header"
            height="72px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex as="section" container alignItems="center">
               <Text as="h2">Stations ({stations?.aggregate?.count || 0})</Text>
               <Tooltip identifier="station_listing_heading" />
            </Flex>
            <ComboButton
               type="solid"
               isLoading={creatingStation}
               onClick={() =>
                  create({
                     variables: {
                        object: {
                           name: `stations${uuid().split('-')[0]}`,
                        },
                     },
                  })
               }
            >
               <AddIcon color="#fff" size={24} />
               Create Station
            </ComboButton>
         </Flex>
         {loading ? (
            <InlineLoader />
         ) : (
            <ReactTabulator
               ref={tableRef}
               columns={columns}
               data={stations.nodes}
               options={{
                  ...tableOptions,
                  placeholder:
                     'No stations available yet, start by creating one.',
               }}
            />
         )}
         <Banner id="settings-app-stations-listing-bottom" />
      </Flex>
   )
}

export default StationsListing

const Delete = ({ cell, remove }) => {
   const removeItem = () => {
      const { id = null, name = '' } = cell._cell.row.data
      if (window.confirm(`Are your sure you want to delete ${name} station?`)) {
         remove({ variables: { id } })
      }
   }

   return (
      <IconButton size="sm" type="ghost" onClick={removeItem}>
         <DeleteIcon color="#FF5A52" />
      </IconButton>
   )
}
