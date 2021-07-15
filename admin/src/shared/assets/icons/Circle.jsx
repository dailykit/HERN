import React from 'react'
const CircleIcon = ({ size = 20, color = '#000000' }) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
   >
      <circle cx="12" cy="12" r="10"></circle>
   </svg>
)
export default CircleIcon
