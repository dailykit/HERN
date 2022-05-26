import React from 'react'
import { useManual } from '../../state'
import { QUERIES } from '../../graphql'
import {
   List,
   ListHeader,
   ListItem,
   ListOptions,
   ListSearch,
   Text,
   TunnelHeader,
   useSingleList,
} from '@dailykit/ui'
import { useQuery } from '@apollo/react-hooks'
import { InlineLoader } from '../../../InlineLoader'
import { ErrorState } from '../../../ErrorState'
export const BrandLocationsTunnel = () => {
   const { brand, location, mode, tunnels, dispatch } = useManual()
   const [search, setSearch] = React.useState('')

   const {
      loading,
      data: { brands_brand_location = [] } = {},
      error,
   } = useQuery(QUERIES.BRAND_LOCATION.LIST, {
      variables: {
         where: {
            brandId: {
               _eq: brand.id,
            },
            isActive: {
               _eq: true,
            },
         },
      },
   })
   const [list, current, selectOption] = useSingleList(brands_brand_location)
   const onSave = () => {
      dispatch({
         type: 'SET_LOCATION',
         payload: {
            id: current.location.id,
            label: current.location.label,
         },
      })
      tunnels.open(4)
   }

   return (
      <>
         <TunnelHeader
            title="Select Location"
            close={() => tunnels.close(3)}
            right={{
               action: () => onSave(),
               disabled: !current?.id,
               title: 'Next',
            }}
         />
         <div style={{ margin: '5px 10px' }}>
            <Text as="h3">Brand: {brand?.title || 'N/A'}</Text>
         </div>
         {loading ? (
            <InlineLoader />
         ) : error ? (
            <ErrorState
               height="320px"
               message="Could not get the Location data"
            />
         ) : (
            <List>
               {Object.keys(current).length > 0 ? (
                  <ListItem
                     type="SSL2"
                     content={{
                        description:
                           current.location?.locationAddress?.line1 +
                              ' ' +
                              current.location?.zipcode || '',
                        title: current.location?.label,
                     }}
                  />
               ) : (
                  <ListSearch
                     onChange={value => setSearch(value)}
                     placeholder="type what you’re looking for..."
                  />
               )}
               <ListHeader type="SSL2" label="Locations" />
               <ListOptions style={{ height: '320px', overflowY: 'auto' }}>
                  {list
                     .filter(option =>
                        option?.location?.label.toLowerCase().includes(search)
                     )
                     .map(option => (
                        <ListItem
                           type="SSL2"
                           key={option.id}
                           isActive={option.id === current.id}
                           onClick={() => selectOption('id', option.id)}
                           content={{
                              description: `${
                                 option.location?.locationAddress?.line1 || ''
                              }, ${option.location?.city || ''}, ${
                                 option.location?.zipcode || ''
                              }`,
                              title: option.location?.label,
                           }}
                        />
                     ))}
               </ListOptions>
            </List>
         )}
      </>
   )
}
