import styled from 'styled-components'

export const StyledBrandSelector = styled.div`
   width: 100%;
   height: 66px;
   display: flex;
   background: #ffffff;
   border: 1px solid #f3f3f3;
   box-sizing: border-box;
   box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.05);
   border-radius: 4px;
   align-items: center;
   padding: 7px;
   cursor: pointer;

   > div:nth-child(1) {
   }
   > div:nth-child(2) {
      display: flex;
      width: 100%;
      justify-content: space-between;
      align-items: center;
   }
`
export const StyledBrandName = styled.div`
   padding: 0px 8px;
   font-family: Roboto;
   font-style: normal;
   text-align: left;

   > p:nth-child(1) {
      font-weight: normal;
      font-size: 10px;
      line-height: 12px;

      color: #919699;
   }
   > p:nth-child(2) {
      font-weight: 500;
      font-size: 13px;
      line-height: 15px;

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
   width: 93.5%;
   padding: 7px;
   border-radius: 4px;
   cursor: pointer;
   color: ${props => (props.active ? `#367BF5` : `#555B6E`)};
   > div:nth-child(n) {
      display: flex;
      padding: 7px;
      align-items: center;
      column-gap: 7px;
      :hover {
         background-color: #f9f9f9;
         border-radius: 4px;
      }
   }
`
export const StyledBrandLocations = styled.div`
   width: 100%;
   height: 40px;
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

      > span:nth-child(1) {
         font-weight: normal;
         font-size: 10px;
         line-height: 12px;

         color: #919699;
      }
      > span:nth-child(2) {
         font-weight: 500;
         font-size: 13px;
         line-height: 15px;

         color: #555b6e;
      }
   }
   > div:nth-child(2) {
   }
`
