import React from 'react'
import styled from 'styled-components'
import { Flex, Text } from '@dailykit/ui'

import { convertRange } from '../../utils/convertRange'

/**
 * A react component for rendering ranged values.
 * @param {{min: number, max: number, value: number, minLabel: string, maxLabel: string, label: string, unit?: string, style?: any}} props
 */
export const Ranger = ({
   min,
   max,
   value,
   minLabel,
   maxLabel,
   unit,
   label,
   style,
}) => {
   // convert from range [min..max] to range [0..90], 10% is taken.
   const greenWidth = convertRange(min, max, value, 0, 90)

   return (
      <>
         <StyledProgress style={style}>
            <StyledProgressBar width={10} color="#FF5A52" role="progressbar">
               {greenWidth <= 0 ? (
                  <Content warn={greenWidth <= 0}>
                     <p>{label}</p>
                     <h5>
                        {value} {unit}
                     </h5>
                  </Content>
               ) : null}
            </StyledProgressBar>
            <StyledProgressBar
               width={greenWidth}
               color="#53C22B"
               role="progressbar"
            >
               {greenWidth > 0 ? (
                  <Content warn={greenWidth <= 0}>
                     <p>{label}</p>
                     <h5>
                        {value} {unit}
                     </h5>
                  </Content>
               ) : null}
            </StyledProgressBar>
         </StyledProgress>
         <Flex width="100%" container justifyContent="space-between">
            <Text as="p">
               {minLabel}: {min || 'N/A'}
            </Text>
            <Text as="p">
               {maxLabel}: {max || 'N/A'}
            </Text>
         </Flex>
      </>
   )
}

const StyledProgress = styled.div`
   width: 100%;
   height: 5px;
   background-color: #cbf0bd;
   display: flex;
`

const StyledProgressBar = styled.div`
   background-color: ${({ color }) => color};
   width: ${({ width }) => `${width}%`};
   height: 100%;
   position: relative;
`

const Content = styled.div`
   padding: 0.4rem 1rem;
   color: #fff;
   background-color: ${({ warn }) => (warn ? '#ff5a52' : '#53c22b')};
   text-align: left;
   min-width: 115px;
   position: absolute;
   right: 0%;
   left: ${({ warn }) => (warn ? '0' : null)};
   bottom: 270%;
   z-index: 3;
   p {
      margin: 0;
      margin-bottom: 4px;
      font-weight: 500;
      font-size: 14px;
      line-height: 16px;
   }
   h5 {
      margin: 0;
      font-weight: 500;
      font-size: 24px;
      line-height: 28px;
   }
   &::before {
      content: '';
      width: 20px;
      height: 20px;
      background-color: ${({ warn }) => (warn ? '#ff5a52' : '#53c22b')};
      position: absolute;
      bottom: -4px;
      transform: rotate(45deg);
      border-radius: 4px;
      z-index: -1;
      right: 0;
      right: ${({ warn }) => (warn ? '91px' : '3px')};
   }
`
