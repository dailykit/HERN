import React, { useEffect, useState } from 'react'
import { Carousel, Layout } from 'antd'
import KioskButton from './button'
import { CartContext, useTranslation } from '../../../context'
import { combineCartItems, formatCurrency } from '../../../utils'
import { KioskModifier, KioskCounterButton } from '.'

const { Header, Content, Footer } = Layout

export const KioskProduct = props => {
   // context
   const { cartState, methods, addToCart } = React.useContext(CartContext)

   const { config, productData, setCurrentPage } = props
   const { t, locale, dynamicTrans } = useTranslation()
   const [showModifier, setShowModifier] = useState(false)
   const [availableQuantityInCart, setAvailableQuantityInCart] = useState(0)
   const currentLang = React.useMemo(() => locale, [locale])

   const [combinedCartItems, setCombinedCartData] = useState(null)

   useEffect(() => {
      const translateStringSpan = document.querySelectorAll('span')
      const translateStringDiv = document.querySelectorAll('div')
      const translateStringP = document.querySelectorAll('p')
      const translateStringLi = document.querySelectorAll('li')
      dynamicTrans(translateStringSpan, currentLang)
      dynamicTrans(translateStringDiv, currentLang)
      dynamicTrans(translateStringP, currentLang)
      dynamicTrans(translateStringLi, currentLang)
   }, [currentLang])

   useEffect(() => {
      if (cartState.cartItems) {
         const combinedCartItemsUF = combineCartItems(cartState.cartItems)

         const allCartItemsIdsForThisProducts = combinedCartItemsUF
            .filter(x => x.productId === productData.id)
            .map(x => x.ids)
            .flat().length
         setAvailableQuantityInCart(allCartItemsIdsForThisProducts)
         setCombinedCartData(combinedCartItemsUF)
      } else {
         setCombinedCartData([])
      }
   }, [cartState.cartItems])

   // counter button (-) delete last cartItem
   const onMinusClick = cartItemIds => {
      methods.cartItems.delete({
         variables: {
            where: {
               id: {
                  _in: cartItemIds,
               },
            },
         },
      })
   }

   return (
      <>
         <div className="hern-kiosk__menu-product">
            <Layout style={{ height: '100%' }}>
               <Header className="hern-kiosk__menu-product-header">
                  <div className="hern-kiosk__menu-product-background-shadow"></div>

                  {productData.assets.images.length === 0 ? (
                     <img src={config.productSettings.defaultImage.value} />
                  ) : (
                     <Carousel style={{ height: '20em', width: '20em' }}>
                        {productData.assets.images.map((eachImage, index) => (
                           <img
                              src={eachImage}
                              key={index}
                              style={{ height: '100%', width: '100%' }}
                           />
                        ))}
                     </Carousel>
                  )}
               </Header>
               <Content
                  style={{
                     display: 'flex',
                     flexDirection: 'column',
                     backgroundColor: '#ffffff',
                     justifyContent: 'space-between',
                  }}
               >
                  <div className="hern-kiosk__menu-product-content">
                     <span className="hern-kiosk__menu-product-name">
                        {productData.name}
                     </span>
                     <span className="hern-kiosk__menu-product-description">
                        {productData.additionalText}
                     </span>
                  </div>
                  <span className="hern-kiosk__menu-product-price">
                     {/* <sup></sup> */}
                     {formatCurrency(productData.price)}
                  </span>
                  {availableQuantityInCart === 0 ? (
                     <KioskButton
                        onClick={() => {
                           setShowModifier(true)
                        }}
                     >
                        {t('Add To Cart')}
                     </KioskButton>
                  ) : (
                     <KioskCounterButton
                        config={config}
                        onMinusClick={() => {
                           console.log('combinedCartItems')
                           const idsAv = combinedCartItems
                              .filter(x => x.productId === productData.id)
                              .map(x => x.ids)
                              .flat()
                           onMinusClick([idsAv[idsAv.length - 1]])
                        }}
                        quantity={availableQuantityInCart}
                     />
                  )}
               </Content>
            </Layout>
         </div>
         {showModifier && (
            <KioskModifier
               config={config}
               onCloseModifier={() => {
                  setShowModifier(false)
               }}
               productData={productData}
               setCurrentPage={setCurrentPage}
            />
         )}
      </>
   )
}
