import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import { Col, Layout, Menu, Row, Badge, Steps } from 'antd'
import { useQueryParamState } from '../../utils'
import { CartContext, useTranslation } from '../../context'
import { KioskProduct } from './component'
import { PRODUCTS_BY_CATEGORY, PRODUCTS } from '../../graphql'
import { useConfig } from '../../lib'
import { useQuery } from '@apollo/react-hooks'
import { CartIcon } from '../../assets/icons'
import { Divider } from '../../components'

const { Content, Sider, Header, Footer } = Layout
const { Step } = Steps

export const MenuSection = props => {
   const { brand, isConfigLoading } = useConfig()

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

   if (status === 'loading') {
      return <div>Loading</div>
   }
   if (status === 'error') {
      return <div>Somthing went wring</div>
   }
   return (
      <Layout>
         <Content style={{ height: '40em' }}>
            {/* Promotion, coupons and progress bar */}
            <Layout style={{ height: '100%' }}>
               <Content>Hello</Content>
               <Footer
                  style={{
                     background: `${config.kioskSettings.theme.primaryColorLight.value}`,
                  }}
               >
                  <ProgressBar config={config} />
               </Footer>
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

const ProgressBar = props => {
   const { config } = props

   const { cartState } = React.useContext(CartContext)
   const { t, direction } = useTranslation()
   const { cart } = cartState

   const [current, setCurrent] = React.useState(0)

   const steps = [
      {
         title: 'Select Product',
      },
      {
         title: 'Add To Cart',
      },
      {
         title: 'Payment',
      },
   ]
   useEffect(() => {
      if (cart && cart.cartItems_aggregate.aggregate.count > 0) {
         setCurrent(2)
      }
   }, [cart])

   const StepCount = ({ step, isFinish, isCurrent }) => {
      return (
         <div
            className="hern-kiosk__step-bar-count"
            style={{
               backgroundColor: `${
                  isFinish
                     ? config.kioskSettings.theme.secondaryColor.value
                     : isCurrent
                     ? config.kioskSettings.theme.primaryColor.value
                     : 'transparent'
               }`,

               color: `${isFinish ? '#fff' : isCurrent ? '#fff' : '#5A5A5A99'}`,
               border: `${isFinish ? 'none' : '2px solid #5A5A5A99'}`,
            }}
         >
            {step}
         </div>
      )
   }
   return (
      <Steps
         current={current}
         className={direction === 'rtl' && 'hern-kiosk__step-bar-rtl'}
      >
         {steps.map((item, index) => (
            <Step
               key={item.title}
               title={t(item.title)}
               style={{
                  color: `${config.kioskSettings.theme.primaryColor.value}`,
               }}
               icon={
                  <StepCount
                     step={index + 1}
                     isFinish={index < current}
                     isCurrent={index == current}
                  />
               }
            />
         ))}
      </Steps>
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
      <Layout style={{ height: 'calc(100vh - 50em)' }}>
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
                                 src={config.productSettings.defaultImage.value}
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
                     return (
                        <>
                           <div id={eachCategory.name} ref={menuRef}></div>
                           <p className="hern-kiosk__menu-category-name">
                              {eachCategory.name}
                           </p>
                           <Row
                              gutter={[16, 16]}
                              style={{ marginBottom: '2em' }}
                           >
                              {eachCategory.products.map(
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
