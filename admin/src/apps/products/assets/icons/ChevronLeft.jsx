import React from 'react'

const ChevronLeft = ({ size = 20, color = '#555B6E' }) => (
   <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke={color}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
   >
      <path d='M15 18l-6-6 6-6' />
   </svg>
)
export default ChevronLeft
