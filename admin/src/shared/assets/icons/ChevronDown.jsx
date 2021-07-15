import React from 'react'

export const ChevronDown = ({ size = 18, color = '#000000' }) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
   >
      <path d="M6 9l6 6 6-6" />
   </svg>
)
