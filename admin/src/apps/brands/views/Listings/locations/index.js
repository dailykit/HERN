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
   Loader,
} from '@dailykit/ui'
import React, { useEffect } from 'react'
import { toast } from 'react-toastify'
import { DeleteIcon, PlusIcon } from '../../../../../shared/assets/icons'
import { Banner, InlineLoader } from '../../../../../shared/components'
import { get_env, logger } from '../../../../../shared/utils'
import { LOCATIONS } from '../../../graphql'
import { StyledHeader, StyledWrapper } from '../styled'
import tableOptions from '../../../tableOption'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { useTabs, useTooltip } from '../../../../../shared/providers'
import CreateBrandLocation from '../../../../../shared/CreateUtils/Brand/BrandLocation'
import { Avatar, Tooltip } from 'antd'
import {
   CloseIcon,
   LocationMarkerIcon,
   PublishIcon,
   UnPublishIcon,
} from '../../../assets/icons'
import { DisplayLocation } from './tunnels'
import { EditLocationDetails } from '../../Forms/location/tunnels'
import GoogleMapReact from 'google-map-react'

export const Locations = () => {
   const [locations, setLocations] = React.useState()
   const tableRef = React.useRef()
   const { tooltip } = useTooltip()
   const { addTab, tab } = useTabs()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(3)
   const [selectedRowData, setSelectedRowData] = React.useState(null)
   const [isLoading, setIsLoading] = React.useState(true)
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
         setIsLoading(false)
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
   if (isLoading) return <InlineLoader />
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
               <HorizontalTabPanel>
                  <LocationsOnMap locations={locations} />
               </HorizontalTabPanel>
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

const LocationsOnMap = ({ locations }) => {
   const [locationDetails, setLocationDetails] = React.useState([...locations])
   // console.log('details', locationDetails)

   const defaultProps = {
      center: {
         lat: 26.909911628518344,
         lng: 75.77575138297402,
      },
      zoom: 12,
   }
   const BrandAvatarMap = ({ location }) => {
      // console.log('avatar', cell._cell.row.data)
      const rowData = location

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
   const InfoWindow = props => {
      const { location } = props
      const infoWindowStyle = {
         position: 'relative',
         bottom: '12rem',
         left: '-10rem',
         width: '20rem',
         backgroundColor: 'white',
         boxShadow: '0 2px 7px 1px rgba(0, 0, 0, 0.3)',
         padding: 10,
         fontSize: 16,
         zIndex: 10000,
         display: 'flex',
         cursor: 'pointer',
         justifyContent: 'space-between',
      }
      // console.log('details for brand', location)
      return (
         <div style={infoWindowStyle}>
            <div>
               <div>{location.label}</div>
               <div>
                  {location.locationAddress.line1}{' '}
                  {location.locationAddress.line2} <br />
                  {location.city} {location.state} {location.country}{' '}
                  {location.zipcode}
               </div>
               <div>
                  <BrandAvatarMap location={location} />
               </div>
            </div>
            <div onClick={() => closeHandler(location)}>
               <CloseIcon color={'black'} />
            </div>
         </div>
      )
   }
   const closeHandler = location => {
      const index = locationDetails.findIndex(
         e => e.id === JSON.parse(location.id)
      )
      console.log('id', location.id)
      const loca = [...locationDetails]

      loca[index] = {
         ...loca[index],
         show: !loca[index].show,
      }
      setLocationDetails([...loca])
   }

   const UserLocationMarker = ({ show, location }) => {
      // console.log('show & location', show, location)
      return (
         <div>
            <LocationMarkerIcon
               size={48}
               style={{
                  position: 'absolute',
                  top: 'calc(52.5% - 24px)',
                  left: '49.5%',
                  zIndex: '1000',
                  transform: 'translate(-50%,-50%)',
               }}
            />
            {show && <InfoWindow location={location} />}
         </div>
      )
   }

   useEffect(() => {
      const locationArray = [...locationDetails]
      for (let i = 0; i < locationDetails.length; i++) {
         locationArray[i] = {
            ...locationArray[i],
            show: false,
         }
      }
      setLocationDetails(locationArray)
   }, [locations])
   // console.log('locationDetails', locationDetails)

   const onChildClickCallback = key => {
      const index = locationDetails.findIndex(e => e.id === JSON.parse(key))
      console.log('onChildClickCallback', locationDetails, key, index)
      const loca = [...locationDetails]

      loca[index] = {
         ...loca[index],
         show: !loca[index].show,
      }
      setLocationDetails([...loca])
   }

   return (
      <>
         <div
            style={{
               height: '450px',
               width: '100%',
               position: 'relative',
            }}
         >
            <GoogleMapReact
               bootstrapURLKeys={{
                  key: get_env('REACT_APP_MAPS_API_KEY'),
               }}
               defaultCenter={defaultProps.center}
               defaultZoom={defaultProps.zoom}
               onChildClick={onChildClickCallback}
               options={{ gestureHandling: 'greedy' }}
            >
               {locationDetails.map(location => (
                  <UserLocationMarker
                     key={location.id}
                     lat={Number(location.lat)}
                     lng={Number(location.lng)}
                     show={location.show}
                     location={location}
                  />
               ))}
            </GoogleMapReact>
         </div>
      </>
   )
}
