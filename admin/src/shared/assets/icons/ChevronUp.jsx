import React from 'react'

export const ChevronUp = ({ size = 18, color = '#000000' }) => (
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
      <path d="M18 15l-6-6-6 6" />
   </svg>
)
