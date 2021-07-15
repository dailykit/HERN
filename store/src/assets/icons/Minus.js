import React from 'react'

export const MinusIcon = ({ size = 24, ...props }) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
   >
      <line x1="5" y1="12" x2="19" y2="12"></line>
   </svg>
)
