import { useSubscription } from '@apollo/react-hooks'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import {
   Flex,
   HorizontalTab,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
   HorizontalTabs,
} from '@dailykit/ui'
import React from 'react'
import { v4 as uuid } from 'uuid'
import {
   ErrorState,
   InlineLoader,
   Tooltip,
} from '../../../../../shared/components'
import { useTooltip, useTabs } from '../../../../../shared/providers'
import { logger } from '../../../../../shared/utils'
import { dateFmt } from '../../../../../shared/utils/dateFmt'
import { BULK_WORK_ORDERS_SUBSCRIPTION } from '../../../graphql'
import tableOptions from '../tableOption'
import './../tableStyle.css'

export default function BulkWorkOrders() {
   const {
      data: { bulkWorkOrders = [] } = {},
      loading,
      error,
   } = useSubscription(BULK_WORK_ORDERS_SUBSCRIPTION)
   const { addTab } = useTabs()
   const { tooltip } = useTooltip()

   if (loading) return <InlineLoader />
   if (error) {
      logger(error)
      return <ErrorState />
   }

   const openForm = (_, cell) => {
      const { id, name } = cell.getData()
      const altName = `Work Order-${uuid().substring(30)}`

      addTab(name || altName, `/inventory/work-orders/bulk/${id}`)
   }

   const columns = [
      {
         title: 'Id',
         field: 'id',
         frozen: true,
         headerFilter: false,
         cellClick: openForm,
         cssClass: 'RowClick',
         headerTooltip: col => {
            const identifier = 'work-orders_listings_table_id'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
         width: 80,
      },
      {
         title: 'Scheduled On',
         field: 'scheduledOn',
         headerFilter: false,
         frozen: true,
         width: 350,
         cellClick: openForm,
         cssClass: 'RowClick',
         formatter: reactFormatter(<ShowDate />),
         hozAlign: 'left',
         headerHozAlign: 'left',
         headerTooltip: col => {
            const identifier = 'work-orders_listings_table_scheduledOn'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
      {
         title: 'User Assigned',
         field: 'user.firstName',
         headerFilter: true,
         hozAlign: 'left',
         headerHozAlign: 'left',
         headerTooltip: col => {
            const identifier = 'work-orders_listings_table_user_assigned'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
      {
         title: 'Station Assigned',
         field: 'station.name',
         headerFilter: true,
         hozAlign: 'left',
         headerHozAlign: 'left',
         headerTooltip: col => {
            const identifier = 'work-orders_listings_table_station_assigned'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
   ]

   return (
      <>
         <HorizontalTabs>
            <HorizontalTabList>
               <HorizontalTab>
                  <Flex container alignItems="center">
                     COMPLETED
                     <Tooltip identifier="work-orders-listings_COMPLETED_tab" />
                  </Flex>
               </HorizontalTab>
               <HorizontalTab>
                  <Flex container alignItems="center">
                     PENDING
                     <Tooltip identifier="work-orders-listings_PENDING_tab" />
                  </Flex>
               </HorizontalTab>
               <HorizontalTab>
                  <Flex container alignItems="center">
                     CANCELLED
                     <Tooltip identifier="work-orders-listings_CANCELLED_tab" />
                  </Flex>
               </HorizontalTab>
               <HorizontalTab>
                  <Flex container alignItems="center">
                     UNPUBLISHED
                     <Tooltip identifier="work-orders-listings_UNPUBLISHED_tab" />
                  </Flex>
               </HorizontalTab>
            </HorizontalTabList>
            <HorizontalTabPanels>
               <HorizontalTabPanel>
                  <ReactTabulator
                     columns={columns}
                     data={bulkWorkOrders.filter(
                        col => col.status === 'COMPLETED'
                     )}
                     options={tableOptions}
                  />
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <ReactTabulator
                     columns={columns}
                     data={bulkWorkOrders.filter(
                        col => col.status === 'PENDING'
                     )}
                     options={tableOptions}
                  />
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <ReactTabulator
                     columns={columns}
                     data={bulkWorkOrders.filter(
                        col => col.status === 'CANCELLED'
                     )}
                     options={tableOptions}
                  />
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <ReactTabulator
                     columns={columns}
                     data={bulkWorkOrders.filter(
                        col => col.status === 'UNPUBLISHED'
                     )}
                     options={tableOptions}
                  />
               </HorizontalTabPanel>
            </HorizontalTabPanels>
         </HorizontalTabs>
      </>
   )
}

function ShowDate({
   cell: {
      _cell: { value },
   },
}) {
   return <>{dateFmt.format(new Date(value))}</>
}
