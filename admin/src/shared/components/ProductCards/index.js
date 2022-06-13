import React from 'react'
import { InlineLoader } from '../InlineLoader'
import { Filler, TextButton, Flex, Text, Spacer } from '@dailykit/ui'
import styled, { css } from 'styled-components'
import { buildImageUrl } from '../../../apps/carts/utils'
import { calcDiscountedPrice, currencyFmt, logger } from '../../../shared/utils'
import { useParams } from 'react-router'
import { useManual } from '../../../apps/carts/views/forms/ondemand/state'
import { toast } from 'react-toastify'
import { useMutation } from '@apollo/react-hooks'
import { MUTATIONS } from '../../../apps/carts/graphql'

//used for onDemand only
const ProductCards = ({ data, isLoading, input }) => {
   const { id: cartId } = useParams()
   const { cart, tunnels, dispatch } = useManual()

   const [insertCartItem, { loading }] = useMutation(
      MUTATIONS.CART.ITEM.INSERT,
      {
         onCompleted: () => {
            toast.success('Item added to cart!')
         },
         onError: error => {
            logger(error)
            toast.error('Failed to add product to cart!')
         },
      }
   )

   const renderPrice = product => {
      if (product.isPopupAllowed && product.productOptions.length > 0) {
         const defaultProductOption =
            product.productOptions.find(
               productOption =>
                  productOption.id === product.defaultProductOptionId
            ) || product.productOptions[0]
         const totalProductPrice = product.price + defaultProductOption.price

         if (product.discount && defaultProductOption.discount) {
            return (
               <Flex container alignItems="center">
                  <Styles.Price strike>
                     {currencyFmt(totalProductPrice)}
                  </Styles.Price>{' '}
                  <Styles.Price>
                     {currencyFmt(
                        calcDiscountedPrice(product.price, product.discount) +
                           calcDiscountedPrice(
                              defaultProductOption.price,
                              defaultProductOption.discount
                           )
                     )}
                  </Styles.Price>
               </Flex>
            )
         }
         return <Styles.Price>{currencyFmt(totalProductPrice)}</Styles.Price>
      } else {
         const totalPrice =
            product.defaultCartItem?.unitPrice ||
            0 +
               product.defaultCartItem?.childs?.data?.reduce(
                  (acc, op) => acc + op.unitPrice,
                  0
               )

         return <Styles.Price>{currencyFmt(totalPrice)}</Styles.Price>
      }
   }
   const openTunnels = product => {
      if (product.isPopupAllowed && product.productOptions.length > 0) {
         dispatch({
            type: 'SET_PRODUCT_ID',
            payload: product.id,
         })
         switch (product.type) {
            case 'simple':
               return tunnels.productOptions[1](1)
            case 'customizable':
               return tunnels.customizableComponents[1](1)
            case 'combo':
               return tunnels.comboComponents[1](1)
         }
      } else {
         insertCartItem({
            variables: {
               object: {
                  ...product.defaultCartItem,
                  cartId: +cartId,
               },
            },
         })
      }
   }
   if (isLoading) {
      return <InlineLoader />
   }
   if (data.length === 0 && input) {
      return (
         <div
            style={{
               display: 'flex',
               justifyContent: 'center',
               marginTop: '4rem',
            }}
         >
            <Filler message="no results found" width="200px" height="200px" />
         </div>
      )
   }

   return (
      <Styles.Cards>
         {data.map(product => {
            // if product has productOptions and all the options are unpublished, then don't show the product
            const publishedProductOptions =
               product.productOptions.length > 0 &&
               product.productOptions.filter(option => option.isPublished)
                  .length == 0
            const isProductOutOfStock = () => {
               if (product.isAvailable) {
                  if (
                     product.productOptions.length > 0 &&
                     product.isPopupAllowed
                  ) {
                     const availableProductOptions =
                        product.productOptions.filter(
                           option => option.isPublished && option.isAvailable
                        ).length
                     if (availableProductOptions > 0) {
                        return false
                     } else {
                        return true
                     }
                  } else {
                     return false
                  }
               }
               return true
            }
            if (!product.isPublished || publishedProductOptions) {
               return null
            }
            return (
               <Styles.Card key={product.id}>
                  <aside>
                     {product.assets?.images &&
                     product.assets?.images?.length > 0 &&
                     product.assets?.images[0] ? (
                        <img
                           alt={product.name}
                           src={buildImageUrl(
                              '56x56',
                              product.assets?.images[0]
                           )}
                        />
                     ) : (
                        <span>N/A</span>
                     )}
                  </aside>
                  <Flex as="main" container flexDirection="column">
                     <Text as="text2">{product.name}</Text>
                     <Text as="text3">{renderPrice(product)}</Text>
                     <Spacer size="8px" />
                     {isProductOutOfStock() ? (
                        <TextButton
                           type="solid"
                           variant="secondary"
                           size="sm"
                           data-product-id={product.id}
                           disabled={true}
                        >
                           OUT OF STOCK
                        </TextButton>
                     ) : cart?.paymentStatus === 'PENDING' ? (
                        <TextButton
                           type="solid"
                           variant="secondary"
                           size="sm"
                           data-product-id={product.id}
                           onClick={() => openTunnels(product)}
                        >
                           ADD{' '}
                           {product.isPopupAllowed &&
                              product.productOptions?.length > 0 &&
                              '+'}
                        </TextButton>
                     ) : null}
                  </Flex>
               </Styles.Card>
            )
         })}
      </Styles.Cards>
   )
}

export default ProductCards

const Styles = {
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
   Price: styled.p(
      ({ strike }) => css`
         text-decoration-line: ${strike ? 'line-through' : 'none'};
         margin-right: ${strike ? '1ch' : '0'};
      `
   ),
}
