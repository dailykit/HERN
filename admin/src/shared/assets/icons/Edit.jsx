import React from 'react'

const EditIcon = ({ size = 16, color = '#367BF5' }) => (
   <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
   >
      <path
         fillRule="evenodd"
         clipRule="evenodd"
         d="M10.9596 2.37373C11.3501 1.98321 11.9832 1.98321 12.3738 2.37373L14.2929 4.29285C14.6834 4.68338 14.6834 5.31654 14.2929 5.70707L6.12623 13.8737C5.93869 14.0613 5.68434 14.1666 5.41912 14.1666H2.5V11.2475C2.5 10.9823 2.60536 10.7279 2.79289 10.5404L10.9596 2.37373Z"
         fill={color}
      />
      <path
         d="M2.5 18.3334H17.5"
         stroke={color}
         strokeWidth="2"
         strokeLinecap="round"
         strokeLinejoin="round"
      />
   </svg>
)

export default EditIcon
