import { IconButton } from '@dailykit/ui'
import styled from 'styled-components'

const Styles = {
   ModalWrapper: styled.div`
      position: absolute;
      padding: 0 8px;
      top: 60px;
      bottom: 42px;
      left: 0;
      right: 0;
      display: ${({ show }) => (show ? 'flex' : 'none')};
      backdrop-filter: ${({ hasContent }) =>
         hasContent ? 'blur(11.37px)' : 'none'};
      z-index: 99999999;

      @media only screen and (max-width: 565px) {
         justify-content: center;
         padding-bottom: 0;
      }
   `,
   ModalHeader: styled.div`
      position: absolute;
      right: 40px;
      top: 0;
      > button {
         color: #45484c;
         > span > svg {
            stroke: #45484c;
         }
      }
   `,

   MenuArea: styled.div`
      min-width: 330px;
      width: 330px;
      background: #320e3b;
      border-radius: 30px;
      color: #fff;
      padding: 16px;
   `,
   MenuAreaHeader: styled.div`
      color: #fff;
      margin: 20px 16px 10px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      h2 {
         text-align: center;
         font-weight: 500;
         font-size: 19px;
         line-height: 20px;
         text-transform: capitalize;
         color: #fff;
      }
      p {
         color: #fff;
         font-size: 12px;
         font-weight: normal;
         line-height: 17px;
         text-align: center;
         letter-spacing: 0.02em;
         padding: 10px;
      }
      @media only screen and (max-width: 565px) {
         div {
            justify-content: space-between;
         }
      }
   `,
   MenuBody: styled.div`
      height: calc(100% - 90px);
      overflow-y: auto;
      ::-webkit-scrollbar {
         width: 6px;
      }
      ::-webkit-scrollbar-thumb {
         background-color: rgba(196, 196, 196, 0.9);
         border-radius: 4px;
      }
   `,

   ContentArea: styled.div`
      width: 100%;
      padding: 16px;
      overflow: auto;
      display: ${({ hasContent, isContentOpen }) =>
         hasContent && isContentOpen ? 'block' : 'none'};
      margin-top: 16px;
      @media only screen and (max-width: 565px) {
         position: absolute;
         bottom: 0;
         left: 0;
         top: 0;
         height: 100vh;
         background: rgba(255, 255, 255, 0.13);
         border: 1px solid #f2f3f3;
         backdrop-filter: blur(11.37px);
      }
      > button {
         color: #45484c;
         text-transform: uppercase;
         position: absolute;
         top: 0;
         right: 16px;
      }
      div#content-area {
         overflow: auto;
      }
   `,
   CloseButton: styled(IconButton)`
      display: none;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #320e3b;
      box-shadow: 1px 1px 2px rgba(73, 20, 86, 0.3),
         -1px -1px 2px rgba(28, 8, 32, 0.5),
         inset -4px 4px 8px rgba(28, 8, 32, 0.2),
         inset 4px -4px 8px rgba(28, 8, 32, 0.2),
         inset -4px -4px 8px rgba(73, 20, 86, 0.9),
         inset 4px 4px 10px rgba(28, 8, 32, 0.9);
      @media only screen and (max-width: 565px) {
         display: block;
      }
   `,
}

export default Styles
