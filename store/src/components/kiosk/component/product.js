import React, { useState } from 'react'
import { Carousel, Layout } from 'antd'
import KioskButton from './button'
import { useTranslation } from '../../../context'
import { formatCurrency } from '../../../utils'
import { KioskModifier } from '.'

const { Header, Content, Footer } = Layout

const demoProduct = {
   assets: {
      images: [
         'https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/userimages/ckn%20tortilla,and%20mudabbla%20ckn%203rd%20option.png',
         'https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/userimages/SPECIAL%20OFFER%20%20ENGLISH%20RED%20copy.png',
         'https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/userimages/SUPER%20HERFY%20+%20SUPER%20CKN%20MEAL_%20(2).png',
      ],
      videos: [''],
   },
}

export const KioskProduct = props => {
   const { config, productData } = props
   const { t } = useTranslation()
   const [showModifier, setShowModifier] = useState(false)
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
                  {/* {demoProduct.assets.images.length === 0 ? (
                  <img src={config.productSettings.defaultImage.value} />
               ) : (
                  <Carousel
                     className="hern-kiosk__kiosk-product-images-carousal"
                     //  style={{ height: '100%', width: '100%' }}
                  >
                     {demoProduct.assets.images.map((eachImage, index) => (
                        <img
                           src={eachImage}
                           key={index}
                           style={{ height: '100%', width: '100%' }}
                        />
                     ))}
                  </Carousel>
               )} */}
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
                  <KioskButton
                     onClick={() => {
                        setShowModifier(true)
                     }}
                  >
                     {t('Add To Cart')}
                  </KioskButton>
               </Content>
            </Layout>
         </div>
         {showModifier && (
            <KioskModifier
               config={config}
               setShowModifier={setShowModifier}
               productData={productData}
            />
         )}
      </>
   )
}
