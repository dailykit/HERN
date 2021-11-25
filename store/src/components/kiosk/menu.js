import React, { useState } from 'react'
import { Layout, Menu } from 'antd'
import { useQueryParamState } from '../../utils'

const { Content, Sider } = Layout

export const MenuSection = props => {
   const { config } = props
   const [category, changeCategory, deleteCategory] =
      useQueryParamState('productCategoryId')
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
   const { config, categoryId, changeCategory } = props
   const [selectedCategory, setSelectedCategory] = useState(null)

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
               defaultSelectedKeys={[categoryId || categories[0]['id']]}
            >
               {categories.map((eachCategory, index) => {
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
                           <img
                              src={eachCategory.image}
                              alt="category image"
                              style={{ width: '100px', height: '100px' }}
                              className="hern-kiosk__menu-page-product-category-image"
                           />
                           <span
                              className="hern-kiosk__menu-page-product-category-title"
                              style={{
                                 ...(index == selectedCategory && {
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
         <Content> This is Content</Content>
      </Layout>
   )
}
