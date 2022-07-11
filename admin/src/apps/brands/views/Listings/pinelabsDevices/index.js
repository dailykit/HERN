import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import {
   Text,
   PlusIcon,
   ComboButton,
   IconButton,
   Tunnel,
   Tunnels,
   useTunnel,
   TextButton,
   Spacer,
   Form,
} from '@dailykit/ui'
import { BRANDS, PINELABS_DEVICES } from '../../../graphql'
import tableOptions from '../../../tableOption'
import { logger } from '../../../../../shared/utils'
import { StyledWrapper, StyledHeader } from '../styled'
import { DeleteIcon } from '../../../../../shared/assets/icons'
import {
   InlineLoader,
   Flex,
   Tooltip,
   Banner,
} from '../../../../../shared/components'
import { useTooltip, useTabs } from '../../../../../shared/providers'
import CreateDevice from '../../../../../shared/CreateUtils/Brand/PinelabsDevices/CreateDevice'
import moment from 'moment'
import '../../../tableStyle.css'

export const PinelabsDevices = () => {
   const { tooltip } = useTooltip()
   const tableRef = React.useRef()
   const { tab, addTab } = useTabs()
   const { loading } = useMutation(BRANDS.CREATE_BRAND)
   const [isLoading, setIsLoading] = React.useState(true)
   const [deviceList, setDeviceList] = React.useState([])

   const [deleteDevice] = useMutation(PINELABS_DEVICES.DELETE_DEVICE, {
      onCompleted: () => {
         toast.success('Device Deleted!')
      },
      onError: error => {
         // console.log(error)
         toast.error('Could not delete!')
      },
   })

   const [editDevice] = useMutation(PINELABS_DEVICES.UPDATE_DEVICE, {
      onCompleted: () => {
         toast.success('Device Updated!')
      },
      onError: error => {
         // console.log(error)
         toast.error('Could not Update!')
      },
   })

   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const {
      error,
      loading: listLoading,
      data: { devices = {} } = {},
   } = useSubscription(PINELABS_DEVICES.LIST, {
      onSubscriptionData: ({ subscriptionData }) => {
         const devices = subscriptionData.data.devices.nodes.map(eachDevice => {
            return eachDevice
         })
         setDeviceList(devices)
         setIsLoading(false)
      },
   })

   React.useEffect(() => {
      if (!tab) {
         addTab('devices', '//devices')
      }
   }, [tab, addTab])

   const cellClick = device => {
      addTab(
         device?.DeviceLabel || device?.accessUrl || 'N/A',
         `/brands/pinelabs-devices/${device.id}`
      )
   }
   // Handler
   const deleteHandler = device => {
      if (
         window.confirm(
            `Are you sure you want to delete Device - ${device.internalPineLabsDeviceLabel}?`
         )
      ) {
         deleteDevice({
            variables: {
               id: device.id,
            },
         })
      }
   }

   const [updateDevice] = useMutation(PINELABS_DEVICES.UPDATE_DEVICE, {
      onCompleted: () => {
         toast.info('Device Updated!')
      },
      onError: error => {
         toast.error('Something went wrong !')
         logger(error)
      },
   })

   const toggleHandler = (toggle, id) => {
      const val = !toggle
      if (val && toggle) {
         toast.error(`Device should be valid!`)
      } else {
         updateDevice({
            variables: {
               id: id,
               _set: {
                  isActive: val,
               },
            },
         })
      }
   }

   const ToggleButton = ({ cell }) => {
      const rowData = cell._cell.row.data
      console.log(rowData)
      return (
         <Form.Group>
            <Form.Toggle
               name={`device_active${rowData.id}`}
               title="Click to change active status of device"
               onChange={() => toggleHandler(rowData.isActive, rowData.id)}
               value={rowData.isActive}
            />
         </Form.Group>
      )
   }

   const columns = React.useMemo(() => [
      {
         title: 'DEVICE',
         field: 'internalPineLabsDeviceLabel',
         frozen: true,
         headerSort: true,
         headerFilter: true,
         formatter: reactFormatter(<DeviceName />),
         headerTooltip: function (column) {
            const identifier = 'brands_listing_brand_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         cssClass: 'rowClick',
         cellClick: (e, cell) => {
            cellClick(cell.getData())
         },
         width: 400,
         resizable: 'true',
         minWidth: 100,
         maxWidth: 500,
      },
      {
         title: 'ID',
         field: 'id',
         headerSort: true,
         headerFilter: true,
         width: 100,
      },
      {
         title: 'IMEI',
         field: 'imei',
         headerSort: true,
         headerFilter: true,
         formatter: cell => cell.getData().imei || 'N/A',
         headerTooltip: function (column) {
            const identifier = 'brands_listing_domain_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Store POS Code',
         field: 'merchantStorePosCode',
         headerSort: true,
         width: 200,
         formatter: cell => cell.getData().merchantStorePosCode || 'N/A',
      },
      {
         title: 'Created At',
         field: 'created_at',
         headerSort: true,
         formatter: cell =>
            moment(cell.getData().created_at).format('DD-MM-YYYY hh:mm A') ||
            'N/A',
         width: 200,
      },
      {
         title: 'Updated At',
         field: 'updated_at',
         headerSort: true,
         headerFilter: true,
         formatter: cell =>
            moment(cell.getData().updated_at).format('DD-MM-YYYY hh:mm A') ||
            'N/A',
         headerTooltip: function (column) {
            const identifier = 'brands_listing_domain_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },

      {
         title: 'Active',
         field: 'isActive',
         headerSort: true,
         headerFilter: true,
         width: 50,
         // formatter: cell => cell.getData().isActive || 'N/A',
         formatter: reactFormatter(<ToggleButton />),
         headerTooltip: function (column) {
            const identifier = 'brands_listing_domain_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Actions',
         hozAlign: 'center',
         headerSort: false,
         frozen: true,
         width: 80,
         headerHozAlign: 'center',
         formatter: reactFormatter(
            <DeleteDevice deleteHandler={deleteHandler} />
         ),
         headerTooltip: function (column) {
            const identifier = 'brands_listing_actions_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
   ])

   if (error) {
      toast.error('Something went wrong!')
      logger(error)
   }

   if (listLoading || isLoading) return <InlineLoader />

   return (
      <StyledWrapper>
         {/* <Banner id="brands-app-brands-listing-top" /> */}
         <StyledHeader>
            <Flex container alignItems="center">
               <Text as="h2" style={{ marginBottom: '0px' }}>
                  Devices ({devices?.aggregate?.count || 0})
               </Text>
               <Tooltip identifier="brands_listing_heading" />
            </Flex>

            <div style={{ display: 'flex', gap: '10px' }}>
               <ComboButton type="solid" onClick={() => openTunnel(1)}>
                  <PlusIcon color="white" />
                  Create Device
               </ComboButton>
            </div>
         </StyledHeader>
         {loading ? (
            <InlineLoader />
         ) : (
            <>
               <ReactTabulator
                  ref={tableRef}
                  columns={columns}
                  data={deviceList}
                  options={{
                     ...tableOptions,
                     placeholder: 'No Devices Available Yet !',
                  }}
                  className="brands-table"
               />
            </>
         )}

         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="md">
               <CreateDevice closeTunnel={closeTunnel} />
            </Tunnel>
         </Tunnels>
         {/* <Banner id="brands-app-brands-listing-bottom" /> */}
      </StyledWrapper>
   )
}

const DeleteDevice = ({ cell, deleteHandler }) => {
   console.log(cell)

   const onClick = () => deleteHandler(cell._cell.row.data)
   if (cell.getData().isDefault) return null
   return (
      <IconButton type="ghost" size="sm" onClick={onClick}>
         <DeleteIcon color="#FF5A52" />
      </IconButton>
   )
}

function DeviceName({ cell, addTab }) {
   const data = cell.getData()
   //  console.log("data is:", data,"cell:",cell)
   return (
      <>
         {/* <Flex
             container
             width="100%"
             justifyContent="space-between"
             alignItems="center"
          > */}
         <Flex
            container
            width="100%"
            //  justifyContent="flex-center"
            alignItems="center"
         >
            <p
               title="Click to view this Device"
               style={{
                  width: '230px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '0px',
               }}
            >
               {cell._cell.value ? cell._cell.value : 'N/A'}
            </p>
         </Flex>
         {/* </Flex> */}
      </>
   )
}

const DateFormatter = ({ cell, field }) => {
   const data = cell.getData()
   return (
      <>
         <Text as="text1">
            {moment(data[field]).format('DD-MM-YYYY hh:mm A')}
         </Text>
      </>
   )
}
