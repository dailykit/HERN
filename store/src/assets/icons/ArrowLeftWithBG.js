import React from 'react'

export const ArrowLeftIconBG = props => {
   const {
      bgColor = '#0F6BB1',
      size = 56,
      arrowColor = 'white',
      ...rest
   } = props
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
            width="56"
            height="56"
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
