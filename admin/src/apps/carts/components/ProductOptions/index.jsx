import React from 'react'
import styled, { css } from 'styled-components'
import { Filler, Flex, Text } from '@dailykit/ui'

import { calcDiscountedPrice, currencyFmt } from '../../../../shared/utils'

const ProductOptions = ({
   productOptions = [],
   selectedOption,
   handleOptionSelect,
}) => {
   return (
      <>
         {productOptions.length ? (
            productOptions.map(option => {
               if (!option.isPublished) {
                  return null
               }
               return (
                  <Styles.Option
                     key={option.id}
                     selected={selectedOption?.id === option.id}
                     onClick={() => {
                        if (option.isPublished && option.isAvailable) {
                           handleOptionSelect(option)
                        }
                     }}
                     faded={!(option.isPublished && option.isAvailable)}
                  >
                     <Text as="text1"> {option.label} </Text>
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
               )
            })
         ) : (
            <Filler message="No options found!" />
         )}
      </>
   )
}

export default ProductOptions

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
}
