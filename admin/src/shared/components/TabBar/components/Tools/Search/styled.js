import styled from 'styled-components'

export const SearchWrapper = styled.div`
   position: fixed;
   left: 0px;
   right: 0px;
   bottom: 0px;
   top: 46px;
   background: rgba(255, 255, 255, 0.13);
   border: 1px solid #f2f3f3;
   backdrop-filter: blur(44.37px);
   border-radius: 10px;
   z-index: 100;
   padding: 100px 24px;
`
export const SearchBox = styled.div`
   width: 100%;
   height: 68px;
   display: flex;
   align-items: center;
   background: rgba(255, 255, 255, 0.13);
   border: 1px solid #e0e0e0;
   box-shadow: 9px 14px 44px rgba(0, 0, 0, 0.09);
   backdrop-filter: blur(44.37px);
   border-radius: 10px;
   > input {
      border: none;
      height: 64px;
      width: 100%;
      background: rgba(255, 255, 255, 0.13);
      backdrop-filter: blur(44.37px);
      border-radius: 10px;
      font-size: 16px;
      line-height: 16px;
      letter-spacing: 0.44px;
      color: #202020;
      outline: none;
      ::placeholder {
         font-style: normal;
         font-weight: bold;
         font-size: 16px;
         line-height: 16px;
         letter-spacing: 0.44px;
         color: #919699;
      }
   }
   > span {
      padding: 5px 25px;
   }
`
