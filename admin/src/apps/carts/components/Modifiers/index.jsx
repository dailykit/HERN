import React from 'react'
import { Flex, Spacer, Text } from '@dailykit/ui'
import styled, { css } from 'styled-components'

import CircleIcon from '../../../../shared/assets/icons/Circle'
import CircleCheckedIcon from '../../../../shared/assets/icons/CircleChecked'
import SquareIcon from '../../../../shared/assets/icons/Square'
import SquareCheckedIcon from '../../../../shared/assets/icons/SquareChecked'
import { calcDiscountedPrice, currencyFmt } from '../../../../shared/utils'
import { getModifiersValidator } from './utils'

const Modifiers = ({ data, handleChange }) => {
   const [
      checkOptionAddValidity,
      checkModifierStateValidity,
   ] = React.useMemo(() => getModifiersValidator(data), [data])

   const [selectedModifiers, setSelectedModifiers] = React.useState([])

   React.useEffect(() => {
      const isValid = checkModifierStateValidity(selectedModifiers)
      handleChange({ isValid, selectedModifiers })
   }, [selectedModifiers.length])

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
               return 'CHOOSE AS MANY AS YOU LIKE'
            } else {
               return `CHOOSE AS MANY AS YOU LIKE UPTO ${category.limits.max}`
            }
         }
      }
   }

   const selectModifierOption = option => {
      const alreadyExists = selectedModifiers.find(
         item => item.data[0].modifierOptionId === option.id
      )
      if (alreadyExists) {
         // remove item
         const updatedItems = selectedModifiers.filter(
            item => item.data[0].modifierOptionId !== option.id
         )
         setSelectedModifiers(updatedItems)
         console.log('Removing...')
      } else {
         // add item
         const isValid = checkOptionAddValidity(selectedModifiers, option)
         if (isValid) {
            setSelectedModifiers([...selectedModifiers, option.cartItem])
            console.log('Adding...')
         } else {
            console.log('Cannot add!')
         }
      }
   }

   const renderIcon = (type, option) => {
      const exists = selectedModifiers.find(
         op => op.data[0].modifierOptionId === option.id
      )
      if (type === 'single') {
         return exists ? (
            <CircleCheckedIcon color="#367BF5" />
         ) : (
            <CircleIcon color="#aaa" />
         )
      } else {
         return exists ? (
            <SquareCheckedIcon color="#367BF5" />
         ) : (
            <SquareIcon color="#aaa" />
         )
      }
   }

   if (!data) return null
   return (
      <>
         <Text as="text1">Modifiers</Text>
         <Spacer size="12px" />
         {data.categories.map(category => (
            <Styles.MCategory key={category.id}>
               <Flex container align="center">
                  <Text as="text2">{category.name}</Text>
                  <Spacer xAxis size="8px" />
                  <Text as="subtitle">{renderConditionText(category)}</Text>
               </Flex>
               <Spacer size="4px" />
               {category.options.map(option => (
                  <Styles.Option
                     key={option.id}
                     onClick={() =>
                        option.isActive && selectModifierOption(option)
                     }
                     faded={!option.isActive}
                  >
                     <Flex container alignItems="center">
                        {renderIcon(category.type, option)}
                        <Spacer xAxis size="8px" />
                        {Boolean(option.image) && (
                           <>
                              <Styles.OptionImage src={option.image} />
                              <Spacer xAxis size="8px" />
                           </>
                        )}
                        <Text as="text2"> {option.name} </Text>
                     </Flex>
                     <Flex container alignItems="center">
                        {option.discount ? (
                           <>
                              <Styles.Price strike>
                                 {currencyFmt(option.price)}
                              </Styles.Price>
                              <Styles.Price>
                                 +{' '}
                                 {currencyFmt(
                                    calcDiscountedPrice(
                                       option.price,
                                       option.discount
                                    )
                                 )}
                              </Styles.Price>
                           </>
                        ) : (
                           <Styles.Price>
                              + {currencyFmt(option.price)}
                           </Styles.Price>
                        )}
                     </Flex>
                  </Styles.Option>
               ))}
            </Styles.MCategory>
         ))}
      </>
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
