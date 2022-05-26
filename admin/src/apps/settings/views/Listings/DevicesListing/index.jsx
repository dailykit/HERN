import React from 'react'
import { isEmpty } from 'lodash'
import styled from 'styled-components'
import { toast } from 'react-toastify'
import { useSubscription, useQuery, useMutation } from '@apollo/react-hooks'

// Components
import {
   Form,
   Table,
   TableHead,
   TableBody,
   TableRow,
   TableCell,
   Text,
   Tag,
   ComboButton,
   Tunnels,
   Tunnel,
   useTunnel,
   TunnelHeader,
   Spacer,
   List,
   useSingleList,
   ListItem,
   ListOptions,
   ListSearch,
   Flex,
   Filler,
} from '@dailykit/ui'

import { logger } from '../../../../../shared/utils'
import { DEVICES, PRINT_JOB } from '../../../graphql'
import { useTabs } from '../../../../../shared/providers'
import { PrinterIcon } from '../../../../../shared/assets/icons'
import { InlineLoader, Tooltip, Banner } from '../../../../../shared/components'

const DevicesListing = () => {
   const { tab, addTab } = useTabs()
   const [scales, setScales] = React.useState([])
   const [printers, setPrinters] = React.useState([])
   const [computers, setComputers] = React.useState([])
   const [isLoading, setIsLoading] = React.useState(true)
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const { data: { printNodeConfigs = [] } = {} } = useQuery(
      DEVICES.PRINTNODE_DETAILS,
      {
         variables: {
            where: {
               name: {
                  _eq: 'printnode',
               },
            },
         },
      }
   )
   const { loading, error } = useSubscription(DEVICES.LIST, {
      onSubscriptionData: ({ subscriptionData: { data = {} } }) => {
         setComputers(data.computers)
         setPrinters(
            [...data.computers.map(computer => computer.printers)].flat()
         )
         setScales([...data.computers.map(computer => computer.scales)].flat())
         setIsLoading(false)
      },
   })

   if (!loading && error) {
      toast.error('Failed to fetch devices')
      logger(error)
      setIsLoading(false)
   }

   React.useEffect(() => {
      if (!tab) {
         addTab('Devices', '/settings/devices')
      }
   }, [tab, addTab])

   return (
      <Flex margin="0 auto" width="calc(100% - 32px)" maxWidth="1280px">
         <Banner id="settings-app-devices-listing-top" />
         <Flex
            container
            as="header"
            height="80px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex container alignItems="center">
               <Text as="h2">Printnode Details</Text>
               <Tooltip identifier="listing_devices_heading" />
            </Flex>
            <ComboButton type="solid" onClick={() => openTunnel(1)}>
               <PrinterIcon />
               Print PDF
            </ComboButton>
         </Flex>
         <section>
            <Text as="title">
               Email:{' '}
               {printNodeConfigs.length > 0 && printNodeConfigs[0].value.email}
            </Text>
            <Text as="title">
               Password:{' '}
               {printNodeConfigs.length > 0 &&
                  printNodeConfigs[0].value.password}
            </Text>
            <Spacer size="16px" />
            <Text as="h2">Support Links</Text>
            <Spacer size="12px" />
            <StyledLinks>
               <li>
                  <a href="https://www.printnode.com/en/download" target="_blank">
                     Download Printnode
                  </a>
               </li>
               <li>
                  <a href="https://www.printnode.com/en/docs/installation" target="_blank">
                     Installation
                  </a>
               </li>
               <li>
                  <a href="https://www.printnode.com/en/docs/supported-printers" target="_blank">
                     Supported Printers
                  </a>
               </li>
               <li>
                  <a href="https://www.printnode.com/en/docs/supported-scales" target="_blank">
                     Supported Scales
                  </a>
               </li>
            </StyledLinks>
         </section>
         <Spacer size="24px" />
         <Flex container alignItems="center">
            <Text as="h2">Computers</Text>
            <Tooltip identifier="listing_devices_section_computers" />
         </Flex>
         <Spacer size="16px" />
         {isLoading && <InlineLoader />}
         <Table>
            <TableHead>
               <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Host Name</TableCell>
                  <TableCell>Total Printers</TableCell>
                  <TableCell>Active Printers</TableCell>
                  <TableCell>State</TableCell>
               </TableRow>
            </TableHead>
            {!isLoading && computers.length > 0 ? (
               <TableBody>
                  {computers.map(computer => (
                     <TableRow key={computer.printNodeId}>
                        <TableCell>{computer.name}</TableCell>
                        <TableCell>{computer.hostname}</TableCell>
                        <TableCell>
                           {computer.totalPrinters.aggregate.count}
                        </TableCell>
                        <TableCell>
                           {computer.activePrinters.aggregate.count}
                        </TableCell>
                        <TableCell>
                           <Tag>{computer.state}</Tag>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            ) : (
               <Flex
                  container
                  width="100%"
                  alignItems="center"
                  justifyContent="center"
               >
                  <Filler
                     width="240px"
                     height="240px"
                     message="No computers available!"
                  />
               </Flex>
            )}
         </Table>
         <Spacer size="24px" />
         <Flex container alignItems="center">
            <Text as="h2">Printers</Text>
            <Tooltip identifier="listing_devices_section_printers" />
         </Flex>
         <Spacer size="16px" />
         {isLoading && <InlineLoader />}
         <Table>
            <TableHead>
               <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Computer</TableCell>
                  <TableCell>State</TableCell>
               </TableRow>
            </TableHead>
            {!isLoading && printers.length > 0 ? (
               <TableBody>
                  {printers.map(printer => (
                     <TableRow key={printer.printNodeId}>
                        <TableCell>{printer.name}</TableCell>
                        <TableCell>{printer.computer.name}</TableCell>
                        <TableCell>
                           <Tag>{printer.state}</Tag>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            ) : (
               <Flex
                  container
                  width="100%"
                  alignItems="center"
                  justifyContent="center"
               >
                  <Filler
                     width="240px"
                     height="240px"
                     message="No printers available!"
                  />
               </Flex>
            )}
         </Table>
         <Spacer size="24px" />
         <Text as="h2">Scales</Text>
         <Spacer size="16px" />
         {isLoading && <InlineLoader />}
         <Table>
            <TableHead>
               <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Computer</TableCell>
               </TableRow>
            </TableHead>
            {!isLoading && scales.length > 0 ? (
               <TableBody>
                  {scales.map(scale => (
                     <TableRow key={scale.deviceNum}>
                        <TableCell>{scale.name}</TableCell>
                        <TableCell>{scale.computer.name}</TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            ) : (
               <Flex
                  width="100%"
                  container
                  alignItems="center"
                  justifyContent="center"
               >
                  <Filler
                     width="240px"
                     height="240px"
                     message="No scales available!"
                  />
               </Flex>
            )}
         </Table>
         <Spacer size="24px" />
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="sm">
               <PrintTunnel closeTunnel={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <Banner id="settings-app-devices-listing-bottom" />
      </Flex>
   )
}

export default DevicesListing

const StyledLinks = styled.ul`
   display: flex;
   align-items: center;
   flex-wrap: wrap;
   li {
      list-style: none;
      margin-bottom: 16px;
      margin-right: 16px;
   }
`

const PrintTunnel = ({ closeTunnel }) => {
   const [url, setUrl] = React.useState('')
   const [search, setSearch] = React.useState('')
   const [printers, setPrinters] = React.useState([])
   const [createPrint, { loading: isPrinting }] = useMutation(PRINT_JOB, {
      onCompleted: () => {
         closeTunnel(1)
         toast.success('Successfully Printed!')
      },
      onError: error => {
         toast.error('Failed to print!')
         logger(error)
      },
   })
   const { loading } = useQuery(DEVICES.PRINTERS.ONLINE, {
      onCompleted: ({ printers = [] }) => {
         setPrinters(
            printers.map(node => ({ id: node.printNodeId, title: node.name }))
         )
      },
   })
   const [list, current, selectOption] = useSingleList(printers)

   const print = () => {
      if (!url) return toast.error('Please enter the PDF URL!')
      if (isEmpty(current)) return toast.error('Please select a printer!')
      createPrint({
         variables: {
            url,
            source: 'Admin',
            title: 'Custom Print',
            contentType: 'pdf_uri',
            printerId: current?.id,
         },
      })
   }

   return (
      <>
         <TunnelHeader
            title="Print PDF"
            right={{
               action: print,
               title: 'Print',
               isLoading: isPrinting,
               disabled: !Boolean(url) ?? isEmpty(current),
            }}
            close={() => closeTunnel(1)}
         />
         <Banner id="settings-app-devices-print-tunnel-top" />
         <Flex padding="16px" overflowY="auto" height="calc(100vh - 105px)">
            <Form.Group>
               <Form.Label htmlFor="url" title="url">
                  <Flex container alignItems="center">
                     PDF URL*
                     <Tooltip identifier="app_settings_listing_devices_tunnel_print_field_url" />
                  </Flex>
               </Form.Label>
               <Form.Text
                  id="url"
                  name="url"
                  value={url}
                  placeholder="Enter the url"
                  onChange={e => setUrl(e.target.value)}
               />
            </Form.Group>
            <Spacer size="24px" />
            <Text as="h3">Select Printer</Text>
            <Spacer size="12px" />
            {loading ? (
               <InlineLoader />
            ) : (
               <List>
                  {Object.keys(current).length > 0 ? (
                     <ListItem type="SSL1" title={current.title} />
                  ) : (
                     <ListSearch
                        onChange={value => setSearch(value)}
                        placeholder="search by printer name..."
                     />
                  )}
                  <ListOptions>
                     {list
                        .filter(option =>
                           option.title.toLowerCase().includes(search)
                        )
                        .map(option => (
                           <ListItem
                              type="SSL1"
                              key={option.id}
                              title={option.title}
                              isActive={option.id === current.id}
                              onClick={() => selectOption('id', option.id)}
                           />
                        ))}
                  </ListOptions>
               </List>
            )}
         </Flex>
         <Banner id="settings-app-devices-print-tunnel-bottom" />
      </>
   )
}
