import styled from 'styled-components'

export const StyledWrapper = styled.div`
   > div {
      margin: 0 auto;
      max-width: 1180px;
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
