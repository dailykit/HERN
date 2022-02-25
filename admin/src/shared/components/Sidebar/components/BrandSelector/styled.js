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
