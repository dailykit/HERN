import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import { Col, Layout, Menu, Row, Spin, Switch } from 'antd'
import { useQueryParamState, formatCurrency } from '../../utils'
import { CartContext, useTranslation } from '../../context'
import { KioskProduct } from './component'
import { useConfig } from '../../lib'
import { useQuery } from '@apollo/react-hooks'
import { CartIcon } from '../../assets/icons'
import { Divider } from '../../components'
import { ProgressBar } from './component/progressBar'
import { PromotionCarousal } from '../../sections/promotionCarousel'
import * as Scroll from 'react-scroll'
import { HernLazyImage } from '../../utils/hernImage'
import KioskButton from './component/button'

const { Content, Sider, Header, Footer } = Layout

export const MenuSection = props => {
   const { config, setCurrentPage, hydratedMenu, status } = props
   const [category, changeCategory, deleteCategory] =
      useQueryParamState('productCategoryId')
   // console.log('fromMenuSection')

   if (status === 'loading') {
      return (
         <div
            style={{
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               height: '100%',
            }}
         >
            <Spin size="large" tip="Loading Menu..." />
         </div>
      )
   }
   if (status === 'error') {
      return <div>Somthing went wring</div>
   }
   return (
      <Layout>
         <Content>
            {/* Promotion, coupons and progress bar */}
            <Layout style={{ height: '100%' }}>
               <ProgressBar config={config} setCurrentPage={setCurrentPage} />
               <Content className="hern-kiosk__menu-promotion-coupons">
                  <PromotionCarousal config={config} />
               </Content>
            </Layout>
         </Content>
         <KioskMenu
            config={config}
            categoryId={category}
            changeCategory={changeCategory}
            kioskMenus={hydratedMenu}
            setCurrentPage={setCurrentPage}
         />
      </Layout>
   )
}

