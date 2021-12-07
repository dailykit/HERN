import styled from 'styled-components'

export const StyledWrapper = styled.div`
   margin: 0 auto;
   max-width: 800px;
   h1 {
      color: #555b6e;
      font-size: 20px;
      font-weight: 500;
      line-height: 23px;
   }
   @media screen and (max-width: 767px) {
      width: calc(100vw - 11vw);
   }
   @media screen and (min-width: 768px) {
      width: calc(100vw - 21vw);
   }
`

export const Wrapper = styled.main`
   padding: 5px 16px;
`