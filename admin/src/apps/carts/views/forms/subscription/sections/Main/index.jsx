import React from 'react'
import { uniqBy } from 'lodash'
import styled from 'styled-components'
import { toast } from 'react-toastify'
import { Element } from 'react-scroll'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { useParams } from 'react-router'
import {
   Tag,
   Text,
   Flex,
   Filler,
   Spacer,
   AnchorNav,
   TextButton,
   AnchorNavItem,
} from '@dailykit/ui'

import { useManual } from '../../state'
import { buildImageUrl } from '../../../../../utils'
import { MUTATIONS, QUERIES } from '../../../../../graphql'
import EmptyIllo from '../../../../../assets/svgs/EmptyIllo'
import { InlineLoader } from '../../../../../../../shared/components'
import { currencyFmt, logger } from '../../../../../../../shared/utils'

export const Main = () => {
   const { subscriptionOccurenceId, customer } = useManual()
   const [hasMenuError, setHasMenuError] = React.useState(false)
   const { loading, data: { categories = [] } = {} } = useQuery(
      QUERIES.CATEGORIES.LIST,
      {
         variables: {
            subscriptionId: { _eq: customer.subscriptionId },
            subscriptionOccurenceId: { _eq: subscriptionOccurenceId },
         },
         onError: error => {
            logger(error)
            setHasMenuError(true)
         },
      }
   )

   if (loading) return <InlineLoader />
   if (hasMenuError)
      return (
         <Styles.Main>
            <Flex
               container
               width="100%"
               height="100%"
               alignItems="center"
               justifyContent="center"
            >
               <Filler
                  width="380px"
                  height="320px"
                  illustration={<EmptyIllo width="240px" />}
                  message="There was an issue in fetching the prodcuts, please try again!"
               />
            </Flex>
         </Styles.Main>
      )
   if (categories.length === 0)
      return (
         <Styles.Main>
            <Flex
               container
               width="100%"
               height="100%"
               alignItems="center"
               justifyContent="center"
            >
               <Filler
                  width="380px"
                  height="320px"
                  illustration={<EmptyIllo width="240px" />}
                  message="No products available for today!"
               />
            </Flex>
         </Styles.Main>
      )
   return (
      <Styles.Main>
         <Menu categories={categories} />
      </Styles.Main>
   )
}

const Menu = ({ categories = [] }) => {
   const { cart } = useManual()
   const [insert, { loading }] = useMutation(MUTATIONS.CART.ITEM.INSERT, {
      onCompleted: () => toast.success('Successfully added the product!'),
      onError: () => toast.error('Failed to add the product!'),
   })
   return (
      <>
         <AnchorNav>
            {categories.map(category => (
               <AnchorNavItem
                  key={category.name}
                  label={category.name}
                  containerId="categories"
                  targetElement={category.name}
               />
            ))}
         </AnchorNav>
         <Element
            id="categories"
            style={{
               width: '100%',
               overflowY: 'auto',
               overflowX: 'hidden',
               position: 'relative',
               height: '95.7%',
               padding: '0 14px',
            }}
         >
            {categories.map(category => {
               const products = uniqBy(
                  category.productsAggregate.nodes,
                  ({ cartItem = {} }) =>
                     [
                        cartItem?.productId,
                        cartItem?.option?.productOptionId,
                     ].join()
               )
               return (
                  <Element
                     key={category.name}
                     name={category.name}
                     style={{ height: '100%', overflowY: 'auto' }}
                  >
                     <Text as="text1">
                        {category.name}({products.length})
                     </Text>
                     <Spacer size="14px" />
                     <Styles.Cards>
                        {products.map(product => (
                           <Product
                              cart={cart}
                              key={product.id}
                              data={product}
                              insert={{ mutate: insert, loading }}
                           />
                        ))}
                     </Styles.Cards>
                     <Spacer size="24px" />
                  </Element>
               )
            })}
         </Element>
      </>
   )
}

const insertCartId = (node, cartId) => {
   if (node.childs.data.length > 0) {
      node.childs.data = node.childs.data.map(item => {
         if (item.childs.data.length > 0) {
            item.childs.data = item.childs.data.map(item => ({
               ...item,
               cartId,
            }))
         }
         return { ...item, cartId }
      })
   }
   node.cartId = cartId

   return node
}

const Product = ({ cart, data, insert }) => {
   const params = useParams()
   const { occurenceCustomer } = useManual()

   const add = () => {
      if (occurenceCustomer?.itemCountValid) {
         toast.warn("You're cart is already full!")
         return
      }
      const cart = insertCartId(data.cartItem, params?.id)
      insert.mutate({ variables: { object: cart } })
   }

   const product = {
      addOnLabel: data.addOnLabel,
      addOnPrice: data.addOnPrice,
      isAvailable: data.isAvailable,
      name: data?.productOption?.product?.name || '',
      label: data?.productOption?.label || '',
      type: data?.productOption?.simpleRecipeYield?.simpleRecipe?.type,
      image:
         data?.productOption?.product?.assets?.images?.length > 0
            ? data?.productOption?.product?.assets?.images[0]
            : null,
      additionalText: data?.productOption?.product?.additionalText || '',
   }
   return (
      <Styles.Card>
         <aside>
            {product.image ? (
               <img
                  alt={product.name}
                  src={buildImageUrl('56x56', product.image)}
               />
            ) : (
               <span>N/A</span>
            )}
         </aside>
         <Flex as="main" container flexDirection="column">
            {product.addOnLabel && (
               <div>
                  <Tag>{product.addOnLabel}</Tag>
                  <Spacer size="4px" />
               </div>
            )}

            <Text as="text2">{product.name}</Text>
            <Spacer size="8px" />
            {cart?.paymentStatus === 'PENDING' && (
               <TextButton
                  size="sm"
                  type="solid"
                  onClick={add}
                  variant="secondary"
                  isLoading={insert.loading}
                  disabled={!product.isAvailable}
                  title={
                     product.isAvailable
                        ? 'Add product'
                        : 'This product is out of stock.'
                  }
               >
                  {product.isAvailable ? (
                     <>
                        ADD {product.addOnPrice > 0 && ' + '}
                        {product.addOnPrice > 0 &&
                           currencyFmt(Number(product.addOnPrice) || 0)}
                     </>
                  ) : (
                     'Out of Stock'
                  )}
               </TextButton>
            )}
         </Flex>
      </Styles.Card>
   )
}

const Styles = {
   Main: styled.main`
      grid-area: main;
      overflow-y: auto;
   `,
   Cards: styled.ul`
      display: grid;
      grid-gap: 14px;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
   `,
   Card: styled.li`
      padding: 4px;
      display: grid;
      grid-gap: 8px;
      min-height: 56px;
      border-radius: 2px;
      background: #ffffff;
      border: 1px solid #ececec;
      grid-template-columns: auto 1fr;
      aside {
         width: 56px;
         height: 56px;
         display: flex;
         background: #eaeaea;
         align-items: center;
         justify-content: center;
         > span {
            font-size: 14px;
            color: #ab9e9e;
         }
         > img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 2px;
         }
      }
   `,
   Filler: styled(Filler)`
      p {
         font-size: 14px;
         text-align: center;
      }
   `,
}
