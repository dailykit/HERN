import React from 'react'

const ChevronIcon = ({ direction = 'right', color = '#38A169' }) => {
   return (
      <div>
         {direction === 'right' && (
            <svg
               width="5"
               height="8"
               viewBox="0 0 5 8"
               fill="none"
               xmlns="http://www.w3.org/2000/svg"
            >
               <path
                  d="M1.01807 1.51819L3.38979 3.92019C3.56303 4.09564 3.56047 4.37759 3.38408 4.5499L1.01807 6.86119"
                  stroke={color}
                  stroke-width="1.2"
                  stroke-linecap="round"
               />
            </svg>
         )}
      </div>
   )
}

export { ChevronIcon }
