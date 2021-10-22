import styled from 'styled-components'

export const WeeklyReportContainer = styled.div`
   display: flex;
   flex-direction: column;
   // border: 1px solid #f3f3f3;
   background: #ffffff;
   // border: 1px solid #ffffff;
   // box-sizing: border-box;
   // border-radius: 6px;
   // padding: 0px 20px 20px 20px;
   margin-bottom: 20px;
   width: 100%;
   // box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
   @media (max-width: 768px) {
      padding: 15px;
      align-items: center;
   }
`
export const WeeklyReports = styled.div`
   display: grid;
   grid-template-columns: 280px 280px 280px;
   grid-template-rows: 120px;
   // grid-gap: 36px;

   justify-content: space-between;
   @media (max-width: 768px) {
      display: flex;
      flex-direction: column;
   }
`
export const Card = styled.div`
   display: flex;
   flex-direction: column;
   position: relative;
   width: 282.04px;
   height: 120px;
   border-radius: 20px;
   background: #ffffff;
   box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
`
export const CardText = styled.div`
   position: relative;
   width: 159px;
   height: 16px;
   left: 14px;
   top: 28px;

   font-family: Roboto;
   font-style: normal;
   font-weight: normal;
   font-size: 14px;
   line-height: 16px;

   color: #202020;
`
export const CardTotal = styled.div`
   position: relative;
   width: 87px;
   height: 33px;
   left: 14px;
   top: 56px;

   font-family: Roboto;
   font-style: normal;
   font-weight: 500;
   font-size: 28px;
   line-height: 33px;
   /* identical to box height */

   color: #202020;
`
export const CardGraph = styled.div`
   position: relative;
   width: 77.64px;
   height: 72.15px;
   left: 186px;
   bottom: 20px;
   border-left: 1px solid #f3f3f3;
   border-radius: 1px;
`
