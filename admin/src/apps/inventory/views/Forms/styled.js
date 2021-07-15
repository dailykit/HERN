import styled from 'styled-components'

export const StyledWrapper = styled.div`
   margin: 0 auto;
   max-width: 1280px;
   width: calc(100vw - 64px);
   min-height: calc(100vh - 120px);

   h1 {
      color: #555b6e;
      font-size: 20px;
      font-weight: 500;
      line-height: 23px;
   }
   table {
      width: 980px;
      margin: 0 auto;
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
      svg {
         cursor: pointer;
      }
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

export const StyledSelect = styled.select`
   border: none;
   font-weight: 500;
   font-size: 14px;
   line-height: 16px;
   color: #555b6e;
   outline: none;
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

export const FlexContainer = styled.div`
   display: flex;
`

export const Flexible = styled.div`
   flex: ${({ width }) => width};
`
export const ShadowCard = styled.div`
   padding: 12px 20px;
   border: 1px dashed #f3f3f3;
   box-sizing: border-box;
   box-shadow: 2px 3px 6px rgba(0, 0, 0, 0.13);
`
