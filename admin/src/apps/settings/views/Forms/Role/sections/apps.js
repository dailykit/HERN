import React from 'react'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { isEmpty, uniqBy } from 'lodash'
import { useQuery } from '@apollo/react-hooks'

// Components
import {
   TextButton,
   Tunnels,
   Tunnel,
   useTunnel,
   useMultiList,
   ListItem,
   List,
   ListOptions,
   ListSearch,
   Avatar,
   TunnelHeader,
   TagGroup,
   Tag,
   Filler,
} from '@dailykit/ui'

import { StyledAppItem } from './styled'
import { ROLES } from '../../../../graphql'
import { PermissionsTunnel } from './permissions'
import {
   Flex,
   Tooltip,
   ErrorState,
   InlineLoader,
   Banner,
} from '../../../../../../shared/components'
import { logger } from '../../../../../../shared/utils'

export const Apps = ({ apps }) => {
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [selectedApp, setSelectedApp] = React.useState(null)

   const selectApp = app => {
      setSelectedApp(app)
      openTunnel(1)
   }

   return (
      <>
         {apps.map(({ app }) => (
            <StyledAppItem key={app.id}>
               <Avatar url="" withName type="round" title={app.title} />
               <TextButton type="ghost" onClick={() => selectApp(app)}>
                  Manage Permissions
               </TextButton>
            </StyledAppItem>
         ))}
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="sm">
               <PermissionsTunnel
                  app={selectedApp}
                  setApp={setSelectedApp}
                  closeTunnel={closeTunnel}
               />
            </Tunnel>
         </Tunnels>
      </>
   )
}

export const AppsTunnel = ({ closeTunnel, selectedApps }) => {
   const params = useParams()
   const [apps, setApps] = React.useState([])
   const [search, setSearch] = React.useState('')
   const [isLoading, setIsLoading] = React.useState(true)
   const { error, loading } = useQuery(ROLES.APPS, {
      variables: {
         roleId: {
            _eq: params.id,
         },
      },
      onCompleted: ({ apps: list = [] } = {}) => {
         if (!isEmpty(list)) {
            setApps(list.map(node => ({ ...node, icon: '' })))
         }
         setIsLoading(false)
      },
   })
   const [list, selected, selectOption] = useMultiList(apps)

   if (!loading && error) {
      toast.error('Failed to fetch users')
      logger(error)
      setIsLoading(false)
   }

   const save = () => {
      closeTunnel(1)
      selectedApps(value =>
         uniqBy([...value, ...selected.map(node => ({ app: node }))], 'app.id')
      )
   }

   return (
      <>
         <TunnelHeader
            title="Add Apps"
            close={() => closeTunnel(1)}
            right={{ ...(list.length > 0 && { action: save, title: 'Save' }) }}
            tooltip={
               <Tooltip identifier="form_role_section_apps_tunnel_heading" />
            }
         />
         <Banner id="settings-app-roles-role-details-add-apps-tunnel-top" />
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
                              type="MSL1101"
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
               <Filler message="No apps yet!" />
            )}
         </Flex>
         <Banner id="settings-app-roles-role-details-add-apps-tunnel-bottom" />
      </>
   )
}
