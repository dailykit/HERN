import React from 'react'

const MenuIcon = ({ isOpen }) => {
   return (
      <>
         {isOpen ? (
            <svg
               width="86"
               height="47"
               viewBox="0 0 86 47"
               fill="none"
               xmlns="http://www.w3.org/2000/svg"
            >
               <g filter="url(#filter0_ddddii)">
                  <circle cx="43" cy="20" r="14" fill="url(#paint0_linear)" />
               </g>
               <g filter="url(#filter1_ddiiii)">
                  <circle cx="43" cy="20" r="11" fill="white" />
               </g>
               <path
                  d="M38 20.4257C38 20.662 38.1045 20.8878 38.2854 21.0398L42.4854 24.5678C42.783 24.8177 43.217 24.8177 43.5146 24.5678L47.7146 21.0398C47.8955 20.8878 48 20.662 48 20.4257V20.4257C48 19.7402 47.1941 19.3651 46.6761 19.8141L43.5239 22.5459C43.2233 22.8065 42.7767 22.8065 42.4761 22.5459L39.3239 19.8141C38.8059 19.3651 38 19.7402 38 20.4257V20.4257Z"
                  fill="#919699"
               />
               <path
                  d="M40 17.3608C40 17.5137 40.062 17.6599 40.1719 17.7661L42.583 20.0969C42.8155 20.3217 43.1845 20.3217 43.417 20.0969L45.8281 17.7661C45.938 17.6599 46 17.5137 46 17.3608V17.3608C46 16.8586 45.3928 16.6071 45.0377 16.9623L43.4243 18.5757C43.19 18.81 42.81 18.81 42.5757 18.5757L40.9623 16.9623C40.6072 16.6071 40 16.8586 40 17.3608V17.3608Z"
                  fill="#919699"
               />
               <g filter="url(#filter2_ddddii)">
                  <path
                     d="M3 44C3 38.4772 7.47715 34 13 34H73C78.5228 34 83 38.4772 83 44V44H3V44Z"
                     fill="url(#paint1_linear)"
                  />
               </g>
               <defs>
                  <filter
                     id="filter0_ddddii"
                     x="23"
                     y="0"
                     width="41"
                     height="41"
                     filterUnits="userSpaceOnUse"
                     colorInterpolationFilters="sRGB"
                  >
                     <feFlood floodOpacity="0" result="BackgroundImageFix" />
                     <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                     />
                     <feOffset dx="2" dy="2" />
                     <feGaussianBlur stdDeviation="2.5" />
                     <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.9 0"
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
                     <feOffset dx="-2" dy="-2" />
                     <feGaussianBlur stdDeviation="2" />
                     <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.9 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="effect1_dropShadow"
                        result="effect2_dropShadow"
                     />
                     <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                     />
                     <feOffset dx="2" dy="-2" />
                     <feGaussianBlur stdDeviation="2" />
                     <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.2 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="effect2_dropShadow"
                        result="effect3_dropShadow"
                     />
                     <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                     />
                     <feOffset dx="-2" dy="2" />
                     <feGaussianBlur stdDeviation="2" />
                     <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.2 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="effect3_dropShadow"
                        result="effect4_dropShadow"
                     />
                     <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect4_dropShadow"
                        result="shape"
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
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.5 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect5_innerShadow"
                     />
                     <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                     />
                     <feOffset dx="1" dy="1" />
                     <feGaussianBlur stdDeviation="1" />
                     <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                     />
                     <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.3 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="effect5_innerShadow"
                        result="effect6_innerShadow"
                     />
                  </filter>
                  <filter
                     id="filter1_ddiiii"
                     x="29"
                     y="6"
                     width="28"
                     height="28"
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
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.5 0"
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
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.9 0"
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
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.2 0"
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
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.2 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="effect5_innerShadow"
                        result="effect6_innerShadow"
                     />
                  </filter>
                  <filter
                     id="filter2_ddddii"
                     x="0"
                     y="31"
                     width="86"
                     height="16"
                     filterUnits="userSpaceOnUse"
                     colorInterpolationFilters="sRGB"
                  >
                     <feFlood floodOpacity="0" result="BackgroundImageFix" />
                     <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                     />
                     <feOffset dx="1" dy="1" />
                     <feGaussianBlur stdDeviation="1" />
                     <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.9 0"
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
                     <feOffset dx="-1" dy="-1" />
                     <feGaussianBlur stdDeviation="1" />
                     <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.9 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="effect1_dropShadow"
                        result="effect2_dropShadow"
                     />
                     <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                     />
                     <feOffset dx="1" dy="-1" />
                     <feGaussianBlur stdDeviation="1" />
                     <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.2 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="effect2_dropShadow"
                        result="effect3_dropShadow"
                     />
                     <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                     />
                     <feOffset dx="-1" dy="1" />
                     <feGaussianBlur stdDeviation="1" />
                     <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.2 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="effect3_dropShadow"
                        result="effect4_dropShadow"
                     />
                     <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect4_dropShadow"
                        result="shape"
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
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.5 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect5_innerShadow"
                     />
                     <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                     />
                     <feOffset dx="1" dy="1" />
                     <feGaussianBlur stdDeviation="1" />
                     <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                     />
                     <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.3 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="effect5_innerShadow"
                        result="effect6_innerShadow"
                     />
                  </filter>
                  <linearGradient
                     id="paint0_linear"
                     x1="29"
                     y1="6"
                     x2="57"
                     y2="34"
                     gradientUnits="userSpaceOnUse"
                  >
                     <stop stopColor="white" />
                     <stop offset="1" stopColor="white" />
                  </linearGradient>
                  <linearGradient
                     id="paint1_linear"
                     x1="3"
                     y1="34"
                     x2="5.46154"
                     y2="53.6923"
                     gradientUnits="userSpaceOnUse"
                  >
                     <stop stopColor="white" />
                     <stop offset="1" stopColor="white" />
                  </linearGradient>
               </defs>
            </svg>
         ) : (
            <svg
               width="86"
               height="47"
               viewBox="0 0 86 47"
               fill="none"
               xmlns="http://www.w3.org/2000/svg"
            >
               <g filter="url(#filter0_ddddii)">
                  <circle cx="43" cy="20" r="14" fill="url(#paint0_linear)" />
               </g>
               <g filter="url(#filter1_ddiiii)">
                  <circle cx="43" cy="20" r="11" fill="white" />
               </g>
               <path
                  d="M38 20.5743C38 20.338 38.1045 20.1122 38.2854 19.9602L42.4854 16.4322C42.783 16.1823 43.217 16.1823 43.5146 16.4322L47.7146 19.9602C47.8955 20.1122 48 20.338 48 20.5743V20.5743C48 21.2598 47.1941 21.6349 46.6761 21.1859L43.5239 18.4541C43.2233 18.1935 42.7767 18.1935 42.4761 18.4541L39.3239 21.1859C38.8059 21.6349 38 21.2598 38 20.5743V20.5743Z"
                  fill="#919699"
               />
               <path
                  d="M40 23.6392C40 23.4863 40.062 23.3401 40.1719 23.2339L42.583 20.9031C42.8155 20.6783 43.1845 20.6783 43.417 20.9031L45.8281 23.2339C45.938 23.3401 46 23.4863 46 23.6392V23.6392C46 24.1414 45.3928 24.3929 45.0377 24.0377L43.4243 22.4243C43.19 22.19 42.81 22.19 42.5757 22.4243L40.9623 24.0377C40.6072 24.3929 40 24.1414 40 23.6392V23.6392Z"
                  fill="#919699"
               />
               <g filter="url(#filter2_ddddii)">
                  <path
                     d="M3 44C3 38.4772 7.47715 34 13 34H73C78.5228 34 83 38.4772 83 44V44H3V44Z"
                     fill="url(#paint1_linear)"
                  />
               </g>
               <defs>
                  <filter
                     id="filter0_ddddii"
                     x="23"
                     y="0"
                     width="41"
                     height="41"
                     filterUnits="userSpaceOnUse"
                     colorInterpolationFilters="sRGB"
                  >
                     <feFlood floodOpacity="0" result="BackgroundImageFix" />
                     <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                     />
                     <feOffset dx="2" dy="2" />
                     <feGaussianBlur stdDeviation="2.5" />
                     <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.9 0"
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
                     <feOffset dx="-2" dy="-2" />
                     <feGaussianBlur stdDeviation="2" />
                     <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.9 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="effect1_dropShadow"
                        result="effect2_dropShadow"
                     />
                     <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                     />
                     <feOffset dx="2" dy="-2" />
                     <feGaussianBlur stdDeviation="2" />
                     <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.2 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="effect2_dropShadow"
                        result="effect3_dropShadow"
                     />
                     <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                     />
                     <feOffset dx="-2" dy="2" />
                     <feGaussianBlur stdDeviation="2" />
                     <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.2 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="effect3_dropShadow"
                        result="effect4_dropShadow"
                     />
                     <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect4_dropShadow"
                        result="shape"
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
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.5 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect5_innerShadow"
                     />
                     <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                     />
                     <feOffset dx="1" dy="1" />
                     <feGaussianBlur stdDeviation="1" />
                     <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                     />
                     <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.3 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="effect5_innerShadow"
                        result="effect6_innerShadow"
                     />
                  </filter>
                  <filter
                     id="filter1_ddiiii"
                     x="29"
                     y="6"
                     width="28"
                     height="28"
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
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.5 0"
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
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.9 0"
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
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.2 0"
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
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.2 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="effect5_innerShadow"
                        result="effect6_innerShadow"
                     />
                  </filter>
                  <filter
                     id="filter2_ddddii"
                     x="0"
                     y="31"
                     width="86"
                     height="16"
                     filterUnits="userSpaceOnUse"
                     colorInterpolationFilters="sRGB"
                  >
                     <feFlood floodOpacity="0" result="BackgroundImageFix" />
                     <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                     />
                     <feOffset dx="1" dy="1" />
                     <feGaussianBlur stdDeviation="1" />
                     <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.9 0"
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
                     <feOffset dx="-1" dy="-1" />
                     <feGaussianBlur stdDeviation="1" />
                     <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.9 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="effect1_dropShadow"
                        result="effect2_dropShadow"
                     />
                     <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                     />
                     <feOffset dx="1" dy="-1" />
                     <feGaussianBlur stdDeviation="1" />
                     <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.2 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="effect2_dropShadow"
                        result="effect3_dropShadow"
                     />
                     <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                     />
                     <feOffset dx="-1" dy="1" />
                     <feGaussianBlur stdDeviation="1" />
                     <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.2 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="effect3_dropShadow"
                        result="effect4_dropShadow"
                     />
                     <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect4_dropShadow"
                        result="shape"
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
                        values="0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0 0.937255 0 0 0 0.5 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect5_innerShadow"
                     />
                     <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                     />
                     <feOffset dx="1" dy="1" />
                     <feGaussianBlur stdDeviation="1" />
                     <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                     />
                     <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.3 0"
                     />
                     <feBlend
                        mode="normal"
                        in2="effect5_innerShadow"
                        result="effect6_innerShadow"
                     />
                  </filter>
                  <linearGradient
                     id="paint0_linear"
                     x1="29"
                     y1="6"
                     x2="57"
                     y2="34"
                     gradientUnits="userSpaceOnUse"
                  >
                     <stop stopColor="white" />
                     <stop offset="1" stopColor="white" />
                  </linearGradient>
                  <linearGradient
                     id="paint1_linear"
                     x1="3"
                     y1="34"
                     x2="5.46154"
                     y2="53.6923"
                     gradientUnits="userSpaceOnUse"
                  >
                     <stop stopColor="white" />
                     <stop offset="1" stopColor="white" />
                  </linearGradient>
               </defs>
            </svg>
         )}
      </>
   )
}

export default MenuIcon
