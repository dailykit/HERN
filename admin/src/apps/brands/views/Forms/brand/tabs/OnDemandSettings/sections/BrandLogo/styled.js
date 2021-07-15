import styled from 'styled-components'

export const ImageContainer = styled.div`
   padding: 8px;
   position: relative;
   border-radius: 2px;
   border: 1px solid #e3e3e3;
   height: ${props => props.height || 'auto'};
   width: ${props => props.width || 'auto'};
   img {
      width: 100%;
      height: 100%;
      object-fit: cover;
   }
   div {
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      position: absolute;
      background: linear-gradient(
         212deg,
         rgba(0, 0, 0, 1) 0%,
         rgba(255, 255, 255, 0) 29%
      );
   }
   button {
      float: right;
      margin: 4px 4px 0 0;
   }
`
