import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   List,
   ListHeader,
   ListItem,
   ListOptions,
   ListSearch,
   Tag,
   TagGroup,
   TunnelHeader,
   useMultiList,
} from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { InlineLoader } from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { BRAND_ID_LIST, BRAND_LOCATION } from '../../../../../graphql'

const LinkedBrandsTunnel = ({ close, locationId }) => {
   const [brandIds, setBrandIds] = React.useState([])

   //subscription
   const { loading: loadingList, error } = useSubscription(BRAND_ID_LIST, {
      onSubscriptionData: data => {
         setBrandIds(data.subscriptionData.data.brandsAggregate.nodes)
      },
   })
   console.log('brand ID:::', brandIds)

   //multi select list
   const [search, setSearch] = React.useState('')
   const [isCreating, setIsCreating] = React.useState(false)
   const [list, selected, selectOption] = useMultiList(brandIds)

   //mutation
   const [updateLinkedBrands, { loading: inFlight }] = useMutation(
      BRAND_LOCATION.UPDATE_BRAND,
      {
         onCompleted: () => {
            toast.success('Brands added successfully!')
            close(1)
         },
         onError: error => {
            logger(error)
            toast.error('Error adding Brands!')
            close(1)
         },
      }
   )

   const save = () => {
      if (inFlight || !selected.length) return
      const objects = selected.map(brand => ({
         locationId: locationId,
         brandId: brand.id,
      }))
      updateLinkedBrands({
         variables: {
            objects,
         },
      })
   }

   if (loadingList) return <InlineLoader />
   return (
      <>
         <TunnelHeader
            title="Link Brands with Location"
            close={() => close(1)}
            right={{
               action: save,
               title: inFlight ? 'Adding...' : 'Add',
            }}
         />
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
            <ListHeader type="MSL1" label="Brands" />
            <ListOptions
               search={search}
               handleOnCreate={() => setIsCreating(true)}
               isCreating={isCreating}
            >
               {list
                  .filter(option => option.title.toLowerCase().includes(search))
                  .map(option => (
                     <ListItem
                        type="MSL1"
                        key={option.id}
                        title={option.title}
                        onClick={() => selectOption('id', option.id)}
                        isActive={selected.find(item => item.id === option.id)}
                     />
                  ))}
            </ListOptions>
         </List>
      </>
   )
}

export default LinkedBrandsTunnel
