import React from 'react'

export const ArrowLeftIcon = ({ size = 24, color = 'none', ...props }) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
   >
      <path d="M19 12H6M12 5l-7 7 7 7" />
   </svg>
)
