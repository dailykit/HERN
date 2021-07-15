import React from 'react'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { useSubscription, useMutation } from '@apollo/react-hooks'

import {
   Text,
   Filler,
   PlusIcon,
   IconButton,
   TextButton,
   Tag,
   Tunnels,
   Tunnel,
   useTunnel,
   Flex,
   ListItem,
   List,
   ListOptions,
   ListSearch,
   TagGroup,
   useMultiList,
   ButtonGroup,
   TunnelHeader,
   SectionTabs,
   SectionTabList,
   SectionTab,
   SectionTabPanels,
   SectionTabPanel,
   SectionTabsListHeader,
   Spacer,
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

export const LabelPrinters = ({ station }) => {
   const [tabIndex, setTabIndex] = React.useState(0)
   const [isOpen, setIsOpen] = React.useState(false)
   const [update, { loading: updatingStatus }] = useMutation(
      STATIONS.LABEL_PRINTERS.UPDATE,
      {
         onCompleted: () =>
            toast.success('Successfully updated label printer!'),
         onError: error => {
            logger(error)
            toast.error('Failed to update the label printer!')
         },
      }
   )
   const [remove, { loading: removingPrinter }] = useMutation(
      STATIONS.LABEL_PRINTERS.DELETE,
      {
         onCompleted: () =>
            toast.success('Successfully deleted label printer!'),
         onError: error => {
            logger(error)
            toast.error('Failed to remove the label printer!')
         },
      }
   )
   const [updateDefault, { loading: makingDefault }] = useMutation(
      STATIONS.UPDATE,
      {
         onCompleted: () => toast.success('Selected printer is now default!'),
         onError: error => {
            logger(error)
            toast.error('Failed to set printer as default!')
         },
      }
   )

   const updateLabelPrinterStatus = (id, status) => {
      update({
         variables: {
            printNodeId: id,
            stationId: station.id,
            active: status,
         },
      })
   }

   const deleteStationLabelPrinter = id => {
      remove({
         variables: {
            stationId: station.id,
            printNodeId: id,
         },
      })
   }

   return (
      <>
         <SectionTabs onChange={index => setTabIndex(index)}>
            <SectionTabList>
               <SectionTabsListHeader>
                  <Flex container alignItems="center">
                     <Text as="title">Label Printers</Text>
                     <Tooltip identifier="station_section_label_printers_heading" />
                  </Flex>
                  <IconButton type="outline" onClick={() => setIsOpen(true)}>
                     <PlusIcon />
                  </IconButton>
               </SectionTabsListHeader>
               {station.labelPrinter.nodes.map((node, index) => (
                  <SectionTab key={node.labelPrinter.printNodeId}>
                     <Spacer size="14px" />
                     <Text
                        as="h3"
                        style={{ ...(index === tabIndex && { color: '#fff' }) }}
                     >
                        {node.labelPrinter.name}
                     </Text>
                     <Spacer size="14px" />
                  </SectionTab>
               ))}
            </SectionTabList>
            <SectionTabPanels>
               {station.labelPrinter.nodes.map(node => (
                  <SectionTabPanel key={node.labelPrinter.printNodeId}>
                     <Flex
                        as="main"
                        container
                        alignItems="center"
                        justifyContent="space-between"
                     >
                        <Flex as="section" container alignItems="center">
                           <Text as="h2">{node.labelPrinter.name}</Text>
                           <Spacer size="16px" xAxis />
                           {node.active && <Tag>Active</Tag>}
                        </Flex>
                        <ButtonGroup align="right">
                           <TextButton
                              type="solid"
                              isLoading={updatingStatus}
                              onClick={() =>
                                 updateLabelPrinterStatus(
                                    node.labelPrinter.printNodeId,
                                    !node.active
                                 )
                              }
                           >
                              Mark {node.active ? 'Inactive' : 'Active'}
                           </TextButton>
                           {station.defaultLabelPrinterId !==
                              node.labelPrinter.printNodeId && (
                              <TextButton
                                 type="outline"
                                 isLoading={makingDefault}
                                 onClick={() =>
                                    updateDefault({
                                       variables: {
                                          pk_columns: { id: station.id },
                                          _set: {
                                             defaultLabelPrinterId:
                                                node.labelPrinter.printNodeId,
                                          },
                                       },
                                    })
                                 }
                              >
                                 Make Default
                              </TextButton>
                           )}
                           <TextButton
                              type="outline"
                              isLoading={removingPrinter}
                              onClick={() =>
                                 deleteStationLabelPrinter(
                                    node.labelPrinter.printNodeId
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
   const [search, setSearch] = React.useState('')
   const [printers, setPrinters] = React.useState([])
   const [isLoading, setIsLoading] = React.useState(true)
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [list, selected, selectOption] = useMultiList(printers)

   const [create, { loading: assigningPrinter }] = useMutation(
      STATIONS.LABEL_PRINTERS.CREATE,
      {
         onCompleted: () => {
            setIsOpen(false)
            toast.success('Successfully assigned the label printer!')
         },
         onError: () => {
            setIsOpen(false)
            toast.error('Failed to assign the label printer!')
         },
      }
   )

   const { loading, error } = useSubscription(STATIONS.LABEL_PRINTERS.LIST, {
      variables: {
         // type: 'LABEL_PRINTER',
         stationId: station,
      },
      onSubscriptionData: ({
         subscriptionData: { data: { labelPrinters = [] } = {} } = {},
      }) => {
         if (!isEmpty(labelPrinters)) {
            setPrinters(
               labelPrinters.map(({ printNodeId, name, computer }) => ({
                  id: printNodeId,
                  title: name,
                  description: `${computer.name} | ${computer.hostname}`,
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
      toast.error('Failed to fetch label printers!')
      logger(error)
   }

   const insert = () => {
      create({
         variables: {
            objects: selected.map(printer => ({
               stationId: station,
               printNodeId: printer.id,
            })),
         },
      })
   }

   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel layer={1} size="sm">
            <TunnelHeader
               title="Add Printer"
               close={() => setIsOpen(false)}
               right={{
                  action: insert,
                  title: 'Save',
                  isLoading: assigningPrinter,
                  disabled: selected.length === 0,
               }}
               tooltip={
                  <Tooltip identifier="station_section_label_printer_tunnel_add" />
               }
            />

            <Banner id="settings-app-stations-station-details-add-label-printer-tunnel-top" />
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
                     message="No printers available to add to station."
                  />
               )}
            </Flex>
            <Banner id="settings-app-stations-station-details-add-label-printer-tunnel-bottom" />
         </Tunnel>
      </Tunnels>
   )
}
