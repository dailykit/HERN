import styled from 'styled-components'

export const StyledHome = styled.div`
   margin: 0 auto;
   max-width: 1280px;
   padding-bottom: 20px;
   h1 {
      color: #555b6e;
      margin: 30px 40px;
      font-size: 32px;
      font-weight: 500;
      line-height: 37px;
   }
   @media (max-width: 1180px) {
      width: calc(100% - 40px);
   }
`

export const StyledCardList = styled.ul`
   display: grid;
   grid-gap: 30px;
   margin: 30px 40px;
   grid-template-columns: 1fr 1fr 1fr;
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
