import React from 'react'
import Link from 'next/link'
import { uniqBy } from 'lodash'
import { useQuery, useSubscription } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'
import classNames from 'classnames'

import { useMenu } from '../../state'
import { useConfig } from '../../../../lib'
import { useUser } from '../../../../context'
import { formatCurrency } from '../../../../utils'
import { PlusIcon, CloseIcon, CheckIcon } from '../../../../assets/icons'
import { Tunnel, Loader, Button, CartProduct } from '../../../../components'
import {
   OCCURENCE_ADDON_PRODUCTS_BY_CATEGORIES,
   OCCURENCE_ADDON_PRODUCTS_AGGREGATE,
} from '../../../../graphql'

const AddOnProducts = () => {
   const { user } = useUser()
   const { state, methods } = useMenu()
   const [tunnel, toggleTunnel] = React.useState(false)

   const {
      loading: productsAggregateLoading,
      data: { productsAggregate = {} } = {},
   } = useSubscription(OCCURENCE_ADDON_PRODUCTS_AGGREGATE, {
      variables: {
         occurenceId: { _eq: state?.week?.id },
         subscriptionId: { _eq: user?.subscriptionId },
      },
   })

   React.useEffect(() => {
      if (
         !productsAggregateLoading &&
         state.isCartFull &&
         productsAggregate?.aggregate?.count > 0
      ) {
         toggleTunnel(state.isCartFull)
      }
   }, [state.isCartFull, productsAggregateLoading])

   const isRemovable =
      ['CART_PENDING', undefined].includes(
         state?.occurenceCustomer?.cart?.status
      ) && state?.week?.isValid

   let hasAddOns =
      state?.occurenceCustomer?.cart?.products?.filter(node => node.isAddOn)
         .length > 0

   return (
      <div>
         {hasAddOns && (
            <>
               <header className="hern-cart-add-on-products__header">
                  <h4 className="hern-cart-add-on-products__header__title">
                     Your Add Ons
                  </h4>
                  <button
                     onClick={() => toggleTunnel(true)}
                     className="hern-cart-add-on-products__header__explore-btn"
                  >
                     Explore
                     <span>
                        <PlusIcon
                           size={16}
                           stroke="currentColor"
                           color="rgba(52,211,153,1)"
                        />
                     </span>
                  </button>
               </header>
               <ul className="hern-cart-add-on-products__list">
                  {state?.occurenceCustomer?.cart?.products?.map(
                     product =>
                        product.isAddOn && (
                           <CartProduct
                              product={product}
                              key={product.id}
                              isRemovable={isRemovable}
                              onDelete={methods.products.delete}
                           />
                        )
                  )}
               </ul>
            </>
         )}
         {tunnel && (
            <Tunnel.Wrapper
               size="md"
               isOpen={tunnel}
               style={{ zIndex: 1030 }}
               toggleTunnel={() => toggleTunnel(false)}
            >
               <Tunnel.Header title="Add Ons">
                  <Button size="sm" onClick={() => toggleTunnel(false)}>
                     <CloseIcon size={20} stroke="currentColor" />
                  </Button>
               </Tunnel.Header>
               <Tunnel.Body>
                  <AddOns />
               </Tunnel.Body>
            </Tunnel.Wrapper>
         )}
      </div>
   )
}

export default AddOnProducts

const AddOns = () => {
   const { user } = useUser()
   const { state } = useMenu()
   const { configOf } = useConfig()
   const { addToast } = useToasts()

   const { loading, data: { categories = [] } = {} } = useQuery(
      OCCURENCE_ADDON_PRODUCTS_BY_CATEGORIES,
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
         node => node.subscriptionOccurenceAddOnProductId === id
      )
      return index === -1 ? false : true
   }

   const theme = configOf('theme-color', 'Visual')
   if (loading) return <Loader inline />
   if (categories.length === 0) return <div>No Add Ons Available</div>
   return (
      <div>
         {categories.map(category => (
            <section key={category.name} className="hern-cart-add-ons__section">
               <h4 className="hern-cart-add-ons__section__title">
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
               <ul className="hern-add-ons__products__list">
                  {uniqBy(category.productsAggregate.nodes, v =>
                     [
                        v?.cartItem?.productId,
                        v?.cartItem?.productOptionId,
                     ].join()
                  ).map(node => (
                     <AddOnProduct
                        node={node}
                        theme={theme}
                        key={node.id}
                        isAdded={isAdded}
                     />
                  ))}
               </ul>
            </section>
         ))}
      </div>
   )
}

const AddOnProduct = ({ node, isAdded, theme }) => {
   const { state, methods } = useMenu()

   const canAdd = () => {
      const conditions = [!node.isSingleSelect, state?.week?.isValid]
      return (
         conditions.every(node => node) ||
         ['CART_PENDING', undefined].includes(
            state.occurenceCustomer?.cart?.status
         )
      )
   }

   const isActive = isAdded(node?.cartItem?.subscriptionOccurenceAddOnProductId)
   const product = {
      name: node?.productOption?.product?.name || '',
      label: node?.productOption?.label || '',
      image:
         node?.productOption?.product?.assets?.images?.length > 0
            ? node?.productOption?.product?.assets?.images[0]
            : null,
      additionalText: node?.productOption?.product?.additionalText || '',
   }
   const productListItem = classNames('hern-add-on__products__list-item', {
      'hern-add-on__products__list-item--active': isActive,
   })
   const checkIconClasses = classNames(
      'hern-add-on__products__list-item__check-icon',
      { 'hern-add-on__products__list-item__check-icon--active': isActive }
   )
   return (
      <li className={productListItem}>
         <div className="hern-add-on__products__list-item__img">
            {product.image ? (
               <img
                  alt={product.name}
                  src={product.image}
                  title={product.name}
               />
            ) : (
               <span>No Photos</span>
            )}
         </div>
         <div className="hern-add-on__products__list-item__info">
            <section className="hern-add-on__products__list-item__title">
               <CheckIcon size={16} className={checkIconClasses} />
               <Link href={`#`}>
                  <>
                     {product.name} - {product.label}
                  </>
               </Link>
            </section>
            {canAdd() && (
               <button
                  onClick={() => methods.products.add(node.cartItem)}
                  className="hern-add-on__products__list-item__add-btn"
               >
                  {isActive ? 'REPEAT +' : 'ADD +'}
                  {formatCurrency(Number(node.cartItem.unitPrice) || 0)}
               </button>
            )}
         </div>
         <p>{product.additionalText}</p>
      </li>
   )
}
