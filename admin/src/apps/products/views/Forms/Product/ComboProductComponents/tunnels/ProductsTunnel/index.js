import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   List,
   ListHeader,
   ListItem,
   ListOptions,
   ListSearch,
   TunnelHeader,
   useSingleList,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import {
   InlineLoader,
   Tooltip,
   Banner,
} from '../../../../../../../../shared/components'
import { logger } from '../../../../../../../../shared/utils'
import { ProductContext } from '../../../../../../context/product'
import { COMBO_PRODUCT_COMPONENT, PRODUCTS } from '../../../../../../graphql'
import { TunnelBody } from '../../../tunnels/styled'

const ProductsTunnel = ({ closeTunnel, comboComponentId }) => {
   const { productState } = React.useContext(ProductContext)

   const [search, setSearch] = React.useState('')
   const [products, setProducts] = React.useState([])
   const [list, current, selectOption] = useSingleList(products)

   // Subscription for fetching products
   const { loading } = useSubscription(PRODUCTS.LIST, {
      variables: {
         where: {
            type: { _eq: productState.productType },
            isArchived: { _eq: false },
         },
      },
      onSubscriptionData: data => {
         const { products } = data.subscriptionData.data
         setProducts([...products])
      },
   })

   const [updateComboProductComponent] = useMutation(
      COMBO_PRODUCT_COMPONENT.UPDATE,
      {
         onCompleted: () => {
            toast.success('Product added!')
            closeTunnel(2)
            closeTunnel(1)
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   const [createProduct] = useMutation(PRODUCTS.CREATE, {
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const select = option => {
      selectOption('id', option.id)
      updateComboProductComponent({
         variables: {
            id: comboComponentId,
            _set: {
               linkedProductId: option.id,
            },
         },
      })
   }

   const quickCreateProduct = () => {
      const productName = search.slice(0, 1).toUpperCase() + search.slice(1)
      createProduct({
         variables: {
            object: {
               name: productName,
               type: productState.productType,
            },
         },
      })
   }

   return (
      <>
         <TunnelHeader
            title="Select Product to Add"
            close={() => closeTunnel(2)}
            tooltip={
               <Tooltip identifier="customizable_product_products_tunnel" />
            }
         />
         <TunnelBody>
            <Banner id="products-app-products-combo-product-products-tunnel-top" />
            {loading ? (
               <InlineLoader />
            ) : (
               <List>
                  {Object.keys(current).length > 0 ? (
                     <ListItem type="SSL1" title={current.title} />
                  ) : (
                     <ListSearch
                        onChange={value => setSearch(value)}
                        placeholder="type what you’re looking for..."
                     />
                  )}
                  <ListHeader type="SSL1" label="Products" />
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
                              type="SSL1"
                              key={option.id}
                              title={option.title}
                              isActive={option.id === current.id}
                              onClick={() => select(option)}
                           />
                        ))}
                  </ListOptions>
               </List>
            )}
            <Banner id="products-app-products-combo-product-products-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default ProductsTunnel
