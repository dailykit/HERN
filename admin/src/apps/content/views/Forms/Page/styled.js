import styled from 'styled-components'

export const StyledWrapper = styled.div`
   background-color: #e5e5e5;
   margin: 0;
   /* width */
   ::-webkit-scrollbar {
      width: 6px;
   }

   /* Track */
   ::-webkit-scrollbar-track {
      background: #f4f4f4;
   }

   /* Handle */
   ::-webkit-scrollbar-thumb {
      background: #919699;
      opacity: 0.5;
      border-radius: 20px;
   }

   /* Handle on hover */
   ::-webkit-scrollbar-thumb:hover {
      background: #919699;
   }
   h1 {
      color: #555b6e;
      font-size: 20px;
      font-weight: 500;
      line-height: 23px;
   }
`

export const InputWrapper = styled.div`
   background-color: #ffffff;
   padding: 32px 32px 0 32px;
`
export const StyledComp = styled.div`
   padding: 32px;
   background-color: #e5e5e5;
   .pageDetails {
      height: max-content;
      width: 100%;
   }
`
export const StyledInsight = styled.div`
   margin-left: 26px;
   padding-left: 16px;
   background: #fff;
   width: 100%;
   height: inherit;
   max-width: 897.2px;
   max-height: 620px;
   overflow: auto;
   box-sizing: border-box;
`

export const StyledDiv = styled.div`
   padding: 0;
   background-color: #ffffff;
   .styleTab {
      margin-bottom: 16px;
      padding-left: 32px;
   }
   #tabs--1--panel--0 {
      padding: 0;
   }
   #tabs--1--panel--1 {
      padding: 0;
   }
`
export const Highlight = styled.p`
   color: #00a7e1;
   cursor: pointer;
   margin: 0;
   &:hover {
      text-decoration: underline;
   }
`
