import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { isEmpty, uniqBy } from 'lodash'
import tw, { styled, css } from 'twin.macro'
import { useQuery } from '@apollo/react-hooks'
import ReactImageFallback from 'react-image-fallback'
import { useToasts } from 'react-toast-notifications'
import moment from 'moment'

import { useMenu } from './state'
import { useConfig } from '../../lib'
import { useUser } from '../../context'
import { HelperBar, Loader } from '../../components'
import { formatCurrency, getRoute, isClient } from '../../utils'
import { SkeletonProduct } from './skeletons'
import { CheckIcon } from '../../assets/icons'
import { OCCURENCE_PRODUCTS_BY_CATEGORIES } from '../../graphql'
const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const Menu = () => {
   const { user } = useUser()
   const { addToast } = useToasts()
   const { state } = useMenu()
   const { configOf, buildImageUrl, noProductImage } = useConfig()
   const { loading, data: { categories = [] } = {} } = useQuery(
      OCCURENCE_PRODUCTS_BY_CATEGORIES,
      {
         variables: {
            occurenceId: { _eq: state?.week?.id },
            subscriptionId: { _eq: user?.subscriptionId },
         },
         onError: error => {
            addToast(error.message, {
               appearance: 'error',
            })
         },
      }
   )

   const isAdded = id => {
      const products = state.occurenceCustomer?.cart?.products || []

      const index = products?.findIndex(
         node => node.subscriptionOccurenceProductId === id
      )
      return index === -1 ? false : true
   }
   const theme = configOf('theme-color', 'Visual')

   // fb pixel custom event when menu page is opened
   React.useEffect(() => {
      if (!loading) {
         ReactPixel.trackCustom('show-menu', {
            startDate: moment(state?.week?.fulfillmentDate)
               .weekday(1)
               .format('ddd MMM D, YYYY'),
            endDate: moment(state?.week?.fulfillmentDate)
               .add(7, 'day')
               .weekday(0)
               .format('ddd MMM D, YYYY'),
            id: state?.week?.id,
            subscriptionId: user?.subscriptionId,
            contents: categories.map(category => ({
               name: category?.name,
               products: category?.productsAggregate?.nodes,
            })),
         })
      }
   }, [categories, loading])

   if (loading) return <SkeletonProduct />
   if (isEmpty(categories))
      return (
         <main tw="pt-4">
            <HelperBar>
               <HelperBar.SubTitle>
                  No products available yet!
               </HelperBar.SubTitle>
            </HelperBar>
         </main>
      )
   return (
      <main>
         {categories.map(category => (
            <section key={category.name} css={tw`mb-8`}>
               <h4 css={tw`text-lg text-gray-700 my-3 pb-1 border-b`}>
                  {category.name} (
                  {
                     uniqBy(category.productsAggregate.nodes, v =>
                        [
                           v?.cartItem?.productId,
                           v?.cartItem?.productOptionId,
                        ].join()
                     ).length
                  }
                  )
               </h4>
               <Products>
                  {uniqBy(category.productsAggregate.nodes, v =>
                     [
                        v?.cartItem?.productId,
                        v?.cartItem?.option?.productOptionId,
                     ].join()
                  ).map((node, index) => (
                     <Product
                        node={node}
                        theme={theme}
                        key={node.id}
                        isAdded={isAdded}
                        buildImageUrl={buildImageUrl}
                        noProductImage={noProductImage}
                     />
                  ))}
               </Products>
            </section>
         ))}
      </main>
   )
}

