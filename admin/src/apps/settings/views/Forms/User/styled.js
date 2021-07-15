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
