import React from 'react'
const SquareIcon = ({ size = 20, color = '#000000' }) => (
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
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
   </svg>
)
export default SquareIcon
