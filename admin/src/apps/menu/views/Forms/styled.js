import styled from 'styled-components'

export const StyledWrapper = styled.div`
   margin: 0 auto;

   h1 {
      color: #555b6e;
      font-size: 20px;
      font-weight: 500;
      line-height: 23px;
   }
`

export const StyledHeader = styled.div`
   height: 80px;
   display: flex;
   align-items: center;
   justify-content: space-between;
   border-bottom: 1px solid #d8d8d8;
`

export const MasterSettings = styled.div`
   display: flex;
   align-items: center;

   div {
      display: flex;
      align-items: center;
      margin-left: 32px;

      label {
         color: #555b6e;
      }
   }
`

export const StyledForm = styled.div`
   padding: 40px 0;
`

export const StyledRow = styled.div`
   display: flex;
   > div {
      width: 280px;
      margin-right: 24px;
      margin-bottom: 24px;
      input {
         font-weight: 400 !important;
      }
   }
`

export const StyledHeading = styled.h3`
   color: #888d9d;
   font-size: 16px;
   font-weight: 400;
`

export const StyledSection = styled.div`
   margin-top: 48px;
`

export const StyledTunnelHeader = styled.div`
   padding: 24px;
   display: flex;
   align-items: center;
   justify-content: space-between;
   > div {
      display: flex;
      align-items: center;
   }
   h1 {
      color: #888d9d;
      font-size: 18px;
      font-weight: 400;
      margin-left: 12px;
   }
`

export const StyledTunnelMain = styled.div`
   padding: 0 24px 24px 24px;
`

export const FormActions = styled.div`
   width: 100%;
   text-align: right;
`

export const MainFormArea = styled.div`
   width: 100%;
   min-height: 80vh;
   background-color: #e5e5e5;
   padding: 20px;
`

export const Stats = styled.div`
   display: flex;
   justify-content: space-between;
   span {
      margin-bottom: 5px;
   }

   h4 {
      color: #555b6e;
   }
`

export const Message = styled.div`
   text-align: center;
`
