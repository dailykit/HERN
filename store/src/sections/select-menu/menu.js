import React from 'react'
import { useRouter } from 'next/router'
import { isEmpty, uniqBy } from 'lodash'
import { useQuery } from '@apollo/react-hooks'
import ReactImageFallback from 'react-image-fallback'
import { useToasts } from 'react-toast-notifications'
import { useIntl } from 'react-intl'
import * as Scroll from 'react-scroll'

import { useMenu } from './state'
import { useConfig } from '../../lib'
import { useUser, useTranslation } from '../../context'
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
   const { t, dynamicTrans, locale } = useTranslation()
   const { state } = useMenu()
   const { brand, locationId, brandLocation } = useConfig()
   const { configOf, buildImageUrl, noProductImage } = useConfig()

   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, locationId, brandLocation?.id]
   )

   const { loading, data: { categories = [] } = {} } = useQuery(
      OCCURENCE_PRODUCTS_BY_CATEGORIES,
      {
         skip: !brand?.id || !locationId || !brandLocation?.id,
         variables: {
            occurenceId: { _eq: state?.week?.id },
            subscriptionId: { _eq: user?.subscriptionId },
            params: argsForByLocation,
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

   const currentLang = React.useMemo(() => locale, [locale])
   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])

   if (loading) return <SkeletonProduct />
   if (isEmpty(categories))
      return (
         <main className="hern-select-menu__menu__helper-bar">
            <HelperBar>
               <HelperBar.SubTitle>
                  {t('No products available yet!')}
               </HelperBar.SubTitle>
            </HelperBar>
         </main>
      )
   return (
      <main>
         {categories.length > 1 && (
            <div className="hern-select-menu__category">
               {categories.map(category => (
                  <Scroll.Link
                     to={category.name}
                     activeClass="hern-select-menu__category__btn--active"
                     className="hern-select-menu__category__btn"
                     spy={true}
                     smooth={true}
                     offset={-70}
                  >
                     {category.name}
                  </Scroll.Link>
               ))}
            </div>
         )}
         {categories.map(category => (
            <Scroll.Element
               id={category.name}
               key={category.name}
               className="hern-select-menu__menu"
            >
               <h4 className="hern-select-menu__menu__category-name">
                  <span data-translation="true">{category.name}</span> (
                  {
                     uniqBy(category.productsAggregate.nodes, v =>
                        [
                           v?.cartItem?.productId,
                           v?.cartItem?.productOptionId,
                        ].join()
                     ).length
                  }
                  )
                  <Line />
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
            </Scroll.Element>
         ))}
      </main>
   )
}

