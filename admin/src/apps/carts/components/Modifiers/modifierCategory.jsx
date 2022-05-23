import React from 'react'
import { Flex, Spacer, Text } from '@dailykit/ui'
import styled, { css } from 'styled-components'
import { ModifierOption } from './modifierOption'
import CircleIcon from '../../../../shared/assets/icons/Circle'
import CircleCheckedIcon from '../../../../shared/assets/icons/CircleChecked'
import SquareIcon from '../../../../shared/assets/icons/Square'
import SquareCheckedIcon from '../../../../shared/assets/icons/SquareChecked'

export const ModifierCategory = ({
   category,
   renderConditionText,
   parentModifierOptionId = null,
   selectedModifierOptions,
   setSelectedModifierOptions,
   nestedSelectedModifierOptions,
   setNestedSelectedModifierOptions,
   errorCategories,
   nestedErrorCategories,
}) => {
   const selectModifierOption = (eachOption, eachModifierCategory) => {
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
         const existCategoryIndex = selectedModifierOptions.single.findIndex(
            x => x.modifierCategoryID == eachModifierCategory.id
         )
         //single-->already exist category
         if (existCategoryIndex !== -1) {
            //for uncheck the option
            if (
               selectedModifierOptions.single[existCategoryIndex][
                  'modifierCategoryOptionsID'
               ] === eachOption.id &&
               !eachModifierCategory.isRequired
            ) {
               const newSelectedOptions = selectedModifierOptions.single.filter(
                  x =>
                     x.modifierCategoryID !== eachModifierCategory.id &&
                     x.modifierCategoryOptionsID !== eachOption.id
               )
               setSelectedModifierOptions({
                  ...selectedModifierOptions,
                  single: newSelectedOptions,
               })
               return
            }
            const newSelectedOptions = selectedModifierOptions.single
            newSelectedOptions[existCategoryIndex] = selectedOption
            setSelectedModifierOptions({
               ...selectedModifierOptions,
               single: newSelectedOptions,
            })
            return
         } else {
            //single--> already not exist
            setSelectedModifierOptions({
               ...selectedModifierOptions,
               single: [...selectedModifierOptions.single, selectedOption],
            })
            return
         }
      }
      if (eachModifierCategory.type === 'multiple') {
         const existOptionIndex = selectedModifierOptions.multiple.findIndex(
            x => x.modifierCategoryOptionsID == eachOption.id
         )
         console.log('eachOption1', eachOption)
         //already exist option
         if (existOptionIndex !== -1) {
            const newSelectedOptions = selectedModifierOptions.multiple.filter(
               x => x.modifierCategoryOptionsID !== eachOption.id
            )
            setSelectedModifierOptions({
               ...selectedModifierOptions,
               multiple: newSelectedOptions,
            })
            return
         }
         //new option select
         else {
            console.log('eachOption2', eachOption)
            setSelectedModifierOptions({
               ...selectedModifierOptions,
               multiple: [...selectedModifierOptions.multiple, selectedOption],
            })
         }
      }
   }

   const renderIcon = (category, option) => {
      const isOptionSelected = selectedModifierOptions[category.type].find(
         x =>
            x.modifierCategoryID === category.id &&
            x.modifierCategoryOptionsID === option.id
      )
      if (category.type === 'single') {
         return isOptionSelected ? (
            <CircleCheckedIcon color="#367BF5" />
         ) : (
            <CircleIcon color="#aaa" />
         )
      } else {
         return isOptionSelected ? (
            <SquareCheckedIcon color="#367BF5" />
         ) : (
            <SquareIcon color="#aaa" />
         )
      }
   }
   return (
      <Styles.MCategory>
         <Flex container align="center">
            <Text as="text2">{category.name}</Text>
            <Spacer xAxis size="8px" />
            <Text as="subtitle">{renderConditionText(category)}</Text>
         </Flex>
         {errorCategories.includes(category.id) && (
            <>
               <br />
               <span
                  style={{
                     fontStyle: 'italic',
                     fontSize: '11px',
                     color: 'red',
                  }}
               >
                  {('You have to choose this category.')}
               </span>
            </>
         )}
         <Spacer size="4px" />
         {category.options.map(option => (
            <ModifierOptionWrapper
               key={option.id}
               option={option}
               renderIcon={renderIcon}
               selectModifierOption={selectModifierOption}
               category={category}
               renderConditionText={renderConditionText}
               nestedSelectedModifierOptions={nestedSelectedModifierOptions}
               setNestedSelectedModifierOptions={
                  setNestedSelectedModifierOptions
               }
               nestedErrorCategories={nestedErrorCategories}
            />
         ))}
      </Styles.MCategory>
   )
}

const ModifierOptionWrapper = ({
   option,
   selectModifierOption,
   category,
   nestedSelectedModifierOptions,
   setNestedSelectedModifierOptions,
   renderConditionText,
   renderIcon,
   nestedErrorCategories
}) => {
   const [showAdditionalModifierOptions, setShowAdditionalModifierOptions] =
      React.useState(false)
   const onCustomizeClick = () => {
      setShowAdditionalModifierOptions(prev => !prev)
   }

   return (
      <div>
         <ModifierOption
            key={option.id}
            option={option}
            renderIcon={renderIcon}
            selectModifierOption={selectModifierOption}
            category={category}
            onCustomizeClick={onCustomizeClick}
         />
         {showAdditionalModifierOptions &&
            option.additionalModifierTemplate.categories.map(
               eachAdditionalCategory => (
                  <ModifierCategory
                     key={`${eachAdditionalCategory.id} - ${option.id}`}
                     category={eachAdditionalCategory}
                     selectedModifierOptions={nestedSelectedModifierOptions}
                     setSelectedModifierOptions={
                        setNestedSelectedModifierOptions
                     }
                     parentModifierOptionId={option.id}
                     renderConditionText={renderConditionText}
                     renderIcon={renderIcon}
                     selectModifierOption={selectModifierOption}
                     errorCategories={nestedErrorCategories}
                  />
               )
            )}
      </div>
   )
}

const Styles = {
   Option: styled.div`
      margin-bottom: 16px;
      padding: 0 8px;
      height: 56px;
      display: flex;
      background: #fff;
      border: 1px solid ${props => (props.selected ? '#367BF5' : '#efefef')};
      cursor: ${props => (props.faded ? 'not-allowed' : 'pointer')};
      justify-content: space-between;
      align-items: center;
      opacity: ${props => (props.faded ? '0.7' : '1')};
   `,
   Price: styled.span(
      ({ strike }) => css`
         text-decoration-line: ${strike ? 'line-through' : 'none'};
         margin-right: ${strike ? '1ch' : '0'};
      `
   ),
   MCategory: styled.div``,
   OptionImage: styled.img`
      height: 40px;
      width: 40px;
      border-radius: 2px;
      object-fit: cover;
   `,
   TunnelBody: styled(Flex)`
      position: relative;
      height: inherit;
   `,
   Fixed: styled(Flex)`
      position: absolute;
      bottom: 0;
   `,
}
