import React, { useState } from 'react'
import { RadioIcon, CheckBoxIcon } from '../assets/icons'
import { ModifierOptionCard } from './'
import { useConfig } from '../lib'

export const ModifierCategory = props => {
   const {
      eachCategory,
      selectedOptions,
      config,
      setSelectedOptions,
      errorCategories,
      nestedSelectedModifierOptions,
      nestedSetSelectedModifierOptions,
      nestedErrorCategories,
      parentModifierOptionId = null,
   } = props

   const { configOf } = useConfig()
   const theme = configOf('theme-color', 'Visual')?.themeColor
   const themeColor = theme?.accent?.value
      ? theme?.accent?.value
      : 'rgba(5, 150, 105, 1)'
   const renderConditionText = category => {
      if (category.type === 'single') {
         return 'CHOOSE ONE*'
      } else {
         if (category.isRequired) {
            if (category.limits.min) {
               if (category.limits.max) {
                  return `(CHOOSE AT LEAST ${category.limits.min} AND AT MOST ${category.limits.max})*`
               } else {
                  return `(CHOOSE AT LEAST ${category.limits.min})*`
               }
            } else {
               if (category.limits.max) {
                  return `(CHOOSE AT LEAST 1 AND AT MOST ${category.limits.max})*`
               } else {
                  return `(CHOOSE AT LEAST 1)*`
               }
            }
         } else {
            if (category.limits.max) {
               return '(CHOOSE AS MANY AS YOU LIKE)'
            } else {
               return `(CHOOSE AS MANY AS YOU LIKE UPTO ${category.limits.max})`
            }
         }
      }
   }
   const onCheckClick = (eachOption, eachModifierCategory) => {
      //selected option
      const selectedOption = {
         modifierCategoryID: eachModifierCategory.id,
         modifierCategoryOptionsID: eachOption.id,
         modifierCategoryOptionsPrice: eachOption.price,
         modifierCategoryOptionsDiscount: eachOption.discount,
         cartItem: eachOption.cartItem,
         parentModifierOptionId: parentModifierOptionId,
      }
      //modifierCategoryOptionID
      //modifierCategoryID
      if (eachModifierCategory.type === 'single') {
         const existCategoryIndex = selectedOptions.single.findIndex(
            x => x.modifierCategoryID == eachModifierCategory.id
         )
         //single-->already exist category
         if (existCategoryIndex !== -1) {
            //for uncheck the option
            if (
               selectedOptions.single[existCategoryIndex][
               'modifierCategoryOptionsID'
               ] === eachOption.id &&
               !eachModifierCategory.isRequired
            ) {
               const newSelectedOptions = selectedOptions.single.filter(
                  x =>
                     x.modifierCategoryID !== eachModifierCategory.id &&
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
      if (eachModifierCategory.type === 'multiple') {
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
   return (
      <div
         className="hern-product-modifier-pop-up-modifier-category-list"
         key={eachCategory.id}
      >
         <div
            style={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
            }}
         >
            <span className="hern-product-modifier-pop-up-modifier-category__name" data-translation="true"
               data-original-value={eachCategory.name}>

               {eachCategory.name}
            </span>{' '}
            <span
               style={{
                  fontStyle: 'italic',
                  fontSize: '11px',
               }}

               data-translation="true"
               data-original-value={renderConditionText(eachCategory)}>
               {'('}
               {renderConditionText(eachCategory)}
               {')'}
            </span>
         </div>
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
                  {t('You have to choose this category.')}
               </span>
            </>
         )}

         <div className="hern-product-modifier-pop-up-modifier-category__options">
            {eachCategory.options.map(eachOption => {
               const [
                  showAdditionalModifierOptions,
                  setShowAdditionalModifierOptions,
               ] = useState(false)
               const onCustomizeClick = () => {
                  setShowAdditionalModifierOptions(prev => !prev)
               }
               const ConditionalIcon = () => {
                  const Icon = () => {
                     const isOptionSelected = selectedOptions[
                        eachCategory.type
                     ].find(
                        x =>
                           x.modifierCategoryID === eachCategory.id &&
                           x.modifierCategoryOptionsID === eachOption.id
                     )
                     return eachCategory.type === 'single' &&
                        config?.informationVisibility?.modifier
                           ?.modifierSelectIcon?.value?.value === 'RADIO' ? (
                        Boolean(isOptionSelected) ? (
                           <RadioIcon showTick={true} stroke={themeColor} />
                        ) : (
                           <RadioIcon stroke={themeColor} />
                        )
                     ) : Boolean(isOptionSelected) ? (
                        <CheckBoxIcon showTick={true} stroke={themeColor} />
                     ) : (
                        <CheckBoxIcon stroke={themeColor} />
                     )
                  }
                  return <Icon />
               }
               return (
                  <div
                     className="hern-product-modifier-pop-up-add-on-list"
                     key={eachOption.id}
                  >
                     <ModifierOptionCard
                        modifierOption={eachOption}
                        onCardClick={() => {
                           onCheckClick(eachOption, eachCategory)
                        }}
                        checkIcon={ConditionalIcon}
                        checkIconPosition={
                           config?.informationVisibility?.modifier
                              ?.modifierSelectIconPosition?.value?.value ||
                           'LEFT'
                        }
                        showPrice={true}
                        onCustomizeClick={onCustomizeClick}
                     />
                     {showAdditionalModifierOptions &&
                        eachOption.additionalModifierTemplate.categories.map(
                           eachAdditionalCategory => (
                              <ModifierCategory
                                 key={`${eachAdditionalCategory.id} - ${eachOption.id}`}
                                 eachCategory={eachAdditionalCategory}
                                 selectedOptions={nestedSelectedModifierOptions}
                                 setSelectedOptions={
                                    nestedSetSelectedModifierOptions
                                 }
                                 config={config}
                                 errorCategories={nestedErrorCategories}
                                 parentModifierOptionId={eachOption.id}
                              />
                           )
                        )}
                  </div>
               )
            })}
         </div>
      </div>
   )
}
