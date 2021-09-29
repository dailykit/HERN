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
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { useTranslation } from 'react-i18next'
import { TunnelBody } from '../styled'
import { toast } from 'react-toastify'
import {
   Banner,
   InlineLoader,
   Tooltip,
} from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { PRODUCTS } from '../../../../../../products/graphql'
import { CREATE_COLLECTION_PRODUCT_CATEGORY_PRODUCTS } from '../../../../../graphql'

const address = 'apps.menu.views.forms.collection.tunnels.products.'

const ProductsTunnel = ({ categoryId, closeTunnel }) => {
   const { t } = useTranslation()

   const [search, setSearch] = React.useState('')
   const [products, setProducts] = React.useState([])
   const [list, selected, selectOption] = useMultiList(products)

   // Subscription for fetching products
   const { loading } = useSubscription(PRODUCTS.LIST, {
      variables: {
         where: {
            isArchived: { _eq: false },
         },
      },
      onSubscriptionData: data => {
         const { products } = data.subscriptionData.data
         setProducts([...products])
      },
   })

   const [createRecord, { loading: inFlight }] = useMutation(
      CREATE_COLLECTION_PRODUCT_CATEGORY_PRODUCTS,
      {
         onCompleted: data => {
            toast.success(
               `Product${
                  data.createCollectionProductCategoryProducts.returning
                     .length > 1
                     ? 's'
                     : ''
               } added!`
            )
            closeTunnel(1)
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   const save = () => {
      if (inFlight || !selected.length) return
      const objects = selected.map(product => ({
         collection_productCategoryId: categoryId,
         productId: product.id,
      }))
      createRecord({
         variables: {
            objects,
         },
      })
   }

   const [createProduct] = useMutation(PRODUCTS.CREATE, {
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const quickCreateProduct = () => {
      const productName = search.slice(0, 1).toUpperCase() + search.slice(1)
      createProduct({
         variables: {
            object: {
               name: productName,
               type: 'simple',
            },
         },
      })
   }

   return (
      <>
         <TunnelHeader
            title={t(
               address.concat('select and add products to the collection')
            )}
            right={{ action: save, title: inFlight ? 'Adding...' : 'Add' }}
            close={() => closeTunnel(1)}
            tooltip={<Tooltip identifier="collections_products_tunnel" />}
         />
         <Banner id="menu-app-collections-collection-details-collections-products-tunnel-top" />{' '}
         <TunnelBody>
            {loading ? (
               <InlineLoader />
            ) : (
               <>
                  {products?.length ? (
                     <List>
                        <ListSearch
                           onChange={value => setSearch(value)}
                           placeholder={t(
                              address.concat("type what you're looking for")
                           )}
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
                        <ListHeader type="MSL1" label="Products" />
                        <ListOptions
                           search={search}
                           handleOnCreate={quickCreateProduct}
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
                        message="No products found! To start, please add some."
                        height="500px"
                     />
                  )}
               </>
            )}
         </TunnelBody>
         <Banner id="menu-app-collections-collection-details-collections-products-tunnel-bottom" />{' '}
      </>
   )
}

export default ProductsTunnel
