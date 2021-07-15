import React from 'react'

const LeftPanel = ({ size = 18, color = '#000' }) => (
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
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
   </svg>
)

export default LeftPanel
