import React from 'react'

const ChevronIcon = ({
   direction = 'right',
   width = 5,
   height = 8,
   color = '#38A169',
}) => {
   return (
      <div>
         {direction === 'right' && (
            <svg
               width={width}
               height={height}
               viewBox="0 0 5 8"
               fill="none"
               xmlns="http://www.w3.org/2000/svg"
            >
               <path
                  d="M1.01807 1.51819L3.38979 3.92019C3.56303 4.09564 3.56047 4.37759 3.38408 4.5499L1.01807 6.86119"
                  stroke={color}
                  strokeWidth="1.2"
                  strokeLinecap="round"
               />
            </svg>
         )}
         {direction === 'down' && (
            <svg
               width="12"
               height="8"
               viewBox="0 0 12 8"
               fill="none"
               xmlns="http://www.w3.org/2000/svg"
            >
               <path
                  d="M0.772279 1.11965C1.16155 0.730382 1.79258 0.730038 2.18228 1.11889L6.0669 4.99504L9.95152 1.11889C10.3412 0.730038 10.9722 0.730382 11.3615 1.11965C11.7511 1.50923 11.7511 2.14085 11.3615 2.53042L6.42045 7.47149C6.22519 7.66675 5.90861 7.66675 5.71334 7.47149L0.772279 2.53042C0.382706 2.14085 0.382706 1.50923 0.772279 1.11965Z"
                  fill="#404040"
               />
            </svg>
         )}
      </div>
   )
}

export { ChevronIcon }
