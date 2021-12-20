import React from 'react'
export const ArrowRightCircle = ({
   size = 32,
   color = 'rgba(64, 64, 64, 0.4)',
}) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
   >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8l4 4-4 4M8 12h7" />
   </svg>
)
