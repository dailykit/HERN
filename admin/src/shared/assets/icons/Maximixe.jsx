import React from 'react'

const MaximizeIcon = () => {
   return (
      <svg
         width="34"
         height="34"
         viewBox="0 0 34 34"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <g filter="url(#filter0_ddiiii)">
            <circle cx="17" cy="17" r="14" fill="#F3F3F3" />
         </g>
         <path
            d="M21.8 12H23V15.6667H21.8V13.2222H19.4V12H21.8ZM12.2 12H14.6V13.2222H12.2V15.6667H11V12H12.2ZM21.8 21.7778V19.3333H23V23H19.4V21.7778H21.8ZM12.2 21.7778H14.6V23H11V19.3333H12.2V21.7778Z"
            fill="#919699"
         />
         <defs>
            <filter
               id="filter0_ddiiii"
               x="0"
               y="0"
               width="34"
               height="34"
               filterUnits="userSpaceOnUse"
               colorInterpolationFilters="sRGB"
            >
               <feFlood floodOpacity="0" result="BackgroundImageFix" />
               <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
               />
               <feOffset dx="-1" dy="-1" />
               <feGaussianBlur stdDeviation="1" />
               <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.807843 0 0 0 0 0.807843 0 0 0 0 0.803922 0 0 0 0.5 0"
               />
               <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow"
               />
               <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
               />
               <feOffset dx="1" dy="1" />
               <feGaussianBlur stdDeviation="1" />
               <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.3 0"
               />
               <feBlend
                  mode="normal"
                  in2="effect1_dropShadow"
                  result="effect2_dropShadow"
               />
               <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect2_dropShadow"
                  result="shape"
               />
               <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
               />
               <feOffset dx="1" dy="1" />
               <feGaussianBlur stdDeviation="1.5" />
               <feComposite
                  in2="hardAlpha"
                  operator="arithmetic"
                  k2="-1"
                  k3="1"
               />
               <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.807843 0 0 0 0 0.807843 0 0 0 0 0.803922 0 0 0 0.9 0"
               />
               <feBlend
                  mode="normal"
                  in2="shape"
                  result="effect3_innerShadow"
               />
               <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
               />
               <feOffset dx="-1" dy="-1" />
               <feGaussianBlur stdDeviation="1" />
               <feComposite
                  in2="hardAlpha"
                  operator="arithmetic"
                  k2="-1"
                  k3="1"
               />
               <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.9 0"
               />
               <feBlend
                  mode="normal"
                  in2="effect3_innerShadow"
                  result="effect4_innerShadow"
               />
               <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
               />
               <feOffset dx="1" dy="-1" />
               <feGaussianBlur stdDeviation="1" />
               <feComposite
                  in2="hardAlpha"
                  operator="arithmetic"
                  k2="-1"
                  k3="1"
               />
               <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.807843 0 0 0 0 0.807843 0 0 0 0 0.803922 0 0 0 0.2 0"
               />
               <feBlend
                  mode="normal"
                  in2="effect4_innerShadow"
                  result="effect5_innerShadow"
               />
               <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
               />
               <feOffset dx="-1" dy="1" />
               <feGaussianBlur stdDeviation="1" />
               <feComposite
                  in2="hardAlpha"
                  operator="arithmetic"
                  k2="-1"
                  k3="1"
               />
               <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.807843 0 0 0 0 0.807843 0 0 0 0 0.803922 0 0 0 0.2 0"
               />
               <feBlend
                  mode="normal"
                  in2="effect5_innerShadow"
                  result="effect6_innerShadow"
               />
            </filter>
         </defs>
      </svg>
   )
}

export default MaximizeIcon
