import styled from 'styled-components'

export const StyledInfo = styled.div`
   position: relative;
   display: inline-block;

   div {
      visibility: hidden;
      width: 220px;
      color: #555b6e;
      padding: 8px;
      background: #f3f3f3;
      border: 1px solid #555b6e;
      box-sizing: border-box;
      position: absolute;
      z-index: 1;
      top: -5px;
      left: 100%;
      opacity: 0;
      transition: opacity 0.3s;

      &::after {
         content: '';
         position: absolute;
         top: 50%;
         right: 100%;
         margin-top: -42px;
         border-width: 5px;
         border-style: solid;
         border-color: #555b6e transparent transparent transparent;
      }
   }

   &:hover div {
      visibility: visible;
      opacity: 1;
   }
`

export const StyledActionText = styled.p`
   color: ${props => props.color || '#C4C4C4'};
`
