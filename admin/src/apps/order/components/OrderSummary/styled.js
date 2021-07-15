import { IconButton } from '@dailykit/ui'
import styled, { css } from 'styled-components'

export const Wrapper = styled.aside`
   height: 100%;
   padding: 0 12px 12px 12px;
   border-right: 1px solid #e7e7e7;
   border-left: 1px solid #e7e7e7;
`

export const FilterSection = styled.section`
   h3 {
      font-size: 14px;
      font-weight: 400;
      color: rgb(136, 141, 157);
   }
   span {
      width: 50%;
      font-size: 14px;
      font-weight: 500;
   }
`

export const Spacer = styled.div(
   ({ size, xAxis }) => css`
      flex-shrink: 0;
      ${xAxis ? `width: ${size};` : `height: ${size};`}
   `
)
export const StyledIconButton = styled(IconButton)`
   display: none;
   @media (orientation: portrait) {
      display: block;
   }
`
