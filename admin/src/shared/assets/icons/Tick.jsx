import React from 'react'

export const TickIcon = ({ size = 16, color = '#000000', stroke = '1' }) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
   >
      <polyline points="20 6 9 17 4 12"></polyline>
   </svg>
)
