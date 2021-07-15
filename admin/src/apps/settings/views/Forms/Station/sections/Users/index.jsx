import React from 'react'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { useSubscription, useMutation } from '@apollo/react-hooks'

import {
   Text,
   IconButton,
   PlusIcon,
   TextButton,
   TagGroup,
   Tag,
   List,
   Flex,
   Filler,
   ListSearch,
   ListOptions,
   ListItem,
   Tunnels,
   Tunnel,
   useTunnel,
   useMultiList,
   Spacer,
   ButtonGroup,
   TunnelHeader,
   SectionTab,
   SectionTabs,
   SectionTabList,
   SectionTabPanel,
   SectionTabPanels,
   SectionTabsListHeader,
   Avatar,
} from '@dailykit/ui'

import { STATIONS } from '../../../../../graphql'
import { logger } from '../../../../../../../shared/utils'
import {
   Tooltip,
   InlineLoader,
   ErrorBoundary,
   ErrorState,
   Banner,
} from '../../../../../../../shared/components'

export const Users = ({ station }) => {
   const [isOpen, setIsOpen] = React.useState(false)
   const [tabIndex, setTabIndex] = React.useState(0)
   const [deleteStationUser, { loading: unsassigningUser }] = useMutation(
      STATIONS.USERS.DELETE,
      {
         onCompleted: () => toast.success('Successfully unassigned the user!'),
         onError: error => {
            logger(error)
            toast.error('Failed to unassigned the user!')
         },
      }
   )
   const [
      updateStationUserStatus,
      { loading: updatingUserStatus },
   ] = useMutation(STATIONS.USERS.UPDATE, {
      onCompleted: () => toast.success('Successfully updated the user status!'),
      onError: error => {
         logger(error)
         toast.error('Failed to update the user status!')
      },
   })

   const updateStatus = (keycloakId, status) => {
      updateStationUserStatus({
         variables: {
            stationId: station.id,
            userKeycloakId: keycloakId,
            active: status,
         },
      })
   }

   const deleteUser = id => {
      deleteStationUser({
         variables: {
            stationId: station.id,
            userKeycloakId: id,
         },
      })
   }

   return (
      <>
         <SectionTabs onChange={index => setTabIndex(index)}>
            <SectionTabList>
               <SectionTabsListHeader>
                  <Flex container alignItems="center">
                     <Text as="title">Users</Text>
                     <Tooltip identifier="station_section_user_heading" />
                  </Flex>
                  <IconButton type="outline" onClick={() => setIsOpen(true)}>
                     <PlusIcon />
                  </IconButton>
               </SectionTabsListHeader>
               {station.user.nodes.map((node, index) => (
                  <SectionTab key={node.user.id}>
                     <Spacer size="14px" />
                     <Text
                        as="h3"
                        style={{ ...(index === tabIndex && { color: '#fff' }) }}
                     >
                        {node.user?.firstName} {node.user?.lastName}
                     </Text>
                     <Spacer size="14px" />
                  </SectionTab>
               ))}
            </SectionTabList>
            <SectionTabPanels>
               {station.user.nodes.map(node => (
                  <SectionTabPanel key={node.user.id}>
                     <Flex
                        as="main"
                        container
                        alignItems="center"
                        justifyContent="space-between"
                     >
                        <Flex as="section" container alignItems="center">
                           <Avatar
                              url=""
                              withName
                              title={`${node.user?.firstName || ''} ${
                                 node.user?.lastName || ''
                              }`}
                           />
                           <Spacer size="24px" xAxis />
                           {node.active && <Tag>Active</Tag>}
                        </Flex>
                        <ButtonGroup align="right">
                           <TextButton
                              type="solid"
                              isLoading={updatingUserStatus}
                              onClick={() =>
                                 updateStatus(
                                    node.user.keycloakId,
                                    !node.active
                                 )
                              }
                           >
                              Mark {node.active ? 'Inactive' : 'Active'}
                           </TextButton>
                           <TextButton
                              type="outline"
                              isLoading={unsassigningUser}
                              onClick={() => deleteUser(node.user.keycloakId)}
                           >
                              Unassign
                           </TextButton>
                        </ButtonGroup>
                     </Flex>
                  </SectionTabPanel>
               ))}
            </SectionTabPanels>
         </SectionTabs>
         {isOpen && (
            <ErrorBoundary rootRoute="/apps/settings">
               <AddUserTunnel
                  isOpen={isOpen}
                  station={station.id}
                  setIsOpen={setIsOpen}
               />
            </ErrorBoundary>
         )}
      </>
   )
}

const AddUserTunnel = ({ isOpen, station, setIsOpen }) => {
   const [users, setUsers] = React.useState([])
   const [search, setSearch] = React.useState('')
   const [isLoading, setIsLoading] = React.useState(true)
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [createStationUsers, { loading: assigningUser }] = useMutation(
      STATIONS.USERS.CREATE,
      {
         onCompleted: () => {
            setIsOpen(false)
            toast.success('Successfully assigned the user!')
         },
         onError: () => {
            setIsOpen(false)
            toast.error('Failed to assign the user!')
         },
      }
   )

   const { loading, error } = useSubscription(STATIONS.USERS.LIST, {
      variables: {
         _eq: station,
      },
      onSubscriptionData: ({
         subscriptionData: { data: { settings_user: users = [] } = {} } = {},
      }) => {
         if (!isEmpty(users)) {
            setUsers(
               users.map(({ id, firstName, lastName, keycloakId }) => ({
                  id,
                  keycloakId,
                  title: `${firstName || ''} ${lastName || ''}`,
               }))
            )
         }
         setIsLoading(false)
      },
   })

   const [list, selected, selectOption] = useMultiList(users)

   React.useEffect(() => {
      if (isOpen) {
         openTunnel(1)
      } else {
         closeTunnel(1)
      }
   }, [isOpen])

   if (!loading && error) {
      toast.error('Failed to fetch users!')
      logger(error)
   }

   const handleSubmit = () => {
      createStationUsers({
         variables: {
            objects: selected.map(user => ({
               stationId: station,
               userKeycloakId: user.keycloakId,
            })),
         },
      })
   }

   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel layer={1} size="sm">
            <TunnelHeader
               title="Add User"
               close={() => setIsOpen(false)}
               right={{
                  title: 'Save',
                  action: handleSubmit,
                  isLoading: assigningUser,
                  disabled: selected.length === 0,
               }}
               tooltip={
                  <Tooltip identifier="station_section_user_tunnel_add" />
               }
            />
            <Banner id="settings-app-stations-station-details-add-user-tunnel-top" />
            <Flex padding="0 16px" overflowY="auto" height="calc(100% - 104px)">
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
                                 type="MSL111"
                                 content={{
                                    img: '',
                                    roles: [],
                                    title: option.title,
                                 }}
                                 key={option.id}
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
                  <Filler
                     height="500px"
                     message="No users available to add to station."
                  />
               )}
            </Flex>
            <Banner id="settings-app-stations-station-details-add-user-tunnel-bottom" />
         </Tunnel>
      </Tunnels>
   )
}
