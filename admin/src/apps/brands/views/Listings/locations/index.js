import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   ButtonGroup,
   ComboButton,
   Flex,
   IconButton,
   Text,
   TextButton,
   ToolTip,
   Tunnel,
   Tunnels,
   useTunnel,
   HorizontalTab,
   HorizontalTabs,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
} from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { DeleteIcon, PlusIcon } from '../../../../../shared/assets/icons'
import { Banner, InlineLoader } from '../../../../../shared/components'
import { logger } from '../../../../../shared/utils'
import { LOCATIONS } from '../../../graphql'
import { StyledHeader, StyledWrapper } from '../styled'
import tableOptions from '../../../tableOption'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { useTabs, useTooltip } from '../../../../../shared/providers'
import CreateBrandLocation from '../../../../../shared/CreateUtils/Brand/BrandLocation'
import { Avatar, Tooltip } from 'antd'
import { PublishIcon, UnPublishIcon } from '../../../assets/icons'
import { DisplayLocation } from './tunnels'
import { EditLocationDetails } from '../../Forms/location/tunnels'

export const Locations = () => {
   const [locations, setLocations] = React.useState()
   const tableRef = React.useRef()
   const { tooltip } = useTooltip()
   const { addTab, tab } = useTabs()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(3)
   const [selectedRowData, setSelectedRowData] = React.useState(null)

   // subscriptions
   const {
      error,
      loading: listLoading,
      data,
   } = useSubscription(LOCATIONS.LIST, {
      variables: {
         identifier: 'Brand Info',
      },
      onSubscriptionData: data => {
         setLocations(data.subscriptionData.data.brands_location)
      },
   })

   //mutations
   const [deleteLocation] = useMutation(LOCATIONS.DELETE, {
      onCompleted: () => {
         toast.success('Location deleted!')
      },
      onError: error => {
         console.log(error)
         toast.error('Could not delete!')
      },
   })

   //handler
   const deleteHandler = location => {
      deleteLocation({
         variables: {
            id: location.id,
         },
      })
   }

   const columns = React.useMemo(() => [
      {
         title: 'Id',
         field: 'id',
         headerFilter: true,
         frozen: true,
         width: 70,
      },
      {
         title: 'Location Name',
         field: 'label',
         headerFilter: true,
         frozen: true,
         cellClick: (e, cell) => {
            const { label, id } = cell._cell.row.data
            addTab(label, `/brands/locations/${id}`)
         },
         formatter: reactFormatter(<LocationLabel />),
         cssClass: 'colHover',
         width: 280,
      },
      {
         title: 'Action',
         frozen: true,
         formatter: reactFormatter(
            <DeleteLocation deleteHandler={deleteHandler} />
         ),
         headerTooltip: function (column) {
            const identifier = 'locations_listing_actions_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         width: 80,
         headerHozAlign: 'center',
      },
      {
         title: 'Zipcode',
         field: 'zipcode',
         headerFilter: true,
         width: 120,
      },
      {
         title: 'City',
         field: 'city',
         headerFilter: true,
         width: 120,
      },
      {
         title: 'State',
         field: 'state',
         headerFilter: true,
         width: 120,
      },
      {
         title: 'Country',
         field: 'country',
         headerFilter: true,
         width: 120,
      },
      {
         title: 'Linked Brands',
         formatter: reactFormatter(<BrandAvatar />),
      },
      {
         title: 'Location On Map',
         formatter: reactFormatter(
            <LocationOnMap
               openTunnel={openTunnel}
               setSelectedRowData={setSelectedRowData}
            />
         ),
      },
   ])
   if (error) {
      toast.error('Something went wrong!')
      console.log('error', error)
      logger(error)
   }
   if (!locations) return <InlineLoader />
   return (
      <StyledWrapper>
         <Banner id="brands-app-Locations-listing-top" />
         <StyledHeader>
            <Flex container alignItems="center">
               <Text as="h2" style={{ marginBottom: '0px' }}>
                  Locations ({locations?.length || 0})
               </Text>
            </Flex>

            <ComboButton type="solid" onClick={() => openTunnel(1)}>
               <PlusIcon color="white" />
               Create Location
            </ComboButton>
         </StyledHeader>

         <HorizontalTabs>
            <HorizontalTabList>
               <HorizontalTab>Map</HorizontalTab>
               <HorizontalTab>Table</HorizontalTab>
            </HorizontalTabList>
            <HorizontalTabPanels>
               <HorizontalTabPanel>Bulk Content</HorizontalTabPanel>
               <HorizontalTabPanel>
                  <ReactTabulator
                     ref={tableRef}
                     columns={columns}
                     data={locations || []}
                     options={{
                        ...tableOptions,
                        placeholder: 'No Locations Available Yet!',
                     }}
                  />
               </HorizontalTabPanel>
            </HorizontalTabPanels>
         </HorizontalTabs>

         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="md">
               <CreateBrandLocation closeTunnel={closeTunnel} />
            </Tunnel>
            <Tunnel layer={2} size="md">
               <DisplayLocation
                  closeTunnel={closeTunnel}
                  selectedRowData={selectedRowData}
                  openTunnel={openTunnel}
               />
            </Tunnel>
            <Tunnel layer={3} popup={true} size="md">
               <EditLocationDetails
                  state={selectedRowData}
                  closeTunnel={closeTunnel}
               />
            </Tunnel>
         </Tunnels>
         <Banner id="brands-app-locations-listing-bottom" />
      </StyledWrapper>
   )
}

const DeleteLocation = ({ cell, deleteHandler }) => {
   const data = cell._cell.row.data
   const onClick = () => deleteHandler(data)
   if (cell.getData().isDefault) return null
   return (
      <>
         <IconButton
            type="ghost"
            size="sm"
            onClick={onClick}
            title="Click to delete location"
         >
            <DeleteIcon color="#FF5A52" />
         </IconButton>
      </>
   )
}
const BrandAvatar = ({ cell }) => {
   // console.log('avatar', cell._cell.row.data)
   const rowData = cell._cell.row.data
   return (
      <>
         <Avatar.Group
            maxCount={
               rowData.brand_locations.length > 4
                  ? 4
                  : rowData.brand_locations.length
            }
            maxStyle={{
               color: '#f56a00',
               backgroundColor: '#fde3cf',
            }}
         >
            {rowData.brand_locations.map(eachBrand => (
               <Tooltip
                  title={eachBrand.brand.title}
                  placement="top"
                  key={eachBrand.brandId}
               >
                  {eachBrand.brand.brand_brandSettings.length > 0 ? (
                     <Avatar
                        src={
                           eachBrand.brand.brand_brandSettings[0]?.value
                              .brandLogo.value
                              ? eachBrand.brand.brand_brandSettings[0]?.value
                                   .brandLogo.value
                              : eachBrand.brand.brand_brandSettings[0]?.value
                                   .brandLogo.default.url
                        }
                     />
                  ) : (
                     <Avatar
                        style={{
                           backgroundColor: '#87d068',
                        }}
                     >
                        {eachBrand.brand.title.charAt(0).toUpperCase()}
                     </Avatar>
                  )}
               </Tooltip>
            ))}
         </Avatar.Group>
      </>
   )
}
function LocationLabel({ cell, addTab }) {
   const data = cell._cell.row.data
   return (
      <>
         <Flex
            container
            width="100%"
            justifyContent="space-between"
            alignItems="center"
         >
            <Flex
               container
               width="100%"
               justifyContent="flex-end"
               alignItems="center"
            >
               <p
                  style={{
                     width: '230px',
                     whiteSpace: 'nowrap',
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                  }}
               >
                  {data.label}
               </p>
            </Flex>

            <Flex
               container
               width="100%"
               justifyContent="flex-end"
               alignItems="center"
            >
               <IconButton
                  type="ghost"
                  title={data.isActive ? 'Published' : 'Unpublished'}
               >
                  {data.isActive ? <PublishIcon /> : <UnPublishIcon />}
               </IconButton>
            </Flex>
         </Flex>
      </>
   )
}
const LocationOnMap = ({ cell, openTunnel, setSelectedRowData }) => {
   const rowData = () => {
      const data = cell.getData()
      setSelectedRowData(data)
      openTunnel(2)
   }
   return (
      <>
         <ButtonGroup align="center" onClick={rowData}>
            <TextButton
               type="ghost"
               size="sm"
               title="Click to see location on map"
            >
               View Map
            </TextButton>
         </ButtonGroup>
      </>
   )
}
