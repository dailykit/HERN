import { useMutation, useSubscription } from '@apollo/react-hooks'
import { ComboButton, Flex, IconButton, Text } from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { DeleteIcon, PlusIcon } from '../../../../../shared/assets/icons'
import { Banner, InlineLoader, Tooltip } from '../../../../../shared/components'
import { logger } from '../../../../../shared/utils'
import { LOCATIONS } from '../../../graphql'
import { StyledHeader, StyledWrapper } from '../styled'
import tableOptions from '../../../tableOption'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { useTooltip } from '../../../../../shared/providers'

export const Locations = () => {
   const [locations, setLocations] = React.useState()
   const tableRef = React.useRef()
   const { tooltip } = useTooltip()

   // subscriptions
   const {
      error,
      loading: listLoading,
      data,
   } = useSubscription(LOCATIONS.LIST, {
      onSubscriptionData: data => {
         console.log('data', data)
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
         field: 'brand_locations_aggregate.aggregate.count',
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
               <Tooltip identifier="locations_listing_heading" />
            </Flex>

            <ComboButton type="solid">
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
