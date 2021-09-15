import styled from 'styled-components'

export const StyledCard = styled.div`
   box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
   transition: 0.3s;
   background-color: #ffffff;
   width: 100%;
   margin: 0;
   padding: 16px;
   img {
      width: 160px;
      height: auto;
      object-fit: auto;
      margin: 0;
   }

   &:hover {
      box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
   }
`
export const StyledInfo = styled.span`
   display: inline;
   min-width: 298px;
   max-width: 350px;
   width: 150%;
`
