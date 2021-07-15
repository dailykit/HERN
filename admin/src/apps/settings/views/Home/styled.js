import styled from 'styled-components'

export const StyledHome = styled.div`
   margin: 0 auto;
   max-width: 1180px;
   padding: 0 16px 16px 16px;
   h1 {
      color: #555b6e;
      margin: 60px 0;
      font-size: 32px;
      font-weight: 500;
      line-height: 37px;
   }
   @media (max-width: 1180px) {
      width: calc(100% - 40px);
   }
`

export const StyledCardList = styled.ul`
   width: 780px;
   display: grid;
   grid-gap: 24px;
   margin: 0 auto;
   grid-template-columns: 1fr 1fr;
   @media (max-width: 780px) {
      width: 100%;
   }
   @media (max-width: 567px) {
      grid-template-columns: 1fr;
   }
   div {
      width: 100%;
   }
`
