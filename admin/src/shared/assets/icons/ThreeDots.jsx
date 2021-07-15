import React from 'react'

const ThreeDots = ({ color = '#8E94A5' }) => {
   return (
      <svg
         width="3"
         height="15"
         viewBox="0 0 3 15"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <circle cx="1.5" cy="1.5" r="1.5" fill={color} />
         <circle cx="1.5" cy="7.5" r="1.5" fill={color} />
         <circle cx="1.5" cy="13.5" r="1.5" fill={color} />
      </svg>
   )
}

export default ThreeDots
