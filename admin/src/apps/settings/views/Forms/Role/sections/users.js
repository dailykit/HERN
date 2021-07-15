import React from 'react'
import { toast } from 'react-toastify'
import { isEmpty, uniqBy } from 'lodash'
import { useParams } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'

// Components
import {
   useMultiList,
   ListItem,
   List,
   ListOptions,
   ListSearch,
   Avatar,
   TunnelHeader,
   TagGroup,
   Tag,
   Flex,
   Filler,
} from '@dailykit/ui'

import { ROLES } from '../../../../graphql'
import {
   Banner,
   ErrorState,
   InlineLoader,
   Tooltip,
} from '../../../../../../shared/components'
import { logger } from '../../../../../../shared/utils'

export const Users = ({ users }) => {
   return (
      <ul>
         {users.map(({ user }) => (
            <li
               key={user.id}
               style={{ marginBottom: '16px', listStyle: 'none' }}
            >
               <Avatar withName url="" title={user.title} />
            </li>
         ))}
      </ul>
   )
}

export const UsersTunnel = ({ closeTunnel, selectedUsers }) => {
   const params = useParams()
   const [users, setUsers] = React.useState([])
   const [search, setSearch] = React.useState('')
   const [isLoading, setIsLoading] = React.useState(true)
   const { error, loading } = useQuery(ROLES.USERS, {
      variables: {
         roleId: {
            _eq: params.id,
         },
      },
      onCompleted: ({ users: list = [] } = {}) => {
         if (!isEmpty(list)) {
            setUsers(
               list.map(node => ({
                  id: node.keycloakId,
                  title: node.firstName + ' ' + node.lastName,
                  description: node.email,
               }))
            )
         }
         setIsLoading(false)
      },
   })
   const [list, selected, selectOption] = useMultiList(users)

   if (!loading && error) {
      toast.error('Failed to fetch users')
      logger(error)
      setIsLoading(false)
   }

   const save = () => {
      closeTunnel(1)
      selectedUsers(value =>
         uniqBy(
            [...value, ...selected.map(node => ({ user: node }))],
            'user.id'
         )
      )
   }

   return (
      <>
         <TunnelHeader
            title="Add Users"
            close={() => closeTunnel(1)}
            right={{ action: save, title: 'Save' }}
            tooltip={<Tooltip identifier="form_role_tunnel_users_heading" />}
         />
         <Banner id="settings-app-roles-role-details-add-users-tunnel-top" />

         <Flex padding="16px">
            {isLoading && <InlineLoader />}
            {!isLoading && error && <ErrorState />}
            {!isLoading && list.length > 0 && (
               <List>
                  <ListSearch
                     onChange={value => setSearch(value)}
                     placeholder="type what you’re looking for..."
                  />
                  {selected.length > 0 && (
                     <TagGroup style={{ margin: '8px 0' }}>
                        {selected.map(option => (
                           <Tag
                              key={option.id}
                              title={option.title}
                              onClick={() => selectOption('id', option.id)}
                           >
                              {option.title}
                           </Tag>
                        ))}
                     </TagGroup>
                  )}
                  <ListOptions>
                     {list
                        .filter(option =>
                           option.title.toLowerCase().includes(search)
                        )
                        .map(option => (
                           <ListItem
                              type="MSL2"
                              key={option.id}
                              content={{
                                 icon: option.icon,
                                 title: option.title,
                              }}
                              onClick={() => selectOption('id', option.id)}
                              isActive={selected.find(
                                 item => item.id === option.id
                              )}
                           />
                        ))}
                  </ListOptions>
               </List>
            )}
            {!isLoading && list.length === 0 && (
               <Filler message="No users yet!" />
            )}
         </Flex>
         <Banner id="settings-app-roles-role-details-add-users-tunnel-bottom" />
      </>
   )
}
