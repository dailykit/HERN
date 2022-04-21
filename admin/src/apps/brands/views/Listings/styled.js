import styled from 'styled-components'

export const StyledWrapper = styled.div`
   > div {
      margin: 0 16px;
      max-width: 1280px;
      @media screen and (max-width: 767px) {
         width: calc(100vw - 32px);
      }
      @media screen and (min-width: 768px) {
         width: calc(100vw - 64px);
      }
   }
`

export const StyledHeader = styled.div`
   height: 80px;
   display: flex;
   align-items: center;
   justify-content: space-between;
`
export const GridContainer = styled.div`
   display: grid;
   grid-template-columns: 4rem 12rem 12rem 12rem auto auto;
   height: 60px;
   width: 100%;
   background: #ffffff;
   border: 1px solid #e8e8e8;
   box-sizing: border-box;
   border-radius: 8px;
   align-items: center;
   justify-items: start;
   margin: 16px;
`
export const StyledDrag = styled.div`
   position: relative;
   left: 1rem;
   align-items: center;
   display: flex;
`
export const StyledCompany = styled.div`
   display: flex;
   position: relative;
   left: 8px;
   font-family: 'Roboto';
   font-style: normal;
   font-weight: 500;
   font-size: 16px;
   line-height: 18px;
   color: #919699;
   align-items: center;
   gap: 8px;
   > img {
      width: 32px;
      height: 32px;
      left: 124.84px;
      top: 340.41px;

      border: 1px solid #f3f3f3;
      box-sizing: border-box;
      border-radius: 30px;
   }
`
export const StyledCardText = styled.div`
   display: flex;
   align-items: flex-start;
   flex-direction: column;
   align-content: center;
   font-family: 'Roboto';
   font-style: normal;
   font-weight: 500;
   gap: 4px;

   > span {
      &:nth-child(1) {
         font-size: 12px;
         line-height: 12px;
         letter-spacing: 0.44px;
         color: #919699;
      }
      &:nth-child(2) {
         font-size: 18px;
         line-height: 18px;
         letter-spacing: 0.44px;
         color: #555b6e;
         white-space: nowrap;
         overflow: hidden;
         text-overflow: ellipsis;
         width: 10rem;
      }
   }
`