const KioskMenu = props => {
   //
   // warning do not use loader in this component
   //
   const { config, kioskMenus, setCurrentPage } = props
   const { categoryId, changeCategory } = props

   const { cartState, showCartIconToolTip } = React.useContext(CartContext)
   const { cart } = cartState
   const { isStoreAvailable } = useConfig()

   const menuRef = React.useRef()
   const kioskFinalMenu = React.useMemo(() => {
      if (showVegMenuOnly) {
         return vegMenu
      } else {
         return kioskMenus
      }
   }, [kioskMenus, showVegMenuOnly])

   const [selectedCategory, setSelectedCategory] = useState(
      (categoryId && categoryId.toString()) ||
         kioskFinalMenu
            .findIndex(x => x.isCategoryPublished && x.isCategoryAvailable)
            .toString()
   )
   const [showVegMenuOnly, setShowVegMenuOnly] = useState(false)
   const [vegMenu, setVegMenu] = useState(null)
   const { t, dynamicTrans, direction } = useTranslation()

   const onCategorySelect = e => {
      setSelectedCategory(e.key)
      // changeCategory(e.key)
   }
   useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [])
   useEffect(() => {
      const kioskMenusClone = JSON.parse(JSON.stringify(kioskMenus))
      const filteredVegMenu = kioskMenusClone
         .map(eachCategory => {
            const vegProductInCategory = eachCategory.products.filter(
               eachProduct =>
                  eachProduct.VegNonVegType &&
                  (eachProduct['VegNonVegType'].toUpperCase() === 'VEG' ||
                     eachProduct['VegNonVegType'].toUpperCase() ===
                        'VEGETARIAN')
            )
            eachCategory.products = vegProductInCategory
            return eachCategory
         })
         .filter(eachCategory => eachCategory.products.length > 0)
      setVegMenu(filteredVegMenu)
   }, [kioskMenus])

   return (
      <Layout
         style={{
            height: `calc(100vh - ${isStoreAvailable ? '37em' : '42em'})`,
         }}
      >
         <Sider
            width={250}
            theme={'light'}
            className="hern-kiosk__menu-category-side-bar"
         >
            <Menu
               theme={'light'}
               mode={'vertical'}
               onSelect={onCategorySelect}
               defaultSelectedKeys={[selectedCategory]}
            >
               {kioskFinalMenu.map((eachCategory, index) => {
                  if (!eachCategory.isCategoryPublished) {
                     return null
                  }
                  return (
                     <Menu.Item key={index} style={{ height: '13em' }}>
                        <div
                           className="hern-kiosk__menu-page-product-category"
                           style={{
                              ...(index == selectedCategory && {
                                 border: ` 4px solid ${config.kioskSettings.theme.primaryColor.value}`,
                              }),
                           }}
                        >
                           <Scroll.Link
                              containerId="hern-kiosk__menu-list"
                              smooth={true}
                              // activeClass="hern-on-demand-menu__navigationAnchor-li--active"
                              onSetActive={to => {
                                 setSelectedCategory(index)
                                 // changeCategory(index)
                                 // console.log('thisIsTo', to)
                              }}
                              to={eachCategory.name}
                              spy={true}
                              className="hern-kiosk__category-scroll-link"
                           >
                              <HernLazyImage
                                 dataSrc={
                                    eachCategory?.imageUrl ||
                                    config.productSettings.defaultImage.value
                                 }
                                 alt="category image"
                                 style={{ width: '100px', height: '100px' }}
                                 width={100}
                                 height={100}
                                 className="hern-kiosk__menu-page-product-category-image"
                              />
                              <span
                                 className="hern-kiosk__menu-page-product-category-title"
                                 style={{
                                    ...((index == selectedCategory ||
                                       index == categoryId) && {
                                       color: `${config.kioskSettings.theme.primaryColor.value}`,
                                    }),
                                 }}
                                 data-translation="true"
                              >
                                 {eachCategory.name}
                              </span>
                           </Scroll.Link>
                        </div>
                     </Menu.Item>
                  )
               })}
            </Menu>
         </Sider>
         <Content>
            <Layout style={{ height: '100%', backgroundColor: '#fff' }}>
               <Header theme={'light'} className="hern-kiosk__menu-header">
                  <Row className="hern-kiosk__menu-header-row">
                     {config.menuSettings?.showVegToggle?.value && (
                        <Col
                           span={4}
                           className="hern-kiosk__menu-header-veg-switch"
                        >
                           <span className="hern-kiosk__menu-header-veg-text">
                              {t('VEG')}
                           </span>
                           <Switch
                              onClick={checked => {
                                 setShowVegMenuOnly(checked)
                              }}
                           />
                           {/* <button
                           onClick={checked => {
                              setShowVegMenuOnly(prev => !prev)
                           }}
                        >
                           veg
                        </button> */}
                        </Col>
                     )}
                     <Col
                        span={
                           config.menuSettings?.showVegToggle?.value ? 14 : 18
                        }
                        className="hern-kiosk__menu-header-col-1"
                     >
                        <Row>
                           <Col
                              span={24}
                              className="hern-kiosk__menu-header-heading"
                              style={{
                                 color: `${config.kioskSettings.theme.primaryColor.value}`,
                              }}
                           >
                              {t('Menu')}
                           </Col>
                        </Row>
                     </Col>
                     {isStoreAvailable && (
                        <Col
                           span={6}
                           className="hern-kiosk__menu-header-col-2"
                           onClick={() => {
                              setCurrentPage('cartPage')
                           }}
                        >
                           <KioskButton
                              customClass="hern-kiosk__goto-cart-btn"
                              buttonConfig={config.kioskSettings.buttonSettings}
                           >
                              <CartIcon
                                 size={25}
                                 stroke={
                                    config.kioskSettings.buttonSettings
                                       .textColor.value
                                 }
                              />
                              <span
                                 className="hern-kiosk__goto-cart-btn-text"
                                 style={{
                                    color: `${config.kioskSettings.buttonSettings.textColor.value}`,
                                 }}
                              >
                                 {t('Go To Cart')}
                              </span>
                           </KioskButton>
                           <div
                              style={{
                                 position: 'absolute',
                                 top: '-1.2em',
                                 right: '-17px',
                              }}
                           >
                              {cart?.cartItems_aggregate?.aggregate?.count >
                                 0 && (
                                 <span className="hern-kiosk__cart-item-badge">
                                    {
                                       cart?.cartItems_aggregate?.aggregate
                                          ?.count
                                    }
                                 </span>
                              )}
                           </div>
                           {cart?.cartItems_aggregate?.aggregate?.count > 0 &&
                              showCartIconToolTip && (
                                 <div className="hern-kiosk__cart-tool-tip">
                                    <span
                                       className="hern-kiosk__cart-tool-tip-text"
                                       style={{
                                          background:
                                             config.kioskSettings.theme
                                                .secondaryColorLight.value,
                                          color: config.kioskSettings.theme
                                             .primaryColor.value,
                                       }}
                                    >
                                       {
                                          cart?.cartItems_aggregate?.aggregate
                                             ?.count
                                       }{' '}
                                       {cart?.cartItems_aggregate?.aggregate
                                          ?.count === 1
                                          ? t('Item')
                                          : t('Items')}{' '}
                                       {formatCurrency(
                                          cart?.cartOwnerBilling?.totalToPay
                                       )}
                                    </span>
                                    <div
                                       className="hern-kiosk__cart-tip"
                                       style={{
                                          background:
                                             config.kioskSettings.theme
                                                .secondaryColorLight.value,
                                       }}
                                    ></div>
                                 </div>
                              )}
                        </Col>
                     )}
                  </Row>
               </Header>
               <Content
                  className="hern-kiosk__menu-product-list"
                  id="hern-kiosk__menu-list"
               >
                  {kioskFinalMenu.map((eachCategory, index) => (
                     <MenuProducts
                        key={eachCategory.name}
                        eachCategory={eachCategory}
                        setCurrentPage={setCurrentPage}
                        config={config}
                     />
                  ))}
               </Content>
            </Layout>
         </Content>
      </Layout>
   )
}
const MenuProducts = ({ setCurrentPage, eachCategory, config }) => {
   const { t, dynamicTrans, direction } = useTranslation()

   // VegNonVegTYpe change into type
   const groupedByType = React.useMemo(() => {
      const data = _.chain(eachCategory.products)
         .groupBy('subCategory')
         .map((value, key) => ({
            type: key,
            products: value,
         }))
         .value()
      const nullData = data.filter(x => x.type === 'null')
      const nonNullData = data.filter(x => x.type !== 'null')
      return [...nonNullData, ...nullData]
   }, [eachCategory])
   const [currentGroupProducts, setCurrentGroupedProduct] = useState(
      groupedByType[0].products
   )

   useEffect(() => {
      setCurrentGroupedProduct(groupedByType[0].products)
   }, [eachCategory])

   const [currentGroup, setCurrentGroup] = useState(groupedByType[0].type)
   const onRadioClick = e => {
      setCurrentGroupedProduct(prev => {
         return groupedByType.find(x => x.type === e).products
      })
      setCurrentGroup(e)
   }
   useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentGroup])
   return (
      <Scroll.Element
         name={eachCategory.name}
         className="hern-kiosk__scroll-element"
         key={eachCategory.name}
      >
         {/* <div name={eachCategory.name} ref={menuRef}></div> */}
         {eachCategory?.bannerImageUrl ? (
            <HernLazyImage
               // src={eachCategory?.bannerImageUrl}
               dataSrc={eachCategory?.bannerImageUrl}
               className="hern-kiosk__menu-category-banner-img"
            />
         ) : (
            <p
               className="hern-kiosk__menu-category-name"
               data-translation="true"
            >
               {eachCategory.name}
            </p>
         )}
         {groupedByType.length > 1 && (
            <div className="hern-kiosk__menu-product-type">
               <div className="hern-kiosk__menu-product-type-list">
                  {groupedByType.map((eachType, index) => {
                     return (
                        <button
                           onClick={() => onRadioClick(eachType.type)}
                           // value={eachType.type}
                           key={eachType.type}
                           className="hern-kiosk__menu-product-type-radio-btn"
                           data-translation="true"
                           style={{
                              backgroundColor:
                                 currentGroup === eachType.type
                                    ? config.kioskSettings.theme.primaryColor
                                         .value
                                    : config.kioskSettings.theme
                                         .primaryColorLight.value,
                              color:
                                 currentGroup === eachType.type
                                    ? '#ffffff'
                                    : config.kioskSettings.theme.primaryColor
                                         .value,
                              borderRadius: '0.5em',
                              border:
                                 currentGroup === eachType.type
                                    ? `1px solid ${config.kioskSettings.theme.successColor.value}`
                                    : 'none',
                           }}
                        >
                           {eachType.type == 'null'
                              ? t('Others')
                              : eachType.type}
                        </button>
                     )
                  })}
               </div>
            </div>
         )}
         <Row gutter={[16, 16]} style={{ marginBottom: '2em' }}>
            {currentGroupProducts.map((eachProduct, index2) => {
               const publishedProductOptions =
                  eachProduct.productOptions.length > 0 &&
                  eachProduct.productOptions.filter(
                     option => option.isPublished
                  ).length == 0

               if (!eachProduct.isPublished || publishedProductOptions) {
                  return null
               }
               return (
                  <Col span={8} className="gutter-row" key={eachProduct?.id}>
                     <KioskProduct
                        config={config}
                        productData={eachProduct}
                        setCurrentPage={setCurrentPage}
                     />
                  </Col>
               )
            })}
         </Row>
         <Divider />
      </Scroll.Element>
   )
}
