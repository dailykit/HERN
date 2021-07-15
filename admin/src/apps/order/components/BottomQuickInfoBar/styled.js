import styled, { css } from 'styled-components'

const selectColor = variant => {
   switch (variant) {
      case 'ORDER_ALL':
         return '#555B6E'
      case 'ORDER_PENDING':
         return '#FF5A52'
      case 'ORDER_UNDER_PROCESSING':
         return '#FBB13C'
      case 'ORDER_READY_TO_DISPATCH':
         return '#3C91E6'
      case 'ORDER_OUT_FOR_DELIVERY':
         return '#1EA896'
      case 'ORDER_DELIVERED':
         return '#53C22B'
      case 'ORDER_REJECTED_OR_CANCELLED':
         return '#C6C9CA'
      default:
         return '#555B6E'
   }
}

export const Wrapper = styled.button(
   ({ variant }) => css`
      padding: 12px;
      cursor: pointer;
      border: 1px solid rgba(0, 0, 0, 0.09);
      border-left: 6px solid ${selectColor(variant)};
      &.active,
      &:hover {
         box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.09);
      }
      header {
         display: flex;
         align-items: center;
         justify-content: space-between;
         h2 {
            font-weight: 500;
            font-size: 14px;
         }
      }
      main {
         display: flex;
         margin-top: 8px;
         justify-content: space-between;
         span {
            font-size: 20px;
         }
      }
      display: none;
      @media (orientation: portrait) {
         display: block;
      }
   `
)

export const SachetWrapper = styled.button`
   padding: 4px 16px;
   border: none;
   section:first-child {
      display: flex;
      align-items: center;
      justify-content: space-between;
      h4 {
         font-size: 14px;
         color: #555b6e;
      }
   }
   > section:nth-of-type(2) {
      display: flex;
      flex-direction: column;
      section {
         display: flex;
         align-items: center;
         justify-content: space-between;
         span:first-child {
            color: #9aa5ab;
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 0.6px;
            text-transform: uppercase;
         }
      }
   }
   display: none;
   @media (orientation: portrait) {
      display: block;
   }
`
