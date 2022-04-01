import React from 'react'
import styled from 'styled-components'

const CancelIcon = () => (
   <StyleButton
      width="29"
      height="29"
      viewBox="0 0 29 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
   >
      <rect x="0.227051" y="0.99231" width="28" height="28" rx="4" />
      <path
         fillRule="evenodd"
         clip-rule="evenodd"
         d="M9.98434 10.7497C10.2094 10.5246 10.5146 10.3982 10.8329 10.3982C11.1511 10.3982 11.4564 10.5246 11.6814 10.7497L14.227 13.2953L16.7726 10.7497C16.9976 10.5246 17.3028 10.3982 17.6211 10.3982C17.9394 10.3982 18.2446 10.5246 18.4696 10.7497C18.6947 10.9747 18.8211 11.2799 18.8211 11.5982C18.8211 11.9165 18.6947 12.2217 18.4696 12.4467L15.924 14.9923L18.4696 17.5379C18.6947 17.7629 18.8211 18.0682 18.8211 18.3864C18.8211 18.7047 18.6947 19.0099 18.4696 19.235C18.2446 19.46 17.9394 19.5864 17.6211 19.5864C17.3028 19.5864 16.9976 19.46 16.7726 19.235L14.227 16.6894L11.6814 19.235C11.4564 19.46 11.1511 19.5864 10.8329 19.5864C10.5146 19.5864 10.2094 19.46 9.98434 19.235C9.7593 19.0099 9.63287 18.7047 9.63287 18.3864C9.63287 18.0682 9.7593 17.7629 9.98434 17.5379L12.5299 14.9923L9.98434 12.4467C9.7593 12.2217 9.63287 11.9165 9.63287 11.5982C9.63287 11.2799 9.7593 10.9747 9.98434 10.7497Z"
         fill="#919699"
      />
   </StyleButton>
)

export default CancelIcon

const StyleButton = styled.svg`
   &:hover {
      border-radius: 4px;
      background: #f9f9f9;
   }
   &:active {
      > path {
         fill: #367bf5;
      }
   }
`
