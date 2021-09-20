import { IconButton } from '@dailykit/ui'
import styled from 'styled-components'

const Styles = {
   Header: styled.header`
      display: flex;
      width: 100vw;
      ${({ isTabHidden }) => isTabHidden && 'justify-content: space-between'}
   `,
   Logo: styled(IconButton)`
      position: relative;
      cursor: pointer;
      background: #ffffff;
      height: 32px;
      width: 32px;
      border-radius: 50%;
      outline: none;
      background: ${props =>
         props.open
            ? `#F8F8F7`
            : `linear-gradient(135deg, #ffffff 0%, #f2f2f2 100%)`};

      box-shadow: ${props =>
         props.open
            ? `1px 1px 2px rgba(255, 255, 255, 0.3), -1px -1px 2px rgba(206, 206, 205, 0.5), inset -1px 1px 2px rgba(206, 206, 205, 0.2), inset 1px -1px 2px rgba(206, 206, 205, 0.2), inset -1px -1px 2px rgba(255, 255, 255, 0.9), inset 1px 1px 3px rgba(206, 206, 205, 0.9)`
            : `-2px 2px 4px rgba(189, 189, 189, 0.2),
         2px -2px 4px rgba(189, 189, 189, 0.2),
         -2px -2px 4px rgba(255, 255, 255, 0.9),
         2px 2px 5px rgba(189, 189, 189, 0.9),
         inset 1px 1px 2px rgba(255, 255, 255, 0.3),
         inset -1px -1px 2px rgba(189, 189, 189, 0.5)`};
      > svg {
         position: absolute;
         top: 3px;
         right: 3px;
      }
   `,
   TabStatus: styled.span`
      display: flex;
      align-items: center;
      margin-left: 34px;
      > span {
         height: 24px;
         font-size: 14px;
         color: #919699;
      }
      > button {
         border: none;
         border-radius: 4px;
         margin-left: 16px;
         border-top: none;
         border-right: none;
         height: 28px;
         color: #367bf5;
         font-weight: 700;
         font-size: 14px;
         line-height: 24px;
         padding: 2px 16px;
         background-color: #ebf1f4;
      }
   `,
}

export default Styles
