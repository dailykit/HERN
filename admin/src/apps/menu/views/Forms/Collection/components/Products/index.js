import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import {
   Text,
   ButtonTile,
   Tunnels,
   Tunnel,
   useTunnel,
   Flex,
   Form,
} from '@dailykit/ui'
import {
   DELETE_COLLECTION_PRODUCT_CATEGORY_PRODUCT,
   DELETE_COLLECTION_PRODUCT_CATEGORY,
   UPDATE_COLLECTION_PRODUCT_CATEGORY,
} from '../../../../../graphql'

import { ProductsTunnel, CategoriesTunnel } from '../../tunnels'

import { DeleteIcon } from '../../../../../assets/icons'
import {
   StyledCategoryWrapper,
   StyledHeader,
   StyledProductWrapper,
   Grid,
   ProductContent,
   ProductImage,
   ActionButton,
   StyledAction,
} from './styled'
import { logger } from '../../../../../../../shared/utils'
import { DragNDrop } from '../../../../../../../shared/components'

const Products = ({ state }) => {
   const [tunnels, openTunnel, closeTunnel] = useTunnel(2)
   const [categoryTunnels, openCategoryTunnel, closeCategoryTunnel] =
      useTunnel(1)
   const [selectedCategoryId, setSelectedCategoryId] = React.useState(null)

   //mutations
   const [deleteCollectionProductCategory] = useMutation(
      DELETE_COLLECTION_PRODUCT_CATEGORY,
      {
         onCompleted: data => {
            toast.success('Category removed!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )
   const [updateCategory] = useMutation(UPDATE_COLLECTION_PRODUCT_CATEGORY, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log('error', error)
         logger(error)
      },
   })

   //handler
   const handleDelete = category => {
      const isConfirmed = window.confirm(
         `Are you sure you want to remove ${category.productCategoryName}?`
      )
      if (isConfirmed) {
         deleteCollectionProductCategory({
            variables: {
               id: category.id,
            },
         })
      }
   }

   const handlePublish = category => {
      console.log('category', category)
      updateCategory({
         variables: {
            id: category.id,
            _set: {
               isActive: !category.isActive,
            },
         },
      })
   }

   const addProduct = categoryId => {
      setSelectedCategoryId(categoryId)
      openTunnel(1)
   }

   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <ProductsTunnel
                  categoryId={selectedCategoryId}
                  closeTunnel={closeTunnel}
               />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={categoryTunnels}>
            <Tunnel layer={1}>
               <CategoriesTunnel
                  closeTunnel={closeCategoryTunnel}
                  state={state}
               />
            </Tunnel>
         </Tunnels>
         <DragNDrop
            list={state.productCategories}
            droppableId="categoriesDroppableId"
            tablename="collection_productCategory"
            schemaname="onDemand"
            direction="horizontal"
         >
            {state.productCategories.map(category => (
               <StyledCategoryWrapper key={category.id}>
                  <StyledHeader>
                     <Text as="h2">{category.productCategoryName}</Text>
                     <StyledAction>
                        <Form.Group>
                           <Form.Toggle
                              name={`active-${category.id}`}
                              value={category.isActive}
                              onChange={() => handlePublish(category)}
                              title={
                                 'Click to change publish status of category'
                              }
                           />
                        </Form.Group>
                        <ActionButton
                           onClick={() => handleDelete(category)}
                           title="Click to delete category"
                        >
                           <DeleteIcon color="#FF6B5E" />
                        </ActionButton>
                     </StyledAction>
                  </StyledHeader>
                  <Flex>
                     <DragNDrop
                        list={category.products}
                        droppableId="categoryProductsDroppableId"
                        tablename="collection_productCategory_product"
                        schemaname="onDemand"
                     >
                        {category.products.map(product => (
                           <Product key={product.id} product={product} />
                        ))}
                     </DragNDrop>
                     <ButtonTile
                        type="secondary"
                        text="Add Product"
                        onClick={() => addProduct(category.id)}
                     />
                  </Flex>
               </StyledCategoryWrapper>
            ))}
         </DragNDrop>
         <ButtonTile
            type="secondary"
            text="Add Category"
            onClick={() => openCategoryTunnel(1)}
         />
      </>
   )
}

export default Products

const Product = ({ product }) => {
   const [deleteRecord] = useMutation(
      DELETE_COLLECTION_PRODUCT_CATEGORY_PRODUCT,
      {
         onCompleted: () => {
            toast.success('Product removed!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   const removeProduct = () => {
      const isConfirmed = window.confirm(
         `Are you sure you want to remove ${product.product.name}?`
      )
      if (isConfirmed) {
         deleteRecord({
            variables: {
               id: product.id,
            },
         })
      }
   }

   return (
      <StyledProductWrapper>
         <ProductContent>
            {Boolean(product.product.assets.images.length) && (
               <ProductImage src={product.product.assets.images[0]} />
            )}
            <Text as="p"> {product.product.name} </Text>
         </ProductContent>
         <ActionButton onClick={removeProduct}>
            <DeleteIcon color="#FF6B5E" />
         </ActionButton>
      </StyledProductWrapper>
   )
}
