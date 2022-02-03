import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   ComboButton,
   Flex,
   IconButton,
   Text,
   ToolTip,
   Tunnel,
   Tunnels,
   useTunnel,
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

export const Locations = () => {
   const [locations, setLocations] = React.useState()
   const tableRef = React.useRef()
   const { tooltip } = useTooltip()
   const { addTab, tab } = useTabs()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

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
         title: 'Location Id',
         field: 'id',
         headerFilter: true,
      },
      {
         title: 'Location Name',
         field: 'label',
         headerFilter: true,
         cellClick: (e, cell) => {
            const { label, id } = cell._cell.row.data
            addTab(label, `/brands/locations/${id}`)
         },
      },
      {
         title: 'Zipcode',
         field: 'zipcode',
         headerFilter: true,
      },
      {
         title: 'City',
         field: 'city',
      },
      {
         title: 'State',
         field: 'state',
      },
      {
         title: 'Country',
         field: 'country',
      },
      {
         title: 'Linked Brands',
         formatter: reactFormatter(<BrandAvatar />),
      },
      {
         title: 'Action',
         formatter: reactFormatter(
            <DeleteLocation deleteHandler={deleteHandler} />
         ),
         headerTooltip: function (column) {
            const identifier = 'locations_listing_actions_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
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

         <ReactTabulator
            ref={tableRef}
            columns={columns}
            data={locations || []}
            options={{
               ...tableOptions,
               placeholder: 'No Locations Available Yet !',
            }}
         />
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="md">
               <CreateBrandLocation closeTunnel={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <Banner id="brands-app-locations-listing-bottom" />
      </StyledWrapper>
   )
}

const DeleteLocation = ({ cell, deleteHandler }) => {
   const onClick = () => deleteHandler(cell._cell.row.data)
   if (cell.getData().isDefault) return null
   return (
      <IconButton type="ghost" size="sm" onClick={onClick}>
         <DeleteIcon color="#FF5A52" />
      </IconButton>
   )
}

const BrandAvatar = ({ cell }) => {
   console.log('avatar', cell._cell.row.data)
   const rowData = cell._cell.row.data
   return (
      <>
         <Avatar.Group
            maxCount={
               rowData.brand_locations.length > 5
                  ? 5
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
                        style={{
                           backgroundColor: '#87d068',
                        }}
                        icon={
                           eachBrand.brand.brand_brandSettings[0]?.value
                              .brandLogo.value
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
