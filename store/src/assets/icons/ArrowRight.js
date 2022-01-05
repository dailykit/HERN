import React from 'react'

export const ArrowRightIcon = ({ size = 24, color="none", ...props }) => (
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
      <path d="M5 12h13M12 5l7 7-7 7" />
   </svg>
)
