import styled, { css } from 'styled-components'

export const Wrapper = styled.footer`
   display: flex;
   padding-left: 12px;
   background: #f3f3f3;
   align-items: center;
`

export const StyledNav = styled.div(
   ({ align }) => css`
      display: flex;
      ${align === 'right' &&
      css`
         margin-left: auto;
      `}
     
      button {
         width: 30px;
         height: 40px;
         border: none;
         cursor: pointer;
         background: transparent;
         :hover,
         :focus {
            background: #fff;
         }
         svg {
            display: unset;
         }
      }
   `
)

export const Section = styled.section`
   display: flex;
   font-size: 14px;
   align-items: center;
   font-weight: 500;
   line-height: 16px;
   color: #555b6e;
   margin-bottom: 7px;
   span:first-child {
      height: 20px;
      width: 20px;
      margin-right: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
   }
   + section {
      margin-left: 80px;
      margin-bottom: 7px;
   }
`

export const StatusBadge = styled.span(
   ({ status }) => `
   height: 8px;
   width: 8px;
   margin-left: 8px;
   border-radius: 50%;
   display: inline-block;
   ${
      status === 'online'
         ? css`
              background: #367bf5;
           `
         : css`
              background: #c2cac3;
           `
   }
`
)
