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
} from 'antd'
import { useQueryParamState } from '../../utils'
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

const { Content, Sider, Header, Footer } = Layout
const { Step } = Steps

export const MenuSection = props => {
   const { brand, isConfigLoading } = useConfig()
   const carousalRef = React.useRef()

   const { config, setCurrentPage } = props
   const [category, changeCategory, deleteCategory] =
      useQueryParamState('productCategoryId')
   console.log('fromMenuSection')

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
            locationId: 1000,
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
            locationId: 1000,
         },
      },
      onCompleted: data => {
         console.log('v2Data', data)
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
            if (data && data.products.length) {
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

   console.log('hydratedMenu', hydratedMenu)
   const lastCarousal = e => {
      e.stopPropagation()
      carousalRef.current.prev()
   }
   const nextCarousal = e => {
      e.stopPropagation()
      carousalRef.current.next()
   }

   if (status === 'loading') {
      return <div>Loading</div>
   }
   if (status === 'error') {
      return <div>Somthing went wring</div>
   }
   return (
      <Layout>
         <Content style={{ height: '25em' }}>
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
               <Content
                  className="hern-kiosk__menu-promotion-coupons"
                  infinite={false}
               >
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
   const { config, kioskMenus, setCurrentPage } = props
   const { categoryId, changeCategory } = props

   const { cartState } = React.useContext(CartContext)
   const { cart } = cartState

   const menuRef = React.useRef()
   const [selectedCategory, setSelectedCategory] = useState(
      (categoryId && categoryId.toString()) || '0'
   )

   const { t } = useTranslation()

   const onCategorySelect = e => {
      setSelectedCategory(e.key)
      changeCategory(e.key)
   }

   return (
      <Layout style={{ height: 'calc(100vh - 35em)' }}>
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
                        <a
                           href={`#${eachCategory.name}`}
                           onClick={() => {
                              // document
                              //    .getElementById(`#${eachCategory.name}`)
                              // .scrollIntoView({
                              //    behavior: 'smooth',
                              //    block: 'start',
                              // })
                              console.log(
                                 document.getElementById(
                                    `#${menuRef.current.id}`
                                 )
                              )
                              // menuRef.current.id.scrollIntoView({
                              //    behavior: 'smooth',
                              //    block: 'start',
                              // })
                              console.log(menuRef.current.id)
                           }}
                        >
                           <div
                              className="hern-kiosk__menu-page-product-category"
                              style={{
                                 ...((index == selectedCategory ||
                                    index == categoryId) && {
                                    border: ` 4px solid ${config.kioskSettings.theme.primaryColor.value}`,
                                 }),
                              }}
                           >
                              <img
                                 src={
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
                              >
                                 {eachCategory.name}
                              </span>
                           </div>
                        </a>
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
                     <Col span={3} className="hern-kiosk__menu-header-col-2">
                        <CartIcon
                           onClick={() => {
                              setCurrentPage('cartPage')
                           }}
                           size={43}
                        />
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
                     </Col>
                  </Row>
               </Header>
               <Content class="hern-kiosk__menu-product-list">
                  {kioskMenus.map((eachCategory, index) => {
                     // VegNonVegTYpe change into type
                     const groupedByType = React.useMemo(() => {
                        return _.chain(eachCategory.products)
                           .groupBy('VegNonVegType')
                           .map((value, key) => ({
                              type: key,
                              products: value,
                           }))
                           .value()
                     }, [])
                     const [currentGroupProducts, setCurrentGroupedProduct] =
                        useState(groupedByType[0].products)
                     const [currentGroup, setCurrentGroup] = useState(
                        groupedByType[0].type
                     )

                     const onRadioClick = e => {
                        setCurrentGroupedProduct(prev => {
                           return groupedByType.find(
                              x => x.type === e.target.value
                           ).products
                        })
                        setCurrentGroup(e.target.value)
                     }
                     return (
                        <>
                           <div id={eachCategory.name} ref={menuRef}></div>
                           {eachCategory?.imageUrl ? (
                              <img
                                 src={eachCategory?.imageUrl}
                                 className="hern-kiosk__menu-category-banner-img"
                              />
                           ) : (
                              <p className="hern-kiosk__menu-category-name">
                                 {eachCategory.name}
                              </p>
                           )}
                           {groupedByType.length > 1 && (
                              <div className="hern-kiosk__menu-product-type">
                                 <Space>
                                    <Radio.Group
                                       defaultValue="a"
                                       style={{ marginTop: 16 }}
                                       onChange={onRadioClick}
                                    >
                                       {groupedByType.map((eachType, index) => {
                                          return (
                                             <Radio.Button
                                                value={eachType.type}
                                                className="hern-kiosk__menu-product-type-radio-btn"
                                                style={{
                                                   backgroundColor:
                                                      currentGroup ===
                                                      eachType.type
                                                         ? config.kioskSettings
                                                              .theme
                                                              .primaryColor
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
                                                              .theme
                                                              .primaryColor
                                                              .value,
                                                   borderRadius: '0.5em',
                                                }}
                                             >
                                                {eachType.type == 'null'
                                                   ? t('Others')
                                                   : eachType.type}
                                             </Radio.Button>
                                          )
                                       })}
                                    </Radio.Group>
                                 </Space>
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
                                          key={index2}
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
                        </>
                     )
                  })}
               </Content>
            </Layout>
         </Content>
      </Layout>
   )
}