const Product = ({ node, theme, isAdded, noProductImage, buildImageUrl }) => {
   const router = useRouter()
   const { addToast } = useToasts()
   const { state, methods } = useMenu()

   const openRecipe = () =>
      router.push(getRoute(`/recipes/${node?.productOption?.id}`))

   const add = item => {
      if (state.occurenceCustomer?.betweenPause) {
         return addToast('You have paused your plan!', {
            appearance: 'warning',
         })
      }
      if (state.occurenceCustomer?.validStatus?.itemCountValid) {
         addToast("You're cart is already full!", {
            appearance: 'warning',
         })
         return
      }
      methods.products.add(item)
   }

   const canAdd = () => {
      const conditions = [!node.isSingleSelect, state?.week?.isValid, !isActive]
      return (
         conditions.every(node => node) ||
         ['CART_PENDING', undefined].includes(
            state.occurenceCustomer?.cart?.status
         )
      )
   }

   const isActive = isAdded(node?.cartItem?.subscriptionOccurenceProductId)
   const product = {
      name: node?.productOption?.product?.name || '',
      label: node?.productOption?.label || '',
      type: node?.productOption?.simpleRecipeYield?.simpleRecipe?.type,
      image:
         node?.productOption?.product?.assets?.images?.length > 0
            ? node?.productOption?.product?.assets?.images[0]
            : null,
      additionalText: node?.productOption?.product?.additionalText || '',
   }

   return (
      <Styles.Product theme={theme} className={`${isActive ? 'active' : ''}`}>
         {!!product.type && (
            <Styles.Type>
               <img
                  alt="Non-Veg Icon"
                  src={
                     product.type === 'Non-vegetarian'
                        ? '/imgs/non-veg.png'
                        : '/imgs/veg.png'
                  }
                  title={product.type}
                  tw="h-6 w-6"
               />
            </Styles.Type>
         )}
         <div
            tw="flex items-center justify-center aspect-w-4 aspect-h-3 bg-gray-200 mb-2 rounded overflow-hidden cursor-pointer"
            onClick={openRecipe}
         >
            {product.image ? (
               <ReactImageFallback
                  src={buildImageUrl('400x300', product.image)}
                  fallbackImage={product.image}
                  initialImage={<Loader />}
                  alt={product.name}
                  className="image__thumbnail"
               />
            ) : (
               <img src={noProductImage} alt={product.name} />
            )}
         </div>
         {node.addOnLabel && <Label>{node.addOnLabel}</Label>}
         <section tw="flex items-center mb-1">
            <Check
               size={16}
               tw="flex-shrink-0"
               className={`${isActive ? 'active' : ''}`}
            />
            <Styles.GhostLink theme={theme} onClick={openRecipe}>
               {product.name} - {product.label}
            </Styles.GhostLink>
         </section>
         <p tw="mb-1">{product?.additionalText}</p>
         {canAdd() && (
            <Styles.Button
               theme={theme}
               disabled={!node.isAvailable}
               onClick={() => add(node.cartItem)}
               title={
                  node.isAvailable
                     ? 'Add product'
                     : 'This product is out of stock.'
               }
            >
               {node.isAvailable ? (
                  <>
                     {isActive ? 'REPEAT' : 'ADD'}
                     {node.addOnPrice > 0 && ' + '}
                     {node.addOnPrice > 0 &&
                        formatCurrency(Number(node.addOnPrice) || 0)}
                  </>
               ) : (
                  'Out of Stock'
               )}
            </Styles.Button>
         )}
      </Styles.Product>
   )
}

const Styles = {
   Product: styled.li(
      ({ theme }) => css`
         ${tw`relative border flex flex-col bg-white p-2 rounded overflow-hidden`}
         &.active {
            ${tw`border border-2 border-red-400`}
            border-color: ${theme?.highlight ? theme.highlight : '#38a169'}
         }
      `
   ),
   Type: styled.span`
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 1;
   `,
   GhostLink: styled.a(
      ({ theme }) => css`
         ${tw`text-gray-700 cursor-pointer`}
         &:hover {
            color: ${theme?.accent || 'teal'};
         }
      `
   ),
   Button: styled.button(
      ({ theme, disabled }) => css`
         ${tw`text-sm uppercase font-bold tracking-wider border border-2 border-gray-300 rounded p-2 text-gray-500 w-full`}
         ${disabled && tw`cursor-not-allowed text-gray-400`}
         transition: all 0.2s ease-in-out;
         &:hover {
            background: ${theme?.accent || 'teal'};
            color: white;
            border-color: ${theme?.accent || 'teal'};
         }
      `
   ),
}

const Products = styled.ul`
   ${tw`grid gap-3`}
   grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`

const Check = styled(CheckIcon)(
   () => css`
      ${tw`mr-2 stroke-current text-gray-300`}
      &.active {
         ${tw`text-green-700`}
      }
   `
)

const Label = styled.span`
   top: 16px;
   ${tw`
      px-2
      absolute
      rounded-r
      bg-green-500
      text-sm uppercase font-medium tracking-wider text-white
   `}
`
