import React from 'react'

export default function renderIcon(condition) {
   const tickGreenSvg = (
      <span style={{ marginRight: '8px' }}>
         <svg
            width="13"
            height="11"
            viewBox="0 0 13 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
         >
            <path
               d="M1 6L4 9L12 1"
               stroke="#28C1F7"
               strokeWidth="2"
               strokeLinecap="round"
            />
         </svg>
      </span>
   )

   const crossRedSvg = (
      <span style={{ marginRight: '8px' }}>
         <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
         >
            <path
               d="M1 1L9 9"
               stroke="#FF5A52"
               strokeWidth="2"
               strokeLinecap="round"
            />
            <path
               d="M9 1L1 9"
               stroke="#FF5A52"
               strokeWidth="2"
               strokeLinecap="round"
            />
         </svg>
      </span>
   )

   return condition ? tickGreenSvg : crossRedSvg
}
