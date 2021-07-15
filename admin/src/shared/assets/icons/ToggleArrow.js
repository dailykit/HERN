import React from 'react'
const arrowDownPath =
   'M0.714693 0.0117605L7.64184 0.132674L4.07355 6.0713L0.714693 0.0117605Z'
const arrowRightPath =
   'M0.834937 4.75L0.834936 0.419873L4.58494 2.58494L0.834937 4.75Z'

const ToggleArrow = ({ color = '#202020', size = '8px', down }) => (
   <svg
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
   >
      <path d={down ? arrowDownPath : arrowRightPath} fill={color} />
   </svg>
)

export default ToggleArrow
