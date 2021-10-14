import styled from 'styled-components'

export const DashboardReport = styled.div`
   display: flex;
   flex-direction: column;
   // position: absolute;
   width: 300px;
   height: 296px;
   // left: 998px;
   // top: 68.51px;

   background: #ffffff;
   box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
   border-radius: 6px;
`
export const SvgBoxReport = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   padding: 8px 9px;
`
export const UserText = styled.div`
   font-family: Roboto;
   font-style: normal;
   font-weight: normal;
   padding: 4px 9px;
   p {
      padding: 3px 0px;
      font-size: 14px;
      line-height: 16px;
      color: #202020;
   }
   span {
      padding: 3px 0px;
      font-size: 16px;
      line-height: 19px;
      color: #555b6e;
   }
`
export const OptionTypes = styled.ul`
   font-family: Roboto;
   font-style: normal;
   font-weight: normal;
   font-size: 16px;
   line-height: 19px;
   color: #367bf5;
   padding: 4px 9px;
   list-style-type: none;
   li {
      cursor: pointer;
      padding: 8px 0px;
      :hover {
         font-weight: 500;
      }
   }
`
export const ViewBtn = styled.div`
   display: flex;
   justify-content: flex-end;
   width: 100%;
`
