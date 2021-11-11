import React from 'react'

export const LocationMarker = props => {
   const { size = 18 } = props
   return (
      <svg
         width={size}
         height={size}
         viewBox="0 0 18 18"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.09252 1C6.8189 1 5 2.8 5 5.05C5 7.62143 8.44291 10.3214 9.09252 16.75C9.80709 10.3214 13.25 7.62143 13.25 5.05C13.25 2.8 11.3661 1 9.09252 1Z"
            fill="#EA4335"
         />
         <circle cx="9.125" cy="4.875" r="1" fill="#811411" />
      </svg>
   )
}
