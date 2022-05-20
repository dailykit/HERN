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
} from '@dailykit/ui'
import { KIOSK, BRANDS } from '../../../graphql'
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
import CreateKiosk from '../../../../../shared/CreateUtils/Brand/Kiosk/CreateKiosk'
import { PublishIcon, UnPublishIcon } from '../../../assets/icons'
import moment from 'moment'
import '../../../tableStyle.css'

export const KioskLocations = () => {
   const { tooltip } = useTooltip()
   const tableRef = React.useRef()
   const { tab, addTab } = useTabs()
   const { loading } = useMutation(BRANDS.CREATE_BRAND)
   const [isLoading, setIsLoading] = React.useState(true)
   const [kioskList, setKioskList] = React.useState([])

   const [deleteKiosk] = useMutation(KIOSK.UPDATE_KIOSK, {
      onCompleted: () => {
         toast.success('KIOSK inActive!')
      },
      onError: error => {
         // console.log(error)
         toast.error('Could not delete!')
      },
   })

   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const {
      error,
      loading: listLoading,
      data: { kiosk = {} } = {},
   } = useSubscription(KIOSK.LIST, {
      onSubscriptionData: ({ subscriptionData }) => {
         const kiosks = subscriptionData.data.kiosk.nodes.map(eachKiosk => {
            eachKiosk.isKioskRunningLive =
               moment
                  .duration(moment().diff(moment(eachKiosk.lastActiveTime)))
                  .asSeconds() < 65
            return eachKiosk
         })
         setKioskList(kiosks)
         setIsLoading(false)
      },
   })

   React.useEffect(() => {
      if (!tab) {
         addTab('kiosks', '//kiosks')
      }
   }, [tab, addTab])

   const cellClick = kiosk => {
      addTab(
         kiosk?.KioskLabel || kiosk?.accessUrl || 'N/A',
         `/brands/kiosks/${kiosk.id}`
      )
   }
   //  console.log("id:",params.id)
   // Handler
   const deleteHandler = kiosk => {
      if (
         window.confirm(
            `Are you sure you want to delete Kiosk - ${kiosk.KioskLabel}?`
         )
      ) {
         deleteKiosk({
            variables: {
               id: kiosk.id,
               _set: { isActive: false },
            },
         })
      }
   }

   const columns = React.useMemo(() => [
      {
         title: 'KIOSK',
         field: 'KioskLabel',
         frozen: true,
         headerSort: true,
         headerFilter: true,
         formatter: reactFormatter(<KioskName />),
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
         title: 'Domain',
         field: 'accessUrl',
         headerSort: true,
         headerFilter: true,
         formatter: cell => cell.getData().accessUrl || 'N/A',
         headerTooltip: function (column) {
            const identifier = 'brands_listing_domain_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Last Update',
         field: 'lastActiveTime',
         headerSort: true,
         width: 200,
         formatter: reactFormatter(<DateFormatter field={'lastActiveTime'} />),
      },
      {
         title: 'Live Running Status',
         field: 'isKioskRunningLive',
         headerSort: true,
         formatter: reactFormatter(<LiveRunningStatusFormatter />),
         width: 200,
      },
      {
         title: 'Printer',
         field: 'printerId',
         headerSort: true,
         headerFilter: true,
         formatter: cell => cell.getData().printerId || 'N/A',
         headerTooltip: function (column) {
            const identifier = 'brands_listing_domain_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },

      {
         title: 'Status',
         field: 'isActive',
         headerSort: true,
         headerFilter: true,
         width: 50,
         // formatter: cell => cell.getData().isActive || 'N/A',
         formatter: reactFormatter(<ActiveFormatter />),
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
            <DeleteKiosk deleteHandler={deleteHandler} />
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
                  Kiosks ({kiosk?.aggregate?.count || 0})
               </Text>
               <Tooltip identifier="brands_listing_heading" />
            </Flex>
            <div style={{ display: 'flex', gap: '10px' }}>
               <TextButton
                  type="outline"
                  align="left"
                  onClick={() => addTab('kioskReport', '/brands/kiosks/report')}
               >
                  Kiosk Report
               </TextButton>

               <ComboButton type="solid" onClick={() => openTunnel(1)}>
                  <PlusIcon color="white" />
                  Create Kiosks
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
                  data={kioskList}
                  options={{
                     ...tableOptions,
                     placeholder: 'No Kiosks Available Yet !',
                  }}
                  className="brands-table"
               />
            </>
         )}

         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="md">
               <CreateKiosk closeTunnel={closeTunnel} />
            </Tunnel>
         </Tunnels>
         {/* <Banner id="brands-app-brands-listing-bottom" /> */}
      </StyledWrapper>
   )
}

const DeleteKiosk = ({ cell, deleteHandler }) => {
   const onClick = () => deleteHandler(cell._cell.row.data)
   if (cell.getData().isDefault) return null
   return (
      <IconButton type="ghost" size="sm" onClick={onClick}>
         <DeleteIcon color="#FF5A52" />
      </IconButton>
   )
}
function KioskName({ cell, addTab }) {
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
               title="Click to view this Kiosk"
               style={{
                  width: '230px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '0px',
               }}
            >
               {cell._cell.value}
            </p>
         </Flex>
         {/* </Flex> */}
      </>
   )
}

const LiveRunningStatusFormatter = ({ cell }) => {
   const data = cell.getData()
   // console.log('dataFo', data)
   return (
      <Flex>
         <Flex container alignItems="center">
            <div
               style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '5px',
                  backgroundColor: `${
                     data.isKioskRunningLive ? '#2EB086' : '#FF4949'
                  }`,
               }}
            ></div>
            <Spacer size="10px" xAxis />
            <div>{data.isKioskRunningLive ? 'Active' : 'In Active'}</div>
         </Flex>
         {/* <div>{`(Last Active time: ${moment(data.lastActiveTime).format(
            'DD-MM-YYYY HH:mm:ss'
         )})`}</div> */}
      </Flex>
   )
}

const ActiveFormatter = ({ cell }) => {
   const data = cell.getData()
   return (
      <Flex container width="50%" justifyContent="flex-end" alignItems="center">
         <span title={data.isActive ? 'Active' : 'UnActive'}>
            {data.isActive ? <PublishIcon /> : <UnPublishIcon />}
         </span>
      </Flex>
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
