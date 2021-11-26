import React, { useState } from 'react'
import { Col, Layout, Menu, Row } from 'antd'
import { useQueryParamState } from '../../utils'
import { useTranslation } from '../../context'
import { KioskProduct } from './component'

const { Content, Sider, Header } = Layout

export const MenuSection = props => {
   const { config } = props
   const [category, changeCategory, deleteCategory] =
      useQueryParamState('productCategoryId')
   console.log('fromMenuSection')
   return (
      <Layout>
         <Content style={{ height: '40em' }}>
            Promotion, coupons and progress bar
         </Content>
         <KioskMenu
            config={config}
            categoryId={category}
            changeCategory={changeCategory}
         />
      </Layout>
   )
}
const categories = [
   {
      id: 1,
      image: 'https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/userimages/SUPER%20HERFY%20+%20SUPER%20CKN%20MEAL_%20(2).png',
      title: 'Combos',
   },
   {
      id: 2,
      image: 'https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/userimages/ckn%20tortilla,and%20mudabbla%20ckn%203rd%20option.png',
      title: 'Sandwich',
   },
   {
      id: 3,
      image: 'https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/userimages/SPECIAL%20OFFER%20%20ENGLISH%20RED%20copy.png',
      title: 'Special Offers',
   },
   {
      id: 4,
      image: 'https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/userimages/TEEN%20TITANS%20KDM%20BOX.png',
      title: 'Kiddie Meals',
   },
   {
      id: 5,
      image: 'https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/userimages/,%20nuggets,sauce,%20plain%20cz%20cake%201st%20option.png',
      title: 'Side Orders',
   },
   {
      id: 6,
      image: 'https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/userimages/TEEN%20TITANS%20KDM%20BOX.png',
      title: 'Milkshakes',
   },
   {
      id: 7,
      image: "https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/userimages/Pepsi%20in%20Glass%20with%204%20logo's.png",
      title: 'Beverage',
   },
   {
      id: 8,
      image: 'https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/userimages/250-X-250--KAFU-en-ar.png',
      title: 'Kafu Menu',
   },
]
const KioskMenu = props => {
   const { config } = props
   const { categoryId, changeCategory } = props
   const [selectedCategory, setSelectedCategory] = useState(
      (categoryId && categoryId.toString()) || categories[0]['id'].toString()
   )
   console.log('categoriesId', categoryId)
   console.log('KioskMenu')
   const { t } = useTranslation()

   const onCategorySelect = e => {
      setSelectedCategory(e.key)
      changeCategory(e.key)
   }
   const products = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
   const options = ['option1', 'option2', 'option3', 'option4']
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
               {categories.map((eachCategory, index) => {
                  return (
                     <Menu.Item
                        key={eachCategory.id}
                        style={{ height: '13em' }}
                     >
                        <div
                           className="hern-kiosk__menu-page-product-category"
                           style={{
                              ...((eachCategory.id == selectedCategory ||
                                 eachCategory.id == categoryId) && {
                                 border: ` 4px solid ${config.kioskSettings.theme.primaryColor.value}`,
                              }),
                           }}
                        >
                           <img
                              src={eachCategory.image}
                              alt="category image"
                              style={{ width: '100px', height: '100px' }}
                              className="hern-kiosk__menu-page-product-category-image"
                           />
                           <span
                              className="hern-kiosk__menu-page-product-category-title"
                              style={{
                                 ...((eachCategory.id == selectedCategory ||
                                    eachCategory.id == categoryId) && {
                                    color: `${config.kioskSettings.theme.primaryColor.value}`,
                                 }),
                              }}
                           >
                              {eachCategory.title}
                           </span>
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
                        <Row>
                           {options.map((eachOption, index) => {
                              const forSpan = 24 / options.length
                              return (
                                 <Col
                                    key={index}
                                    span={forSpan}
                                    className="hern-kiosk__menu-header-additional-options"
                                 >
                                    <span>{eachOption}</span>
                                 </Col>
                              )
                           })}
                        </Row>
                     </Col>
                     <Col span={3} className="hern-kiosk__menu-header-col-2">
                        col-6
                     </Col>
                  </Row>
               </Header>
               <Content class="hern-kiosk__menu-product-list">
                  <Row gutter={[16, 16]}>
                     {products.map((eachProduct, index) => (
                        <Col span={8} className="gutter-row" key={index}>
                           <KioskProduct config={config} />
                        </Col>
                     ))}
                  </Row>
               </Content>
            </Layout>
         </Content>
      </Layout>
   )
}
