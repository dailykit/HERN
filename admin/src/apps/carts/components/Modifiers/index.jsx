import React from 'react'
import { Flex, Spacer, Text } from '@dailykit/ui'
import styled, { css } from 'styled-components'
import { getModifiersValidator } from './utils'
import { DownVector, UpVector } from '../../assets/svgs/Vector'
import { useModifier } from '../../utils/useModifier'
import { ModifierCategory } from './modifierCategory'

const Modifiers = ({
   data,
   handleChange,
   additionalModifiers,
   productOption,
   setProductOption,
   errorCategories,
   nestedErrorCategories
}) => {

   const renderConditionText = category => {
      if (category.type === 'single') {
         return 'CHOOSE ONE*'
      } else {
         if (category.isRequired) {
            if (category.limits.min) {
               if (category.limits.max) {
                  return `CHOOSE AT LEAST ${category.limits.min} AND AT MOST ${category.limits.max}*`
               } else {
                  return `CHOOSE AT LEAST ${category.limits.min}*`
               }
            } else {
               if (category.limits.max) {
                  return `CHOOSE AT LEAST 1 AND AT MOST ${category.limits.max}*`
               } else {
                  return `CHOOSE AT LEAST 1*`
               }
            }
         } else {
            if (category.limits.max) {
               return `CHOOSE AS MANY AS YOU LIKE UPTO ${category.limits.max}`
            } else {
               return 'CHOOSE AS MANY AS YOU LIKE'
            }
         }
      }
   }

   const {
      selectedModifierOptions,
      setSelectedModifierOptions,
      status,
   } = useModifier({
      productOption,
      forNewItem: false,
      edit: false,
      setProductOption,
      simpleModifier: true,
   })

   const {
      selectedModifierOptions: nestedSelectedModifierOptions,
      setSelectedModifierOptions: setNestedSelectedModifierOptions,
      status: nestedStatus,
   } = useModifier({
      productOption,
      forNewItem: false,
      edit: false,
      setProductOption,
      nestedModifier: true,
   })

   React.useEffect(() => {
      // const isValid = checkModifierStateValidity(selectedModifiers)
      handleChange({
         isValid: true,
         selectedModifiers: [
            ...selectedModifierOptions.single,
            ...selectedModifierOptions.multiple,
         ],
         selectedNestedModifiers: [
            ...nestedSelectedModifierOptions.single,
            ...nestedSelectedModifierOptions.multiple,
         ],
      })
   }, [selectedModifierOptions, nestedSelectedModifierOptions])

   if (!data) return null
   return (
      <>
         <Text as="text1">Modifiers</Text>
         <Spacer size="12px" />
         {additionalModifiers.length > 0 &&
            additionalModifiers.map(eachAdditionalModifier => (
               <AdditionalModifiers
                  eachAdditionalModifier={eachAdditionalModifier}
                  renderConditionText={renderConditionText}
                  selectedModifierOptions={selectedModifierOptions}
                  setSelectedModifierOptions={setSelectedModifierOptions}
                  nestedSelectedModifierOptions={nestedSelectedModifierOptions}
                  setNestedSelectedModifierOptions={
                     setNestedSelectedModifierOptions
                  }
                  errorCategories={errorCategories}
                  nestedErrorCategories={nestedErrorCategories}
               />
            ))}
         {data.categories.map(category => (
            <ModifierCategory
               category={category}
               key={category.id}
               renderConditionText={renderConditionText}
               selectedModifierOptions={selectedModifierOptions}
               setSelectedModifierOptions={setSelectedModifierOptions}
               errorCategories={errorCategories}
               nestedErrorCategories={nestedErrorCategories}
            />
         ))}
      </>
   )
}

const AdditionalModifiers = ({
   eachAdditionalModifier,
   renderConditionText,
   selectedModifierOptions,
   setSelectedModifierOptions,
   nestedSelectedModifierOptions,
   setNestedSelectedModifierOptions,
   errorCategories,
   nestedErrorCategories
}) => {
   const additionalModifiersType = React.useMemo(
      () => eachAdditionalModifier.type == 'hidden',
      [eachAdditionalModifier]
   )
   const [showCustomize, setShowCustomize] = React.useState(
      !Boolean(additionalModifiersType)
   )
   return (
      <div className="">
         <div
            className=""
            onClick={() => setShowCustomize(prev => !prev)}
            style={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               cursor: 'pointer',
            }}
         >
            <span className="" data-translation="true">
               {eachAdditionalModifier.label}
            </span>
            {showCustomize ? <UpVector size={18} /> : <DownVector size={18} />}
         </div>
         {eachAdditionalModifier.modifier.categories.map(category => (
            <ModifierCategory
               category={category}
               key={category.id}
               renderConditionText={renderConditionText}
               selectedModifierOptions={selectedModifierOptions}
               setSelectedModifierOptions={setSelectedModifierOptions}
               nestedSelectedModifierOptions={nestedSelectedModifierOptions}
               setNestedSelectedModifierOptions={
                  setNestedSelectedModifierOptions
               }
               errorCategories={errorCategories}
               nestedErrorCategories={nestedErrorCategories}
            />
         ))}
      </div>
   )
}

export default Modifiers

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
