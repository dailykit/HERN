import React from 'react'

export const ArrowLeftIconBG = props => {
   const {
      bgColor = '#0F6BB1',
      size = 56,
      arrowColor = 'white',
      variant = 'lg',
      ...rest
   } = props
   if (variant === 'sm') {
      return (
         <svg
            width="42"
            height="42"
            viewBox="0 0 42 42"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
         >
            <rect width="42" height="42" rx="21" fill="#7124B4" />
            <path
               d="M31.5 21.4113H10.5M10.5 21.4113L18.7889 14.8749M10.5 21.4113L18.7889 27.1249"
               stroke="white"
               stroke-width="3"
               stroke-linecap="round"
               stroke-linejoin="round"
            />
         </svg>
      )
   }
   return (
      <svg
         width={size}
         height={size}
         viewBox="0 0 56 56"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...rest}
      >
         <rect
            width={size}
            height={size}
            rx="28"
            fill={bgColor}
            fillOpacity="0.8"
         />
         <path
            d="M42 28.5485H14M14 28.5485L25.0519 19.8333M14 28.5485L25.0519 36.1666"
            stroke={arrowColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   )
}
