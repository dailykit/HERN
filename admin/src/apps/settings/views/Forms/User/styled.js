import styled from 'styled-components'

export const StyledSelect = styled.select`
   height: 40px;
   border: none;
   font-size: 16px;
   font-weight: 400;
   margin-right: 8px;
   border-bottom: 1px solid rgba(0, 0, 0, 0.2);
`

export const Section = styled.section`
   width: 100%;
   display: flex;
   max-width: 520px;
   > * {
      flex: 1;
      margin-top: 16px;
      margin-right: 16px;
   }
`

export const StyledTemp = styled.section`
   display: flex;
   margin-top: 24px;
   flex-direction: column;
   span:nth-of-type(1) {
      color: #9aa5ab;
      font-size: 14px;
      font-weight: 400;
      margin-bottom: 8px;
      letter-spacing: 0.6px;
      text-transform: uppercase;
   }
   span:nth-of-type(2) {
      margin-bottom: 14px;
   }
`
export const StyledBrandSelector = styled.div`
   height: 44px;
   display: flex;
   background: #ffffff;
   border: 1px solid #f3f3f3;
   box-sizing: border-box;
   box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.05);
   border-radius: 4px;
   align-items: center;
   justify-content: space-between;
   padding: 7px;
   cursor: pointer;
`
export const StyledBrandName = styled.div`
   padding: 0px 8px;
   font-family: Roboto;
   font-style: normal;
   text-align: left;

   // > p:nth-child(1) {
   //    font-weight: normal;
   //    font-size: 10px;
   //    line-height: 12px;

   //    color: #919699;
   // }
   > p:nth-child(1) {
      font-weight: 500;
      font-size: 16px;
      line-height: 18px;

      color: #555b6e;
   }
`
export const StyledBrandSelectorList = styled.div`
   position: absolute;
   background: rgba(255, 255, 255, 0.25);
   border: 1px solid #f3f3f3;
   box-sizing: border-box;
   box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.05);
   backdrop-filter: blur(20px);
   // width: ${props => (props.active ? `22.5%` : `22%`)};
   width: 244px;
   padding: 7px;
   border-radius: 4px;
   cursor: pointer;

   > div:nth-child(n) {
      display: flex;
      padding: 7px;
      align-items: center;
      color: #555b6e;
      column-gap: 7px;
      :hover {
         background-color: #f9f9f9;
         border-radius: 4px;
      }
   }
`
export const StyledBrandLocations = styled.div`
   height: 44px;
   background: #ffffff;
   border: 1px solid #f3f3f3;
   box-sizing: border-box;
   box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.05);
   border-radius: 4px;
   display: flex;
   justify-content: space-between;
   padding: 7px;
   align-items: center;

   > div:nth-child(1) {
      display: flex;
      font-family: Roboto;
      font-style: normal;
      flex-direction: column;
      text-align: left;
      gap: 2px;

      // > span:nth-child(1) {
      //    font-weight: normal;
      //    font-size: 10px;
      //    line-height: 12px;

      //    color: #919699;
      // }
      > span:nth-child(1) {
         font-weight: 500;
         font-size: 16px;
         line-height: 18px;

         color: #555b6e;
      }
   }
   > div:nth-child(2) {
   }
`
