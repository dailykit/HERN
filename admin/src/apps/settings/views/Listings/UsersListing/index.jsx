import React from 'react'
import { v4 as uuid } from 'uuid'
import { toast } from 'react-toastify'
import { ReactTabulator } from '@dailykit/react-tabulator'
import { Avatar, Text, Flex, ComboButton } from '@dailykit/ui'
import { useMutation, useSubscription } from '@apollo/react-hooks'

import { USERS } from '../../../graphql'
import tableOptions from '../tableOption'
import { logger } from '../../../../../shared/utils'
import { AddIcon } from '../../../../../shared/assets/icons'
import { useTooltip, useTabs } from '../../../../../shared/providers'
import {
   ErrorState,
   InlineLoader,
   Tooltip,
   Banner,
} from '../../../../../shared/components'

const UsersListing = () => {
   const tableRef = React.useRef()
   const { tooltip } = useTooltip()
   const { tab, addTab } = useTabs()
   const { loading, error, data: { users = {} } = {} } = useSubscription(
      USERS.LIST
   )
   const [createUser, { loading: creatingUser }] = useMutation(USERS.CREATE, {
      onCompleted: ({ insert_settings_user_one = {} }) => {
         const { id, firstName } = insert_settings_user_one
         addTab(firstName, `/settings/users/${id}`)
      },
      onError: error => {
         toast.success('Failed to create the user!')
         logger(error)
      },
   })

   const rowClick = (e, cell) => {
      const { id = null, firstName = '', lastName = '' } = cell.getData() || {}
      if (id) {
         addTab(`${firstName} ${lastName}`, `/settings/users/${id}`)
      }
   }

   const addUser = () => {
      const hash = `user${uuid().split('-')[0]}`
      createUser({
         variables: {
            object: {
               firstName: hash,
               tempPassword: hash.slice(4),
            },
         },
      })
   }

   if (!loading && error) {
      toast.error('Failed to load the users.')
      logger(error)
   }

   const columns = [
      {
         title: 'User',
         field: 'firstName',
         headerFilter: true,
         cssClass: 'cell',
         cellClick: (e, cell) => rowClick(e, cell),
         formatter: cell =>
            `${cell.getData()?.firstName || ''} ${
               cell.getData()?.lastName || ''
            }`,
         headerTooltip: column => {
            const identifier = 'user_listing_column_name'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Email',
         field: 'email',
         headerFilter: true,
         headerTooltip: column => {
            const identifier = 'user_listing_column_email'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Phone No.',
         field: 'phoneNo',
         headerFilter: true,
         hozAlign: 'left',
         headerHozAlign: 'right',
         width: 150,
         headerTooltip: column => {
            const identifier = 'user_listing_column_phone'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
   ]

   React.useEffect(() => {
      if (!tab) {
         addTab('Users', '/settings/users')
      }
   }, [tab, addTab])

   return (
      <Flex margin="0 auto" width="calc(100% - 32px)" maxWidth="1280px">
         <Banner id="settings-app-users-listing-top" />

         <Flex
            container
            as="header"
            height="72px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex as="section" container alignItems="center">
               <Text as="h2">Users ({users?.aggregate?.count || 0})</Text>
               <Tooltip identifier="user_listing_heading" />
            </Flex>
            <ComboButton
               type="solid"
               onClick={addUser}
               isLoading={creatingUser}
            >
               <AddIcon color="#fff" size={24} />
               Add User
            </ComboButton>
         </Flex>
         {loading ? (
            <InlineLoader />
         ) : (
            <>
               {error ? (
                  <ErrorState message="Failed to load the users." />
               ) : (
                  <ReactTabulator
                     ref={tableRef}
                     columns={columns}
                     data={users.nodes}
                     options={{
                        ...tableOptions,
                        placeholder:
                           'No users available yet, start by creating one.',
                     }}
                  />
               )}
            </>
         )}
         <Banner id="settings-app-users-listing-bottom" />
      </Flex>
   )
}

function UserAvatar({
   cell: {
      _cell: {
         row: { data },
      },
   },
}) {
   if (data && data.firstName && data.lastName)
      return <Avatar withName title={`${data.firstName} ${data.lastName}`} />

   return null
}

export default UsersListing
