import React from 'react'
import { useRouter } from 'next/router'
import { isEmpty, uniqBy } from 'lodash'
import { useQuery } from '@apollo/react-hooks'
import ReactImageFallback from 'react-image-fallback'
import { useToasts } from 'react-toast-notifications'

import { useMenu } from './state'
import { useConfig } from '../../lib'
import { useUser } from '../../context'
import { HelperBar, Loader } from '../../components'
import { formatCurrency, getRoute, isClient, debounce } from '../../utils'
import { SkeletonProduct } from './skeletons'
import { CheckIcon } from '../../assets/icons'
import { OCCURENCE_PRODUCTS_BY_CATEGORIES } from '../../graphql'
import classNames from 'classnames'
import moment from 'moment'
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
         <main className="hern-select-menu__menu__helper-bar">
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
            <section key={category.name} className="hern-select-menu__menu">
               <h4 className="hern-select-menu__menu__category-name">
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
               <ul className="hern-select-menu__menu__products">
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
               </ul>
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

   const add = debounce(function (item, node) {
      if (state.occurenceCustomer?.betweenPause) {
         return addToast('You have paused your plan!', {
            appearance: 'warning',
         })
         return
      }
      methods.products.add(item, node?.productOption?.product)
   }, 500)

   const isActive = isAdded(node?.cartItem?.subscriptionOccurenceProductId)
   const canAdd = () => {
      if (!state?.week?.isValid) {
         return false
      }
      if (
         ['CART_PENDING', undefined].includes(
            state.occurenceCustomer?.cart?.status
         )
      ) {
         let isMultiSelect = !node.isSingleSelect
         let isSingleSelect = node.isSingleSelect

         if (isMultiSelect) return true

         if (isSingleSelect && !isActive) return true
      }

      return false
   }

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
   const productClasses = classNames('hern-select-menu__menu__product', {
      'hern-select-menu__menu__product--active': isActive,
   })
   const checkIconClasses = classNames(
      'hern-select-menu__menu__product__link__check-icon',
      { 'hern-select-menu__menu__product__link__check-icon--active': isActive }
   )
   const btnClasses = classNames('hern-select-menu__menu__product__btn', {
      'hern-select-menu__menu__product__btn--disabled': !node.isAvailable,
   })

   React.useEffect(() => {
      const elem = document.querySelector(
         '[data-stylesheet="hern-select-menu__menu"]'
      )
      if (!elem) {
         document.head.insertAdjacentHTML(
            'beforeend',
            `<style data-stylesheet="hern-select-menu__menu">
            .hern-select-menu__menu__product__link>a:hover {
                  color: ${theme?.accent || 'teal'}!important;
            }
            .hern-select-menu__menu__product__btn:hover{
               background: ${theme?.accent || 'teal'};
               color: white;
               border-color: ${theme?.accent || 'teal'};
            }
            </style>`
         )
      }
   }, [])

   return (
      <li
         className={productClasses}
         style={{
            borderColor: `${theme?.highlight ? theme.highlight : '#38a169'}`,
         }}
      >
         {!!product.type && (
            <span className="hern-select-menu__menu__product__type">
               <img
                  alt="Non-Veg Icon"
                  src={
                     product.type === 'Non-vegetarian'
                        ? '/imgs/non-veg.png'
                        : '/imgs/veg.png'
                  }
                  title={product.type}
                  className="hern-select-menu__menu__product__type__img"
               />
            </span>
         )}
         <div
            className="hern-select-menu__menu__product__img"
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
         {node.addOnLabel && (
            <span className="hern-select-menu__menu__product__add-on-label">
               {node.addOnLabel}
            </span>
         )}
         <section className="hern-select-menu__menu__product__link">
            <CheckIcon size={16} className={checkIconClasses} />
            <a theme={theme} onClick={openRecipe}>
               {product.name} - {product.label}
            </a>
         </section>
         <p className="hern-select-menu__menu__product__link__additional-text">
            {product?.additionalText}
         </p>
         {canAdd() && (
            <button
               className={btnClasses}
               theme={theme}
               disabled={!node.isAvailable}
               onClick={() => add(node.cartItem, node)}
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
            </button>
         )}
      </li>
   )
}
