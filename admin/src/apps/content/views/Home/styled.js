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
   h2 {
      color: #555b6e;
      font-weight: 500;
   }
   @media (max-width: 1180px) {
      width: calc(100vw - 40px);
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
`

export const StyledCard = styled.li`
   height: 180px;
   list-style: none;
   border: 1px solid #d8d8d8;
   padding: 40px 20px 20px 20px;
   :hover {
      background: #f3f3f3;
   }
   h2 {
      color: #555b6e;
      padding: 16px 0;
      font-size: 24px;
      font-weight: 500;
   }
   p {
      color: #555b6e;
      font-size: 14px;
      font-weight: 500;
      line-height: 16px;
      margin-bottom: 16px;
   }
   span[data-type='status'] {
      color: #555b6e;
      font-size: 14px;
      line-height: 16px;
      font-style: italic;
      font-weight: normal;
   }
   span[data-type='link'] {
      float: right;
      color: #00a7e1;
      font-size: 14px;
      font-weight: 500;
      line-height: 16px;
   }
`
