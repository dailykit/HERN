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

const LinkedBrandsTunnel = ({ close, locationId, state }) => {
   const [brandIds, setBrandIds] = React.useState([])
   const [search, setSearch] = React.useState('')

   //subscription
   const { loading: loadingList, error } = useSubscription(BRAND_ID_LIST, {
      variables: {
         locationId: locationId,
         identifier: 'Brand Info',
      },
      onSubscriptionData: data => {
         const result = data.subscriptionData.data.brandsAggregate.nodes.map(
            eachBrand => {
               return {
                  id: eachBrand.id,
                  title: eachBrand.title,
                  domain: [eachBrand.domain],
                  logo: eachBrand.brand_brandSettings.length
                     ? eachBrand.brand_brandSettings[0]?.value.brandLogo.value
                        ? eachBrand.brand_brandSettings[0]?.value.brandLogo
                             .value
                        : eachBrand.brand_brandSettings[0]?.value.brandLogo
                             .default.url
                     : '',
               }
            }
         )
         setBrandIds(result)
      },
   })
   console.log('brand ID:::', brandIds)

   //multi select list
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
            title={'Link Brands with ' + state.label}
            close={() => close(1)}
            right={{
               action: save,
               title: inFlight ? 'Adding...' : 'Add',
            }}
         />
         <List style={{ padding: '0 1rem' }}>
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
            <ListHeader type="MSL31" label="Brands" />
            <ListOptions>
               {list
                  .filter(option => option.title.toLowerCase().includes(search))
                  .map(option => (
                     <ListItem
                        type="MSL31"
                        key={option.id}
                        content={{
                           img: option.logo,
                           title: option.title,
                           field: [
                              {
                                 fieldName: 'Domain',
                                 fieldValue: option.domain,
                              },
                           ],
                        }}
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
