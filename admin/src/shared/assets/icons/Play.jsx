import React from 'react'

const PlayIcon = () => {
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
            d="M14 22.0657V11.9343C14 11.5349 14.4451 11.2967 14.7774 11.5182L22.376 16.584C22.6728 16.7819 22.6728 17.2181 22.376 17.416L14.7774 22.4818C14.4451 22.7033 14 22.4651 14 22.0657Z"
            fill="#367BF5"
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

export default PlayIcon
