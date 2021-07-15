import React from 'react'

const RectangularIcon = ({ size = '10px', color = '#202020' }) => {
   return (
      <svg
         width={size}
         height={size}
         viewBox="0 0 10 10"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <rect x="0.5" y="0.5" width="9" height="9" rx="1.5" stroke={color} />
      </svg>
   )
}

export default RectangularIcon
