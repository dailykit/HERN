import React, { useState } from 'react'
import { Badge, Carousel, Radio } from 'antd'
import { KioskCounterButton } from '.'
import { useTranslation } from '../../../context'
import { CheckBoxIcon, CloseIcon } from '../../../assets/icons'
const productData = {
   id: 1080,
   name: "Adrish's Special",
   type: 'simple',
   assets: {
      images: [
         'https://storage.eu.content-cdn.io/cdn-cgi/image/height=170,width=180,quality=100/https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/ProductImages/Large/NewBeefMudabal.png',
         'https://storage.eu.content-cdn.io/cdn-cgi/image/height=170,width=180,quality=100/https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/ProductImages/Large/250x250pix-ckn-tortilla-jalapeno-meal-with-NEW-icon.png',
         'https://storage.eu.content-cdn.io/cdn-cgi/image/height=170,width=180,quality=100/https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/ProductImages/Large/NewSuper-HERFYcopy.png',
      ],
      videos: [],
   },
   tags: ['Hot', 'New', 'Trending', 'Trending', 'Final'],
   additionalText: 'comes with Ketchup',
   description: 'SLdhasldha',
   price: 5,
   discount: 50,
   isPopupAllowed: true,
   isPublished: true,
   defaultProductOptionId: null,
   productOptions: [
      {
         id: 1203,
         position: 1000000,
         type: 'readyToEat',
         label: 'Regular',
         price: 10,
         discount: 0,
         cartItem: {
            childs: {
               data: [
                  {
                     childs: {
                        data: [],
                     },
                     unitPrice: 10,
                     productOptionId: 1203,
                  },
               ],
            },
            productId: 1080,
            unitPrice: 2.5,
         },
         modifier: {
            id: 1003,
            name: 'modifier-sGh3i',
            categories: [
               {
                  id: 1003,
                  name: 'category-IOSqx',
                  isRequired: true,
                  type: 'single',
                  limits: {
                     max: null,
                     min: 1,
                  },
                  options: [],
                  __typename: 'onDemand_modifierCategory',
               },
            ],
            __typename: 'onDemand_modifier',
         },
         __typename: 'products_productOption',
      },
      {
         id: 1206,
         position: 500000,
         type: 'mealKit',
         label: 'Medium',
         price: 20,
         discount: 0,
         cartItem: {
            childs: {
               data: [
                  {
                     childs: {
                        data: [
                           {
                              simpleRecipeYieldId: 1025,
                           },
                           {
                              simpleRecipeYieldId: 1025,
                           },
                           {
                              simpleRecipeYieldId: 1025,
                           },
                           {
                              simpleRecipeYieldId: 1025,
                           },
                           {
                              simpleRecipeYieldId: 1025,
                           },
                           {
                              simpleRecipeYieldId: 1025,
                           },
                        ],
                     },
                     unitPrice: 20,
                     productOptionId: 1206,
                  },
               ],
            },
            productId: 1080,
            unitPrice: 2.5,
         },
         modifier: null,
         __typename: 'products_productOption',
      },
      {
         id: 1237,
         position: 0,
         type: null,
         label: 'Large',
         price: 5,
         discount: 0,
         cartItem: {
            childs: {
               data: [
                  {
                     childs: {
                        data: [],
                     },
                     unitPrice: 5,
                     productOptionId: 1237,
                  },
               ],
            },
            productId: 1080,
            unitPrice: 2.5,
         },
         modifier: {
            id: 1002,
            name: 'Pizza options',
            categories: [
               {
                  id: 1002,
                  name: 'choose your crust',
                  isRequired: true,
                  type: 'multiple',
                  limits: {
                     max: 2,
                     min: 1,
                  },
                  options: [
                     {
                        id: 1004,
                        name: 'Cheese burst',
                        price: 100,
                        discount: 0,
                        quantity: 1,
                        image: 'https://storage.eu.content-cdn.io/cdn-cgi/image/height=92,quality=100/https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/ProductImages/Large/sideFriesReg.png',
                        isActive: true,
                        sachetItemId: null,
                        ingredientSachetId: null,
                        cartItem: {
                           data: [
                              {
                                 unitPrice: 100,
                                 modifierOptionId: 1004,
                              },
                           ],
                        },
                        __typename: 'onDemand_modifierCategoryOption',
                     },
                     {
                        id: 1016,
                        name: 'Mushroom Soba Noodles - 2 servings',
                        price: 0,
                        discount: 0,
                        quantity: 1,
                        image: 'https://storage.eu.content-cdn.io/cdn-cgi/image/height=92,quality=100/https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/ProductImages/Large/sideFriesReg.png',
                        isActive: false,
                        sachetItemId: null,
                        ingredientSachetId: null,
                        cartItem: {
                           data: [
                              {
                                 unitPrice: 0,
                                 modifierOptionId: 1016,
                              },
                           ],
                        },
                        __typename: 'onDemand_modifierCategoryOption',
                     },
                     {
                        id: 1021,
                        name: 'option-UzL0q',
                        price: 0,
                        discount: 0,
                        quantity: 1,
                        image: 'https://storage.eu.content-cdn.io/cdn-cgi/image/height=92,quality=100/https://images.phi.content-cdn.io/yum-resources/2ea4aca1-355b-475b-8046-b21c1eaadbe8/Images/ProductImages/Large/sideFriesReg.png',
                        isActive: true,
                        sachetItemId: null,
                        ingredientSachetId: null,
                        cartItem: {
                           data: [
                              {
                                 unitPrice: 0,
                                 modifierOptionId: 1021,
                              },
                           ],
                        },
                        __typename: 'onDemand_modifierCategoryOption',
                     },
                  ],
                  __typename: 'onDemand_modifierCategory',
               },
               {
                  id: 1022,
                  name: 'Another one',
                  isRequired: true,
                  type: 'single',
                  limits: {
                     max: 1,
                     min: 1,
                  },
                  options: [
                     {
                        id: 1017,
                        name: 'Beans',
                        price: 1,
                        discount: 50,
                        quantity: 1,
                        image: 'https://dailykit-133-test.s3.amazonaws.com/images/21814-mac-cheese.jpg',
                        isActive: true,
                        sachetItemId: null,
                        ingredientSachetId: null,
                        cartItem: {
                           data: [
                              {
                                 unitPrice: 0.5,
                                 modifierOptionId: 1017,
                              },
                           ],
                        },
                        __typename: 'onDemand_modifierCategoryOption',
                     },
                     {
                        id: 10171,
                        name: 'Beans Return',
                        price: 1,
                        discount: 50,
                        quantity: 1,
                        image: 'https://dailykit-133-test.s3.amazonaws.com/images/21814-mac-cheese.jpg',
                        isActive: true,
                        sachetItemId: null,
                        ingredientSachetId: null,
                        cartItem: {
                           data: [
                              {
                                 unitPrice: 0.5,
                                 modifierOptionId: 1017,
                              },
                           ],
                        },
                        __typename: 'onDemand_modifierCategoryOption',
                     },
                  ],
                  __typename: 'onDemand_modifierCategory',
               },
            ],
            __typename: 'onDemand_modifier',
         },
         __typename: 'products_productOption',
      },
   ],
   __typename: 'products_product',
}
export const KioskModifier = props => {
   const { config, setShowModifier, productData } = props
   const { t } = useTranslation()
   console.log('productData', productData)
   // component state
   const [selectedProductOption, setSelectedProductOption] = useState(
      productData.productOptions[0]
   )
   return (
      <div className="hern-kiosk__menu-product-modifier-popup">
         <div className="hern-kiosk__menu-product-modifier-popup--bg"></div>

         <div
            className="hern-kiosk__menu-product-modifier-pop-up-container"
            style={{ background: '#0F6BB1' }}
         >
            <div
               onClick={() => {
                  setShowModifier(false)
               }}
               style={{
                  position: 'absolute',
                  right: '2em',
                  top: '2em',
                  background: `${config.kioskSettings.theme.primaryColorDark.value}}`,
                  borderRadius: '50%',
                  padding: '.5em',
               }}
            >
               <CloseIcon size={30} stroke={'#fffffF'} />
            </div>
            <div className="hern-kiosk__menu-product-modifier-header">
               <span
                  className="hern-kiosk__menu-product-modifier-customize-text"
                  style={{ color: '#ffffff' }}
               >
                  {t('Customize')}
               </span>
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
               <KioskCounterButton config={config} />
            </div>
            <div className="hern-kiosk__modifier-popup-product-options">
               <Radio.Group
                  defaultValue={productData.productOptions[0].id}
                  buttonStyle="solid"
                  onChange={e => {
                     const productOption = productData.productOptions.find(
                        x => x.id == e.target.value
                     )
                     setSelectedProductOption(productOption)
                  }}
                  size="large"
                  style={{ margin: '.5em 0' }}
               >
                  {productData.productOptions.map((eachOption, index) => (
                     <Radio.Button
                        value={eachOption.id}
                        key={index}
                        className="hern-kiosk__modifier-product-option"
                        style={{
                           ...(selectedProductOption.id === eachOption.id && {
                              backgroundColor: 'transparent',
                              border: `2px solid ${config.kioskSettings.theme.primaryColorDark.value}`,
                           }),
                        }}
                     >
                        {eachOption.label}
                     </Radio.Button>
                  ))}
               </Radio.Group>
            </div>

            <div className="hern-kiosk__modifier-popup-modifiers-list">
               {selectedProductOption.modifier &&
                  selectedProductOption.modifier.categories.map(
                     (eachModifierCategory, index) => {
                        return (
                           <div className="hern-kiosk__modifier-popup-modifier-category">
                              <label className="hern-kiosk__modifier-category-label">
                                 <Badge
                                    count={index + 1}
                                    style={{
                                       backgroundColor: '#ffffff',
                                       color: `${config.kioskSettings.theme.primaryColor.value}`,
                                       fontWeight: '600',
                                    }}
                                 />
                                 <span
                                    className="hern-kiosk__modifier-category-label-text"
                                    style={{ color: '#ffffff' }}
                                 >
                                    {eachModifierCategory.name}
                                 </span>
                              </label>
                              <div className="hern-kiosk__modifier-category-options">
                                 {eachModifierCategory.options.map(
                                    (eachOption, index) => {
                                       return (
                                          <div
                                             key={index}
                                             className="hern-kiosk__modifier-category-option"
                                          >
                                             <div className="hern-kiosk__modifier-category-right">
                                                {eachOption.image ? (
                                                   <img
                                                      className="hern-kiosk__modifier-category-option-image"
                                                      alt="modifier image"
                                                      src={eachOption.image}
                                                   />
                                                ) : (
                                                   <img
                                                      className="hern-kiosk__modifier-category-option-image"
                                                      alt="modifier image"
                                                      src={
                                                         config.productSettings
                                                            .defaultImage.value
                                                      }
                                                   />
                                                )}
                                                <span className="hern-kiosk__modifier--option-name">
                                                   {eachOption.name}
                                                </span>
                                             </div>
                                             <CheckBoxIcon
                                                showTick={true}
                                                size={30}
                                                stroke={
                                                   config.kioskSettings.theme
                                                      .primaryColor.value
                                                }
                                             />
                                          </div>
                                       )
                                    }
                                 )}
                              </div>
                           </div>
                        )
                     }
                  )}
            </div>
         </div>
      </div>
   )
}
