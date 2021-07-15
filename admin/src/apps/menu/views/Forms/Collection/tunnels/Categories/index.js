import React from 'react'
import {
   List,
   ListItem,
   ListOptions,
   ListSearch,
   Tag,
   TagGroup,
   useMultiList,
   TunnelHeader,
   Filler,
   ListHeader,
} from '@dailykit/ui'

import { TunnelBody } from '../styled'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   CREATE_COLLECTION_PRODUCT_CATEGORIES,
   S_PRODUCT_CATEGORIES,
} from '../../../../../graphql'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../shared/utils'
import {
   Banner,
   InlineLoader,
   Tooltip,
} from '../../../../../../../shared/components'
import { MASTER } from '../../../../../../settings/graphql'

const CategoriesTunnel = ({ closeTunnel, state }) => {
   const {
      data: { productCategories = [] } = {},
      loading,
      error,
   } = useSubscription(S_PRODUCT_CATEGORIES)

   if (error) {
      toast.error('Failed to fetch categories!')
      logger(error)
   }

   const [search, setSearch] = React.useState('')
   const [list, selected, selectOption] = useMultiList(productCategories)

   const [createCategoriesInCollection, { loading: inFlight }] = useMutation(
      CREATE_COLLECTION_PRODUCT_CATEGORIES,
      {
         onCompleted: data => {
            toast.success(
               `Categor${
                  data.createCollectionProductCategories.returning.length > 1
                     ? 'ies'
                     : 'y'
               } added.`
            )
            closeTunnel(1)
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   const [createCategory] = useMutation(MASTER.PRODUCT_CATEGORY.CREATE, {
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const save = () => {
      if (inFlight || !selected.length) return
      const objects = selected.map(category => ({
         collectionId: state.id,
         productCategoryName: category.title,
      }))
      createCategoriesInCollection({
         variables: {
            objects,
         },
      })
   }

   const quickCreateCategory = () => {
      const categoryName = search.slice(0, 1).toUpperCase() + search.slice(1)
      createCategory({
         variables: {
            object: {
               name: categoryName,
            },
         },
      })
   }

   return (
      <>
         <TunnelHeader
            title="Add Categories"
            right={{ action: save, title: inFlight ? 'Adding...' : 'Add' }}
            close={() => closeTunnel(1)}
            tooltip={<Tooltip identifier="collections_categories_tunnel" />}
         />
         <Banner id="menu-app-collections-collection-details-collections-categories-tunnel-top" />
         <TunnelBody>
            {loading ? (
               <InlineLoader />
            ) : (
               <>
                  {productCategories.length ? (
                     <List>
                        <ListSearch
                           onChange={value => setSearch(value)}
                           placeholder={"Type what you're looking for"}
                        />
                        {selected.length > 0 && (
                           <TagGroup style={{ margin: '8px 0' }}>
                              {selected.map(option => (
                                 <Tag
                                    key={option.id}
                                    title={option.title}
                                    onClick={() =>
                                       selectOption('id', option.id)
                                    }
                                 >
                                    {option.title}
                                 </Tag>
                              ))}
                           </TagGroup>
                        )}
                        <ListHeader
                           type="MSL1"
                           label="Master Product Categories"
                        />
                        <ListOptions
                           search={search}
                           handleOnCreate={quickCreateCategory}
                        >
                           {list
                              .filter(option =>
                                 option.title.toLowerCase().includes(search)
                              )
                              .map(option => (
                                 <ListItem
                                    type="MSL1"
                                    key={option.id}
                                    title={option.title}
                                    onClick={() =>
                                       selectOption('id', option.id)
                                    }
                                    isActive={selected.find(
                                       item => item.id === option.id
                                    )}
                                 />
                              ))}
                        </ListOptions>
                     </List>
                  ) : (
                     <Filler
                        message="No categories found! To start, please add some."
                        height="500px"
                     />
                  )}
               </>
            )}
         </TunnelBody>
         <Banner id="menu-app-collections-collection-details-collections-categories-tunnel-bottom" />
      </>
   )
}

export default CategoriesTunnel
