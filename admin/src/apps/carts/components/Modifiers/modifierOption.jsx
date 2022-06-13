import { Flex, Spacer, Text } from '@dailykit/ui'
import React from 'react'
import styled, { css } from 'styled-components'
import { calcDiscountedPrice, currencyFmt } from '../../../../shared/utils'

export const ModifierOption = ({
   selectModifierOption,
   renderIcon,
   option,
   category,
   onCustomizeClick
}) => {
   return (
      <Styles.Option
         key={option.id}
         onClick={() =>
            option.isActive && selectModifierOption(option, category)
         }
         faded={!option.isActive}
      >
         <Flex container alignItems="center">
            {renderIcon(category, option)}
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
            {option.price === 0 ? null : option.discount ? (
               <>
                  <Styles.Price strike>
                     {currencyFmt(option.price)}
                  </Styles.Price>
                  <Styles.Price>
                     +{' '}
                     {currencyFmt(
                        calcDiscountedPrice(option.price, option.discount)
                     )}
                  </Styles.Price>
               </>
            ) : (
               <Styles.Price>+ {currencyFmt(option.price)}</Styles.Price>
            )}
            {option.additionalModifierTemplateId && (
               <span
                  onClick={e => {
                      if (onCustomizeClick) {
                         e.stopPropagation()
                         onCustomizeClick()
                      }
                  }}
                    style={{textDecoration:'underline'}}
               >
                  {'customize'}
               </span>
            )}
         </Flex>
      </Styles.Option>
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
