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

   const { config, productData } = props
   const { t, locale } = useTranslation()
   const [showModifier, setShowModifier] = useState(false)
   const [availableQuantityInCart, setAvailableQuantityInCart] = useState(0)
   const [lLang, setLLang] = useState(locale)

   const [combinedCartItems, setCombinedCartData] = useState(null)

   const trans = strings => {
      console.log('locale', lLang)
      // const regFetcher = () => {
      //    switch (lLang) {
      //       case 'en':
      //          return /\##EN##(.*?)\##EN##/g
      //       case 'ar':
      //          return /\##AR##(.*?)\##AR##/g
      //       default:
      //          return /\##DEF##(.*?)\##DEF##/g
      //    }
      // }
      // const regFetcher2 = () => {
      //    switch (lLang) {
      //       case 'en':
      //          return '##EN##'
      //       case 'ar':
      //          return '##AR##'
      //       default:
      //          return '##DEF##'
      //    }
      // }
      // let reg = regFetcher()
      // let reg2 = regFetcher2()
      // console.log(reg, reg2, 'hello')

      strings.forEach(x => {
         if (lLang === 'en') {
            if (x.innerHTML.match(/\##EN##(.*?)\##EN##/g)) {
               x.innerHTML = x.innerHTML[0].replaceAll('##EN##', '')
            }
         }
         if (lLang === 'ar') {
            if (x.innerHTML.match(/\##AR##(.*?)\##AR##/g)) {
               x.innerHTML = x.innerHTML[0].replaceAll('##AR##', '')
            }
         }
      })
   }
   // useEffect(() => {
   //    const translateString = document.querySelectorAll('span')
   //    trans(translateString)
   // }, [])

   useEffect(() => {
      if (cartState.cart) {
         const combinedCartItemsUF = combineCartItems(cartState.cart.products)
         console.log('combinedCartItemsUF', combinedCartItemsUF)
         const allCartItemsIdsForThisProducts = combinedCartItemsUF
            .filter(x => x.productId === productData.id)
            .map(x => x.ids)
            .flat().length
         setAvailableQuantityInCart(allCartItemsIdsForThisProducts)
         setCombinedCartData(combinedCartItemsUF)
      } else {
         setCombinedCartData([])
      }
   }, [cartState.cart])

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
                           console.log(
                              'combinedCartItems',
                              combinedCartItems.ids,
                              combinedCartItems
                           )
                           onMinusClick([
                              combinedCartItems.ids[
                                 combinedCartItems.ids.length - 1
                              ],
                           ])
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
            />
         )}
      </>
   )
}
