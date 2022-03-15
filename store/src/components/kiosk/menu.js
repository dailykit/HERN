import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import {
   Col,
   Layout,
   Menu,
   Row,
   Badge,
   Steps,
   Carousel,
   Space,
   Radio,
   Spin,
} from 'antd'
import { useQueryParamState, formatCurrency } from '../../utils'
import { CartContext, useTranslation } from '../../context'
import { KioskProduct } from './component'
import { PRODUCTS_BY_CATEGORY, PRODUCTS } from '../../graphql'
import { useConfig } from '../../lib'
import { useQuery } from '@apollo/react-hooks'
import {
   ArrowLeftIcon,
   ArrowLeftIconBG,
   ArrowRightIcon,
   CartIcon,
} from '../../assets/icons'
import { Divider } from '../../components'
import { ProgressBar } from './component/progressBar'
import { PromotionCarousal } from '../../sections/promotionCarousel'
import * as Scroll from 'react-scroll'
import { HernLazyImage } from '../../utils/hernImage'

const { Content, Sider, Header, Footer } = Layout
const { Step } = Steps

export const MenuSection = props => {
   const { brand, isConfigLoading, kioskDetails, isStoreAvailable } =
      useConfig()
   const carousalRef = React.useRef()

   const { config, setCurrentPage } = props
   const [category, changeCategory, deleteCategory] =
      useQueryParamState('productCategoryId')
   // console.log('fromMenuSection')

   const [menuData, setMenuData] = useState({
      categories: [],
      allProductIds: [],
      isMenuLoading: true,
   })
   const [status, setStatus] = useState('loading')
   const [hydratedMenu, setHydratedMenu] = React.useState([])

   const argsForByLocation = React.useMemo(
      () => ({
         params: {
            brandId: brand?.id,
            locationId: kioskDetails?.locationId,
         },
      }),
      [brand]
   )
   // useEffect(() => {
   //    const translateString = document.querySelectorAll("span");
   //    t(translateString);

   //  }, []);

   const date = React.useMemo(() => new Date(Date.now()).toISOString(), [])
   // get all categories by locationId, brandId and collection(s) provide to kiosk(by config)
   const { error: menuError } = useQuery(PRODUCTS_BY_CATEGORY, {
      skip: isConfigLoading || !brand?.id,
      variables: {
         params: {
            brandId: brand?.id,
            date,
            ...(config.data.collectionData.value.length > 0 && {
               collectionIdArray: config.data.collectionData.value.map(
                  each => each.id
               ),
            }),
            locationId: kioskDetails?.locationId,
         },
      },
      onCompleted: data => {
         // console.log('v2Data', data)
         if (data?.onDemand_getMenuV2copy?.length) {
            const [res] = data.onDemand_getMenuV2copy
            const { menu } = res.data
            const ids = menu.map(category => category.products).flat()
            setMenuData(prev => ({
               ...prev,
               allProductIds: ids,
               categories: menu,
               isMenuLoading: false,
            }))
         }
      },
      onError: error => {
         setMenuData(prev => ({
            ...prev,
            isMenuLoading: false,
         }))
         setStatus('error')
         console.log(error)
      },
   })

   // get all products from productIds getting from PRODUCT_BY_CATEGORY
   const { loading: productsLoading, error: productsError } = useQuery(
      PRODUCTS,
      {
         skip: menuData.isMenuLoading,
         variables: {
            ids: menuData.allProductIds,
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
         // fetchPolicy: 'network-only',
         onCompleted: data => {
            if (data && data.products.length && hydratedMenu.length === 0) {
               const updatedMenu = menuData.categories.map(category => {
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

   const memoHydratedMenu = React.useMemo(() => hydratedMenu, [hydratedMenu])
   const lastCarousal = e => {
      e.stopPropagation()
      carousalRef.current.prev()
   }
   const nextCarousal = e => {
      e.stopPropagation()
      carousalRef.current.next()
   }

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
               <Header
                  style={{
                     background: `${config.kioskSettings.theme.primaryColorLight.value}`,
                     padding: '1em 2em',
                     height: '6em',
                  }}
               >
                  <ProgressBar
                     config={config}
                     setCurrentPage={setCurrentPage}
                  />
               </Header>
               <Content className="hern-kiosk__menu-promotion-coupons">
                  <PromotionCarousal config={config} />
               </Content>
            </Layout>
         </Content>
         <KioskMenu
            config={config}
            categoryId={category}
            changeCategory={changeCategory}
            kioskMenus={memoHydratedMenu}
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
   const [selectedCategory, setSelectedCategory] = useState(
      (categoryId && categoryId.toString()) || '0'
   )

   const { t, dynamicTrans } = useTranslation()

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

   return (
      <Layout
         style={{
            height: `calc(100vh - ${isStoreAvailable ? '35em' : '40em'})`,
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
               {kioskMenus.map((eachCategory, index) => {
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
                                 data-original-value={eachCategory.name}
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
                     <Col span={21} className="hern-kiosk__menu-header-col-1">
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
                     <Col
                        span={3}
                        className="hern-kiosk__menu-header-col-2"
                        onClick={() => {
                           setCurrentPage('cartPage')
                        }}
                     >
                        <CartIcon size={43} />
                        <div
                           style={{
                              position: 'absolute',
                              top: '-2em',
                              right: '1.5em',
                           }}
                        >
                           <Badge
                              count={
                                 cart?.cartItems_aggregate?.aggregate?.count ||
                                 0
                              }
                           />
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
                                       cart?.cartOwnerBilling?.balanceToPay
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
                  </Row>
               </Header>
               <Content
                  className="hern-kiosk__menu-product-list"
                  id="hern-kiosk__menu-list"
               >
                  {kioskMenus.map((eachCategory, index) => {
                     // VegNonVegTYpe change into type
                     const groupedByType = React.useMemo(() => {
                        const data = _.chain(eachCategory.products)
                           .groupBy('VegNonVegType')
                           .map((value, key) => ({
                              type: key,
                              products: value,
                           }))
                           .value()
                        const nullData = data.filter(x => x.type === 'null')
                        const nonNullData = data.filter(x => x.type !== 'null')
                        return [...nonNullData, ...nullData]
                     }, [])
                     const [currentGroupProducts, setCurrentGroupedProduct] =
                        useState(groupedByType[0].products)
                     const [currentGroup, setCurrentGroup] = useState(
                        groupedByType[0].type
                     )

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
                           <div name={eachCategory.name} ref={menuRef}></div>
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
                                 data-original-value={eachCategory.name}
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
                                             onClick={() =>
                                                onRadioClick(eachType.type)
                                             }
                                             // value={eachType.type}
                                             key={eachType.type}
                                             className="hern-kiosk__menu-product-type-radio-btn"
                                             data-translation="true"
                                             data-original-value={eachType.type}
                                             style={{
                                                backgroundColor:
                                                   currentGroup ===
                                                   eachType.type
                                                      ? config.kioskSettings
                                                           .theme.primaryColor
                                                           .value
                                                      : config.kioskSettings
                                                           .theme
                                                           .primaryColorLight
                                                           .value,
                                                color:
                                                   currentGroup ===
                                                   eachType.type
                                                      ? '#ffffff'
                                                      : config.kioskSettings
                                                           .theme.primaryColor
                                                           .value,
                                                borderRadius: '0.5em',
                                                border:
                                                   currentGroup ===
                                                   eachType.type
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
                           <Row
                              gutter={[16, 16]}
                              style={{ marginBottom: '2em' }}
                           >
                              {currentGroupProducts.map(
                                 (eachProduct, index2) => {
                                    return (
                                       <Col
                                          span={8}
                                          className="gutter-row"
                                          key={eachProduct?.id}
                                       >
                                          <KioskProduct
                                             config={config}
                                             productData={eachProduct}
                                             setCurrentPage={setCurrentPage}
                                          />
                                       </Col>
                                    )
                                 }
                              )}
                           </Row>
                           <Divider />
                        </Scroll.Element>
                     )
                  })}
               </Content>
            </Layout>
         </Content>
      </Layout>
   )
}
