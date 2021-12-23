import React, { useState } from 'react'
import {
   OnDemandMenu,
   ProductCard,
   BottomCartBar,
   Divider,
   ModifierPopup,
   Button,
   Loader,
} from '../../components'
import { useQuery } from '@apollo/react-hooks'
import _ from 'lodash'
import { CartContext, onDemandMenuContext } from '../../context'
import { PRODUCTS } from '../../graphql'
import classNames from 'classnames'
import * as Scroll from 'react-scroll'
import CartBar from './CartBar'
import { useConfig } from '../../lib'
import { setThemeVariable } from '../../utils'

export const OnDemandOrder = ({ config }) => {
   const { brand } = useConfig()
   const menuType = config?.display?.dropdown?.value[0]?.value
      ? config?.display?.dropdown?.value[0]?.value
      : 'side-nav'
   const numberOfProducts =
      config?.display?.['numberOfProducts']?.value ??
      config?.display?.['numberOfProducts']?.default ??
      2
   const showCategoryLength =
      config?.display?.['showCategoryLength']?.value ??
      config?.display?.['numberOfProducts']?.default ??
      true
   const showCartOnRight =
      config?.display?.['showCartOnRight']?.value ??
      config?.display?.['showCartOnRight']?.default ??
      false

   setThemeVariable('--hern-number-of-products', numberOfProducts)

   const [hydratedMenu, setHydratedMenu] = React.useState([])
   const [status, setStatus] = useState('loading')
   const { onDemandMenu } = React.useContext(onDemandMenuContext)
   const { cartState, addToCart } = React.useContext(CartContext)
   const { isMenuLoading, allProductIds, categories } = onDemandMenu

   const argsForByLocation = React.useMemo(
      () => ({
         params: {
            brandId: brand?.id,
            locationId: 1000,
         },
      }),
      [brand]
   )
   const { loading: productsLoading, error: productsError } = useQuery(
      PRODUCTS,
      {
         skip: isMenuLoading,
         variables: {
            ids: allProductIds,
            priceArgs: argsForByLocation,
            discountArgs: argsForByLocation,
            defaultCartItemArgs: argsForByLocation,
            productOptionPriceArgs: argsForByLocation,
            productOptionDiscountArgs: argsForByLocation,
            productOptionCartItemArgs: argsForByLocation,
            modifierCategoryOptionPriceArgs: argsForByLocation,
            modifierCategoryOptionDiscountArgs: argsForByLocation,
            modifierCategoryOptionCartItemArgs: argsForByLocation,
         },
         fetchPolicy: 'network-only',
         onCompleted: data => {
            if (data && data.products.length) {
               const updatedMenu = categories.map(category => {
                  const updatedProducts = category.products
                     .map(productId => {
                        const found = data.products.find(
                           ({ id }) => id === productId
                        )
                        if (found) {
                           return found
                        }
                        return null
                     })
                     .filter(Boolean)
                  return {
                     ...category,
                     products: updatedProducts,
                  }
               })
               setStatus('success')
               setHydratedMenu(updatedMenu)
            }
         },
         onError: error => {
            setStatus('error')
            console.log('Error: ', error)
         },
      }
   )
   const [productModifier, setProductModifier] = useState(null)
   const CustomArea = props => {
      const { data } = props
      return (
         <div className="hern-on-demand-product-custom-area">
            <Button
               className="hern-custom-area-add-btn"
               type="outline"
               onClick={() => {
                  if (data.productOptions.length > 0) {
                     setProductModifier(data)
                  } else {
                     console.log('product added to cart', data)
                     addToCart({ productId: data.id }, 1)
                  }
               }}
            >
               ADD
            </Button>
            {data.productOptions.length > 0 && <span>Customizable</span>}
         </div>
      )
   }
   const closeModifier = () => {
      setProductModifier(null)
   }

   if (productsError) {
      console.log(productsError)
      return <p>Error</p>
   }
   if (isMenuLoading || status === 'loading' || productsLoading) {
      return <Loader />
   }
   const getWrapperClasses = () => {
      if (menuType === 'fixed-top-nav') {
         if (!showCartOnRight) {
            return 'hern-on-demand-order-container--fixed-top-nav--full-width'
         }
         return 'hern-on-demand-order-container--fixed-top-nav'
      }
      return ''
   }
   return (
      <>
         {menuType === 'fixed-top-nav' && (
            <OnDemandMenu
               menuType="navigationAnchorMenu"
               categories={categories}
            />
         )}
         <div
            className={classNames(
               'hern-on-demand-order-container',
               getWrapperClasses()
            )}
         >
            <div
               id="hern-on-demand-order-container"
               className={classNames('hern-on-demand-page', {
                  'hern-on-demand-page-pop-up--active': productModifier,
               })}
            >
               <div
                  className={classNames('hern-on-demand-page-content', {
                     'hern-on-demand-page-content--navigationAnchor--active': false,
                  })}
               >
                  {hydratedMenu.map((eachCategory, index) => {
                     return (
                        <Scroll.Element key={index} name={eachCategory.name}>
                           <p
                              className="hern-product-category-heading"
                              id={`hern-product-category-${eachCategory.name}`}
                           >
                              {eachCategory.name}
                              {showCategoryLength && (
                                 <>({eachCategory.products.length})</>
                              )}
                           </p>
                           <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                              {eachCategory.products.map(
                                 (eachProduct, index) => {
                                    return (
                                       <div
                                          key={index}
                                          className="hern-on-demand-order--product-card"
                                       >
                                          <ProductCard
                                             key={index}
                                             data={eachProduct}
                                             showProductDescription={true}
                                             showImage={
                                                eachProduct.assets.images
                                                   .length > 0
                                                   ? true
                                                   : false
                                             }
                                             customAreaComponent={CustomArea}
                                             showModifier={
                                                productModifier &&
                                                productModifier.id ===
                                                   eachProduct.id
                                             }
                                             closeModifier={closeModifier}
                                             customAreaFlex={false}
                                             modifierWithoutPopup={false}
                                          />
                                       </div>
                                    )
                                 }
                              )}
                           </div>
                           <Divider />
                        </Scroll.Element>
                     )
                  })}
               </div>
            </div>
            {menuType !== 'fixed-top-nav' && (
               <OnDemandMenu categories={categories} />
            )}
            {cartState.cart &&
               cartState.cart?.products?.aggregate?.count !== 0 && (
                  <BottomCartBar />
               )}
            {showCartOnRight && <CartBar />}
         </div>
      </>
   )
}
