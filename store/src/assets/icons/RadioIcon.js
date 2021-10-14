import React from 'react'

export const RadioIcon = ({
   size = 15,
   showTick = false,
   stroke = '#367BF5',
   ...props
}) => {
   return (
      <svg
         width="15"
         height="15"
         viewBox="0 0 15 15"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <rect
            x="0.734863"
            y="1.28137"
            width="13"
            height="13"
            rx="6.5"
            stroke="#367BF5"
         />
         {showTick && <circle cx="7.23486" cy="7.78137" r="4" fill="#367BF5" />}
      </svg>
   )
}
