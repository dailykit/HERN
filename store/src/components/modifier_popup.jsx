import { each } from 'lodash'
import React, { useState } from 'react'
import { Button, ProductCard } from '.'
import { ShowImageIcon } from '../assets/icons'
import { formatCurrency } from '../utils'
import { CloseIcon, CheckBoxIcon } from '../assets/icons'
import { useOnClickOutside } from '../utils/useOnClickOutisde'
export const ModifierPopup = props => {
   const { productData, showModifiers = true } = props
   const [productOption, setProductOption] = useState(
      productData.productOptions[0]
   )
   const [selectedOptions, setSelectedOptions] = useState({
      single: [],
      multiple: [],
   })
   const [errorCategories, setErrorCategories] = useState([])
   const imagePopUpRef = React.useRef()
   const [modifierImage, setModifierImage] = useState({
      showImage: false,
      src: null,
   })
   useOnClickOutside(imagePopUpRef, () =>
      setModifierImage({
         showImage: false,
         src: null,
      })
   )
   console.log('selectedOptions', selectedOptions)
   const onCheckClick = (eachOption, eachCategory) => {
      //selected option
      const selectedOption = {
         modifierCategoryID: eachCategory.id,
         modifierCategoryOptionsID: eachOption.id,
      }
      //modifierCategoryOptionID
      //modifierCategoryID
      if (eachCategory.type === 'single') {
         const existCategoryIndex = selectedOptions.single.findIndex(
            x => x.modifierCategoryID == eachCategory.id
         )
         //single-->already exist category
         if (existCategoryIndex !== -1) {
            //for uncheck the option
            if (
               selectedOptions.single[existCategoryIndex][
                  'modifierCategoryOptionsID'
               ] === eachOption.id
            ) {
               const newSelectedOptions = selectedOptions.single.filter(
                  x =>
                     x.modifierCategoryID !== eachCategory.id &&
                     x.modifierCategoryOptionsID !== eachOption.id
               )
               setSelectedOptions({
                  ...selectedOptions,
                  single: newSelectedOptions,
               })
               return
            }
            const newSelectedOptions = selectedOptions.single
            newSelectedOptions[existCategoryIndex] = selectedOption
            setSelectedOptions({
               ...selectedOptions,
               single: newSelectedOptions,
            })
            return
         } else {
            //single--> already not exist
            setSelectedOptions({
               ...selectedOptions,
               single: [...selectedOptions.single, selectedOption],
            })
            return
         }
      }
      if (eachCategory.type === 'multiple') {
         const existOptionIndex = selectedOptions.multiple.findIndex(
            x => x.modifierCategoryOptionsID == eachOption.id
         )

         //already exist option
         if (existOptionIndex !== -1) {
            const newSelectedOptions = selectedOptions.multiple.filter(
               x => x.modifierCategoryOptionsID !== eachOption.id
            )
            setSelectedOptions({
               ...selectedOptions,
               multiple: newSelectedOptions,
            })
            return
         }
         //new option select
         else {
            setSelectedOptions({
               ...selectedOptions,
               multiple: [...selectedOptions.multiple, selectedOption],
            })
         }
      }
   }
   const handleAddOnCartOn = () => {
      //check category fulfillment conditions
      const allSelectedOptions = [
         ...selectedOptions.single,
         ...selectedOptions.multiple,
      ]

      let allCatagories = productOption.modifier?.categories || []

      let errorOccur = false

      let errorState = []
      for (let i = 0; i < allCatagories.length; i++) {
         const min = allCatagories[i]['limits']['min']
         const max = allCatagories[i]['limits']['max']
         const allFoundedOptionsLength = allSelectedOptions.filter(
            x => x.modifierCategoryID === allCatagories[i].id
         ).length
         errorOccur
         console.log('debug', min, allFoundedOptionsLength, max)
         if (allCatagories[i]['isRequired']) {
            if (
               allFoundedOptionsLength > 0 &&
               min <= allFoundedOptionsLength &&
               allFoundedOptionsLength <= max
            ) {
               console.log('hello')
            } else {
               errorOccur = true
               console.log('error', errorCategories)
               errorState.push(allCatagories[i].id)
               // setErrorCategories([...errorCategories, allCatagories[i].id])
            }
         }
      }
      setErrorCategories(errorState)
      console.log('errorState', errorState)
   }
   console.log('errorOccure', errorCategories)
   return (
      <>
         <div className="hern-product-modifier-pop-up-container">
            <div className="hern-product-modifier-pop-up-product">
               <div className="hern-product-modifier-pop-up-product-details">
                  <ProductCard
                     data={productData}
                     showImage={false}
                     showCustomText={false}
                  />
               </div>
               <div className="hern-product-modifier-pop-up-product-option-list">
                  <label htmlFor="products">Available Options:</label>
                  <br />
                  <select
                     className="hern-product-modifier-pop-up-product-options"
                     name="product-options"
                     onChange={e => {
                        const selectedProductOption =
                           productData.productOptions.find(
                              x => x.id == e.target.value
                           )
                        setProductOption(selectedProductOption)
                     }}
                  >
                     {productData.productOptions.map(eachOption => {
                        return (
                           <option value={eachOption.id} key={eachOption.id}>
                              {eachOption.label}
                              {' (+ '}
                              {formatCurrency(eachOption.price)}
                              {')'}
                           </option>
                        )
                     })}
                  </select>
               </div>
               {showModifiers && productOption.modifier && (
                  <div className="hern-product-modifier-pop-up-modifier-list">
                     <label
                        htmlFor="products"
                        className="hern-product-modifier-pop-up-add-on"
                     >
                        Add on:
                     </label>
                     {productOption.modifier.categories.map(eachCategory => {
                        return (
                           <div
                              className="hern-product-modifier-pop-up-modifier-category-list"
                              key={eachCategory.id}
                           >
                              <span className="hern-product-modifier-pop-up-modifier-category__name">
                                 {eachCategory.name}
                              </span>
                              <br />
                              <span
                                 style={{
                                    fontStyle: 'italic',
                                    fontSize: '11px',
                                 }}
                              >
                                 {eachCategory.type === 'single'
                                    ? `(You can select single add on)${
                                         eachCategory.isRequired ? '*' : ''
                                      }`
                                    : `(You can select min ${
                                         eachCategory.limits.min || 0
                                      } and max ${
                                         eachCategory.limits.max || 0
                                      })${eachCategory.isRequired ? '*' : ''}`}
                              </span>

                              {errorCategories.includes(eachCategory.id) && (
                                 <>
                                    <br />
                                    <span
                                       style={{
                                          fontStyle: 'italic',
                                          fontSize: '11px',
                                          color: 'red',
                                       }}
                                    >
                                       You have to choose this category.
                                    </span>
                                 </>
                              )}
                              <br />
                              <div className="hern-product-modifier-pop-up-modifier-category__options">
                                 {eachCategory.options.map(eachOption => {
                                    const foo = () => {
                                       const foo1 = () => {
                                          const isOptionSelected =
                                             selectedOptions[
                                                eachCategory.type
                                             ].find(
                                                x =>
                                                   x.modifierCategoryID ===
                                                      eachCategory.id &&
                                                   x.modifierCategoryOptionsID ===
                                                      eachOption.id
                                             )
                                          return Boolean(isOptionSelected) ? (
                                             <CheckBoxIcon showTick={true} />
                                          ) : (
                                             <CheckBoxIcon />
                                          )
                                       }
                                       return foo1
                                    }
                                    return (
                                       <div
                                          className="hern-product-modifier-pop-up-add-on-list"
                                          key={eachOption.id}
                                       >
                                          <ProductCard
                                             data={eachOption}
                                             showImage={false}
                                             showCustomText={false}
                                             showImageIcon={
                                                eachOption.image
                                                   ? ShowImageIcon
                                                   : false
                                             }
                                             onShowImageIconClick={() => {
                                                setModifierImage({
                                                   ...modifierImage,
                                                   src: eachOption.image,
                                                   showImage: true,
                                                })
                                             }}
                                             additionalIcon={foo()}
                                             onAdditionalIconClick={() => {
                                                onCheckClick(
                                                   eachOption,
                                                   eachCategory
                                                )
                                             }}
                                          />
                                       </div>
                                    )
                                 })}
                              </div>
                           </div>
                        )
                     })}
                  </div>
               )}
            </div>
            <div className="hern-product-modifier-pop-up-close-icon">
               <CloseIcon size={20} stroke="currentColor" />
            </div>
            <Button
               className="hern-product-modifier-pop-up-add-to-cart-btn"
               onClick={handleAddOnCartOn}
            >
               Add To Cart
            </Button>
            {modifierImage.showImage && (
               <div className="hern-product-modifier-image-pop-up">
                  <div
                     className="hern-product-modifier-image-pop-up-content"
                     ref={imagePopUpRef}
                  >
                     <img src={modifierImage.src} />
                     {/* <div className="hern-product-modifier-pop-up-close-icon">
                        <CloseIcon size={20} stroke="currentColor" />
                     </div> */}
                  </div>
               </div>
            )}
         </div>
      </>
   )
}
