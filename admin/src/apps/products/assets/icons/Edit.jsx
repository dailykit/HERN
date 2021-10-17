import React from 'react'
import styled from 'styled-components'

const EditIcon = () => (
   <StyleButton
      width="29"
      height="29"
      viewBox="0 0 29 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
   >
      <rect x="0.226562" y="0.0280762" width="28" height="28" rx="4" />
      <path
         d="M16.0852 8.12455C15.6977 7.72932 15.0696 7.72932 14.6822 8.12455L9.30892 13.6065C9.12288 13.7963 9.01837 14.0537 9.01837 14.3221V16.2644H10.9221C11.1852 16.2644 11.4375 16.1578 11.6236 15.968L16.9969 10.486C17.3843 10.0908 17.3843 9.44998 16.9969 9.05475L16.0852 8.12455Z"
         fill="#919699"
      />
      <path
         d="M9.01837 18.204C8.4705 18.204 8.02637 18.6571 8.02637 19.2161C8.02637 19.775 8.4705 20.2281 9.01837 20.2281H19.4344C19.9822 20.2281 20.4264 19.775 20.4264 19.2161C20.4264 18.6571 19.9822 18.204 19.4344 18.204H9.01837Z"
         fill="#919699"
      />
   </StyleButton>
)

export default EditIcon

const StyleButton = styled.svg`
   &:hover {
      background-color: rgba(249, 249, 249, 1);
      border-radius: 4px;
   }

   &:active {
      > path {
         fill: #367bf5;
      }
   }
`
