import React from 'react'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { useSubscription, useMutation } from '@apollo/react-hooks'

import {
   Text,
   IconButton,
   PlusIcon,
   TextButton,
   Tag,
   Tunnels,
   Tunnel,
   useTunnel,
   ListItem,
   List,
   ListOptions,
   ListSearch,
   TagGroup,
   useMultiList,
   ButtonGroup,
   TunnelHeader,
   Flex,
   SectionTabs,
   SectionTabList,
   SectionTab,
   SectionTabPanels,
   SectionTabPanel,
   Filler,
   Spacer,
   SectionTabsListHeader,
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

export const Scales = ({ station }) => {
   const [tabIndex, setTabIndex] = React.useState(0)
   const [isOpen, setIsOpen] = React.useState(false)
   const [update, { loading: updatingStatus }] = useMutation(
      STATIONS.SCALES.UPDATE,
      {
         onCompleted: () =>
            toast.success('Successfully update the scale status!'),
         onError: error => {
            logger(error)
            toast.error('Failed to update the scale status!')
         },
      }
   )
   const [remove, { loading: removingScale }] = useMutation(
      STATIONS.SCALES.DELETE,
      {
         onCompleted: () => toast.success('Successfully unassigned the scale!'),
         onError: error => {
            logger(error)
            toast.error('Failed to unassigned the scale!')
         },
      }
   )

   const updateStatus = (num, name, id, status) => {
      update({
         variables: {
            deviceNum: num,
            deviceName: name,
            computerId: id,
            active: status,
         },
      })
   }

   const removeStation = (num, name, id) => {
      remove({
         variables: {
            deviceNum: num,
            deviceName: name,
            computerId: id,
         },
      })
   }

   return (
      <>
         <SectionTabs onChange={index => setTabIndex(index)}>
            <SectionTabList>
               <SectionTabsListHeader>
                  <Flex container alignItems="center">
                     <Text as="title">Scales</Text>
                     <Tooltip identifier="station_section_scales_heading" />
                  </Flex>
                  <IconButton type="outline" onClick={() => setIsOpen(true)}>
                     <PlusIcon />
                  </IconButton>
               </SectionTabsListHeader>
               {station.scale.nodes.map((node, index) => (
                  <SectionTab key={node.deviceNum}>
                     <Spacer size="14px" />
                     <Text
                        as="h3"
                        style={{ ...(index === tabIndex && { color: '#fff' }) }}
                     >
                        {node.deviceName}
                     </Text>
                     <Spacer size="14px" />
                  </SectionTab>
               ))}
            </SectionTabList>
            <SectionTabPanels>
               {station.scale.nodes.map(node => (
                  <SectionTabPanel key={node.deviceNum}>
                     <Flex
                        as="main"
                        container
                        alignItems="center"
                        justifyContent="space-between"
                     >
                        <Flex as="section" container alignItems="center">
                           <Text as="h2">{node.deviceName}</Text>
                           <Spacer size="16px" xAxis />
                           {node.active && <Tag>Active</Tag>}
                        </Flex>
                        <ButtonGroup align="right">
                           <TextButton
                              type="solid"
                              isLoading={updatingStatus}
                              onClick={() =>
                                 updateStatus(
                                    node.deviceNum,
                                    node.deviceName,
                                    node.computer.printNodeId,
                                    !node.active
                                 )
                              }
                           >
                              Mark {node.active ? 'Inactive' : 'Active'}
                           </TextButton>
                           <TextButton
                              type="outline"
                              isLoading={removingScale}
                              onClick={() =>
                                 removeStation(
                                    node.deviceNum,
                                    node.deviceName,
                                    node.computer.printNodeId
                                 )
                              }
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
               <AddPrinterTunnel
                  isOpen={isOpen}
                  station={station.id}
                  setIsOpen={setIsOpen}
               />
            </ErrorBoundary>
         )}
      </>
   )
}

const AddPrinterTunnel = ({ isOpen, setIsOpen, station }) => {
   const [scales, setScales] = React.useState([])
   const [search, setSearch] = React.useState('')
   const [isLoading, setIsLoading] = React.useState(true)
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [list, selected, selectOption] = useMultiList(scales)

   const [create, { loading: assigningScale }] = useMutation(
      STATIONS.SCALES.CREATE,
      {
         onCompleted: () => {
            setIsOpen(false)
            toast.success('Successfully assigned the scale!')
         },
         onError: () => {
            setIsOpen(false)
            toast.error('Failed to assign the scale!')
         },
      }
   )

   const { loading, error } = useSubscription(STATIONS.SCALES.LIST, {
      variables: { stationId: station },
      onSubscriptionData: ({
         subscriptionData: { data: { scales = [] } = {} } = {},
      }) => {
         if (!isEmpty(scales)) {
            setScales(
               scales.map(({ deviceNum, deviceName, computer }) => ({
                  title: deviceName,
                  description: `${computer.name} | ${computer.hostname}`,
                  id: `${deviceNum}-${deviceName}-${computer.printNodeId}`,
               }))
            )
         }
         setIsLoading(false)
      },
   })

   React.useEffect(() => {
      if (isOpen) {
         openTunnel(1)
      } else {
         closeTunnel(1)
      }
   }, [isOpen])

   if (!loading && error) {
      toast.error('Failed to fetch scales!')
      logger(error)
   }

   const insert = async () => {
      await Promise.all(
         selected.map(async scale => {
            await create({
               variables: {
                  deviceNum: Number(scale.id.split('-')[0]),
                  deviceName: scale.id.split('-')[1],
                  computerId: Number(scale.id.split('-')[2]),
                  stationId: station,
               },
            })
         })
      )
      setIsOpen(false)
   }

   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel layer={1} size="sm">
            <TunnelHeader
               title="Add Scales"
               close={() => setIsOpen(false)}
               right={{
                  action: insert,
                  title: 'Save',
                  isLoading: assigningScale,
                  disabled: selected.length === 0,
               }}
               tooltip={
                  <Tooltip identifier="station_section_scale_tunnel_add" />
               }
            />
            <Banner id="settings-app-stations-station-details-add-scale-tunnel-top" />
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
                                 type="MSL2"
                                 key={option.id}
                                 content={{
                                    title: option.title,
                                    description: option.description,
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
                  <Filler
                     height="500px"
                     message="No scales available to add to station."
                  />
               )}
            </Flex>
            <Banner id="settings-app-stations-station-details-add-scale-tunnel-bottom" />
         </Tunnel>
      </Tunnels>
   )
}
