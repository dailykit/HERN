import { IconButton } from '@dailykit/ui'
import styled from 'styled-components'

const Styles = {
   ModalWrapper: styled.div`
      position: absolute;
      height: 100%;
      width: 100%;
      top: 0px;
      bottom: 42px;
      right: 0;
      display: flex;
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
      display: ${({ isContentOpen }) => (isContentOpen ? 'none' : 'block')};
      min-width: 330px;
      width: 330px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid #f3f3f3;
      box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
      border-radius: 10px;
      color: #202020;
      padding: 16px;
   `,
   MenuAreaHeader: styled.div`
      color: #202020;
      margin: 20px 16px 10px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      h2 {
         text-align: center;
         font-weight: 600;
         font-size: 19px;
         line-height: 20px;
         text-transform: capitalize;
         color: #202020;
      }
      p {
         color: #202020;
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
      height: 480px;
      overflow-y: auto;
      ::-webkit-scrollbar {
         width: 8px;
      }
      ::-webkit-scrollbar-thumb {
         background: #f3f3f3;
         border-radius: 30px;
      }
   `,

   ContentArea: styled.div`
      width: 100%;
      padding: 16px;
      overflow: auto;
      display: ${({ hasContent, isContentOpen }) =>
         hasContent && isContentOpen ? 'block' : 'none'};
      ::-webkit-scrollbar {
         width: 8px;
      }
      ::-webkit-scrollbar-thumb {
         background: #f3f3f3;
         border-radius: 30px;
         height: 100px;
      }
      @media only screen and (max-width: 565px) {
         position: absolute;
         bottom: 0;
         left: 0;
         top: 0;
         height: 100vh;
         backdrop-filter: blur(44px);
      }
      div#content-area {
         overflow: auto;
         h3 {
            margin-top: 0px;
         }
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
