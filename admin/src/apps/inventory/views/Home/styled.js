import styled from 'styled-components'

export const StyledHome = styled.div`
   width: 1280px;
   margin: 0 auto;
   padding-bottom: 20px;
   h1 {
      color: #555b6e;
      margin: 30px 40px;
      font-size: 32px;
      font-weight: 500;
      line-height: 37px;
   }
   @media (max-width: 1180px) {
      width: calc(100vw - 40px);
   }
`

export const StyledTileContainer = styled.div`
   width: 70%;
   margin: 0 auto;
   display: grid;
   grid-template-columns: repeat(2, 1fr);
   grid-gap: 24px;
   align-content: center;
   justify-items: center;
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
