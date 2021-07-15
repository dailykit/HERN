import React from 'react'
import { toast } from 'react-toastify'
import { Text, Flex } from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'
import { ReactTabulator } from '@dailykit/react-tabulator'

import { ROLES } from '../../../graphql'
import tableOptions from '../tableOption'
import { logger } from '../../../../../shared/utils'
import { useTooltip, useTabs } from '../../../../../shared/providers'
import { InlineLoader, Tooltip, Banner } from '../../../../../shared/components'

const RolesListing = () => {
   const tableRef = React.useRef()
   const { tooltip } = useTooltip()
   const { tab, addTab } = useTabs()
   const { loading, error, data: { roles = [] } = {} } = useSubscription(
      ROLES.LIST
   )

   React.useEffect(() => {
      if (!tab) {
         addTab('Roles', '/settings/roles')
      }
   }, [tab, addTab])

   if (!loading && error) {
      toast.error('Failed to load the users.')
      logger(error)
   }

   const rowClick = (e, cell) => {
      const { id = null, title = '' } = cell.getData() || {}
      if (id) {
         addTab(title, `/settings/roles/${id}`)
      }
   }

   const columns = [
      {
         title: 'Title',
         field: 'title',
         headerFilter: true,
         cssClass: 'cell',
         cellClick: (e, cell) => rowClick(e, cell),
         headerTooltip: column => {
            const identifier = 'role_listing_column_name'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Apps',
         field: 'apps.aggregate.count',
         headerTooltip: column => {
            const identifier = 'role_listing_column_apps'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
   ]

   return (
      <Flex margin="0 auto" width="calc(100% - 32px)" maxWidth="1280px">
         <Banner id="settings-app-roles-listing-top" />

         <Flex
            container
            as="header"
            height="72px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex as="section" container alignItems="center">
               <Text as="h2">Roles ({roles?.aggregate?.count || 0})</Text>
               <Tooltip identifier="roles_list_heading" />
            </Flex>
         </Flex>
         {loading ? (
            <InlineLoader />
         ) : (
            <ReactTabulator
               ref={tableRef}
               columns={columns}
               data={roles.nodes}
               options={{
                  ...tableOptions,
                  placeholder: 'No roles available yet.',
               }}
            />
         )}
         <Banner id="settings-app-roles-listing-bottom" />
      </Flex>
   )
}

export default RolesListing
