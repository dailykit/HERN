import React from 'react'
import styled from 'styled-components'

const PlayIcon = () => {
   return (
      <StyleButton
         width="29"
         height="29"
         viewBox="0 0 29 29"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <rect x="0.226562" y="0.0280762" width="28" height="28" rx="4" />
         <path
            d="M10.7266 18.5333V9.52289C10.7266 8.88393 11.4387 8.50282 11.9703 8.85725L18.7281 13.3624C19.2031 13.6791 19.2031 14.3771 18.7281 14.6937L11.9703 19.1989C11.4387 19.5533 10.7266 19.1722 10.7266 18.5333Z"
            fill="#919699"
         />
      </StyleButton>
   )
}

export default PlayIcon

const StyleButton = styled.svg`
   &:hover {
      background: rgba(249, 249, 249, 1);
      border-radius: 4px;
   }

   &:active {
      > path {
         fill: #367bf5;
      }
   }
`
