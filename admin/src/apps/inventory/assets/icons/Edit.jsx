import React from 'react'

const EditIcon = ({ size = 16, color = '#fff' }) => (
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
      <polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon>
   </svg>
)

export default EditIcon
