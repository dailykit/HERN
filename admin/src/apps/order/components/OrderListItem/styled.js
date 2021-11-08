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
         display: grid;
         grid-gap: 14px;

         position: relative;
         border-left-width: 8px;
         border-right-width: 8px;
         border-bottom: 1px solid #ececec;
         grid-template-columns: 220px 1fr 140px;
         border: 3px solid ${selectColor(status)};
         grid-template-areas:
            'left header right'
            'left section right';
         > aside:nth-of-type(1) {
            grid-area: left;
         }
         > aside:nth-of-type(2) {
            grid-area: right;
         }
         > header {
            grid-area: header;
         }
         > section {
            grid-area: section;
         }
         @media only screen and (max-width: 1023px) {
            height: auto;
            grid-template-columns: auto;
            grid-template-rows: auto;
            overflow-y: auto;
            grid-template-areas:
               'header'
               'right'
               'left'
               'section';
            > header {
               margin-top: 16px;
            }
         }
         @media only screen and (max-width: 1439px) and (min-width: 1024px) {
            grid-template-areas:
               'left header right'
               'left section section';
            > aside:nth-of-type(2) {
               margin-top: 16px;
            }
         }
         @media only screen and (min-width: 768px) and (orientation: portrait) {
            grid-template-columns: auto auto;
            grid-template-areas:
               'header right'
               'left left'
               'section section';
            > header {
               margin-top: 0px;
            }
         }
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
