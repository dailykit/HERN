import styled, { css } from 'styled-components'

export const Styles = {
   DeleteBtn: styled.span(
      () => css`
         position: absolute;
         bottom: 8px;
         right: 8px;
      `
   ),
   Status: styled.div(
      ({ status }) => css`
         top: -3px;
         right: -3px;
         color: #fff;
         height: 32px;
         cursor: pointer;
         font-size: 14px;
         padding-left: 8px;
         position: absolute;
         align-items: center;
         display: inline-flex;
         background: ${selectColor(status)};
         :hover {
            filter: brightness(85%);
         }
         span {
            width: 32px;
            height: 32px;
            display: block;
            align-items: center;
            display: inline-flex;
            justify-content: center;
         }
      `
   ),
   Order: styled.div(
      ({ status }) => css`
         padding: 16px;
         display: flex;
         flex-direction: column;
         background: #fff;
         position: relative;
      `
   ),
}

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