const Product = ({ node, theme, isAdded, noProductImage, buildImageUrl }) => {
   // const router = useRouter()
   const { addToast } = useToasts()
   const { state, methods } = useMenu()
   const { t, dynamicTrans, locale } = useTranslation()
   const { formatMessage } = useIntl()
   const openRecipe = () => {
      window.open(
         getRoute(`/recipes/${node?.productOption?.id}`),
         '_blank',
         'noopener,noreferrer'
      )
      // router.push(getRoute(`/recipes/${node?.productOption?.id}`))
   }

   // const add = debounce(function (item, node) {
   //    if (state.occurenceCustomer?.betweenPause) {
   //       return addToast('You have paused your plan!', {
   //          appearance: 'warning',
   //       })
   //       return
   //    }
   //    methods.products.add(item, node?.productOption?.product)
   // }, 500)
   const add = (item, node) => {
      if (state.occurenceCustomer?.betweenPause) {
         return addToast(t('You have paused your plan!'), {
            appearance: 'warning',
         })
      }
      if (state.occurenceCustomer?.validStatus?.itemCountValid) {
         addToast(t("You're cart is already full!"), {
            appearance: 'warning',
         })
         return
      }
      methods.products.add(item, node?.productOption?.product)
   }
   const isActive = isAdded(node?.cartItem?.subscriptionOccurenceProductId)
   const ProductIsPublished =
      node?.productOption?.product?.isPublished &&
      node?.productOption?.isPublished &&
      !node?.productOption.product.isArchived &&
      !node?.productOption?.isArchived

   const ProductIsAvailable =
      node?.productOption?.product?.isAvailable &&
      node?.productOption?.isAvailable

   const isProductOutOfStock = React.useMemo(() => {
      if (ProductIsAvailable) {
         if (
            node?.productOption.length > 0 &&
            node?.productOption?.product?.isPopupAllowed
         ) {
            const availableProductOptions = node?.productOption.filter(
               option =>
                  option.isPublished && option.isAvailable && !option.isArchived
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
   }, [node])

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

      return true
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
   const currentLang = React.useMemo(() => locale, [locale])
   React.useEffect(() => {
      const elem = document.querySelector(
         '[data-stylesheet="hern-select-menu__menu"]'
      )
      if (!elem) {
         document.head.insertAdjacentHTML(
            'beforeend',
            `<style data-stylesheet="hern-select-menu__menu">
            .hern-select-menu__menu__product__link>a:hover {
                  color: var(--hern-accent)!important;
            }
            .hern-select-menu__menu__product__btn:hover{
               background: var(--hern-accent);
               color: white;
               border-color: var(--hern-accent);
            }
            </style>`
         )
      }
   }, [])

   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])

   if (!ProductIsPublished) {
      return null
   }
   return (
      <li
         className={productClasses}
         style={{
            borderColor: `${theme?.highlight ? theme.highlight : '#38a169'}`,
            opacity: `${isProductOutOfStock ? 0.6 : 1}`,
         }}
      >
         {!!product.type && (
            <span className="hern-select-menu__menu__product__type">
               <img
                  alt="Non-Veg Icon"
                  src={
                     product.type === 'Non-vegetarian'
                        ? '/assets/imgs/non-veg.png'
                        : '/assets/imgs/veg.png'
                  }
                  title={product.type}
                  className="hern-select-menu__menu__product__type__img"
               />
            </span>
         )}
         <div
            className="hern-select-menu__menu__product__img"
            onClick={() => {
               if (!isProductOutOfStock) {
                  openRecipe
               }
            }}
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
            <span
               className="hern-select-menu__menu__product__add-on-label"
               data-translation="true"
            >
               {node.addOnLabel}
            </span>
         )}

         <div style={{ padding: '0.5rem' }}>
            <section className="hern-select-menu__menu__product__link">
               <CheckIcon size={16} className={checkIconClasses} />
               <a theme={theme} onClick={isProductOutOfStock ? '' : openRecipe}>
                  <span data-translation="true">{product.name}</span>
                  {'-'}
                  <span data-translation="true">{product.label}</span>
               </a>
            </section>
            <p
               className="hern-select-menu__menu__product__link__additional-text"
               data-translation="true"
            >
               {product?.additionalText}
            </p>
            {canAdd() && (
               <button
                  className={btnClasses}
                  theme={theme}
                  disabled={
                     !node.isAvailable &&
                     isProductOutOfStock &&
                     state.occurenceCustomer?.validStatus?.itemCountValid
                  }
                  onClick={() => {
                     if (!isProductOutOfStock) {
                        add(node.cartItem, node)
                     }
                  }}
                  title={
                     node.isAvailable && !isProductOutOfStock
                        ? formatMessage({ id: 'Add product' })
                        : formatMessage({
                             id: 'This product is out of stock.',
                          })
                  }
               >
                  {node.isAvailable && !isProductOutOfStock ? (
                     <>
                        {isActive ? t('REPEAT') : t('ADD')}
                        {node.addOnPrice > 0 && ' + '}
                        {node.addOnPrice > 0 &&
                           formatCurrency(Number(node.addOnPrice) || 0)}
                     </>
                  ) : (
                     t('Out of Stock')
                  )}
               </button>
            )}
         </div>
      </li>
   )
}

const Line = () => {
   return (
      <svg
         width="100%"
         height="5"
         viewBox="0 0 750 5"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         style={{ maxWidth: '750px' }}
      >
         <line
            y1="2.86816"
            x2="750"
            y2="2.86816"
            stroke="url(#paint0_linear_1510_6578)"
            stroke-width="4"
         />
         <defs>
            <linearGradient
               id="paint0_linear_1510_6578"
               x1="0"
               y1="4.86816"
               x2="750"
               y2="4.86816"
               gradientUnits="userSpaceOnUse"
            >
               <stop stop-color="#333333" />
               <stop offset="1" stop-color="#333333" stop-opacity="0" />
            </linearGradient>
         </defs>
      </svg>
   )
}
