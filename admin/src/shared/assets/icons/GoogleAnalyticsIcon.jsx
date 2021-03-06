import React from 'react'
const GoogleAnalyticsIcon = ({ size = 61 }) => (
   <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
   >
      <rect width="60" height="60" rx="8" fill="url(#pattern0)" />
      <defs>
         <pattern
            id="pattern0"
            patternContentUnits="objectBoundingBox"
            width="1"
            height="1"
         >
            <use xlinkHref="#image0_97:2133" transform="scale(0.00444444)" />
         </pattern>
         <image
            id="image0_97:2133"
            width="225"
            height="225"
            xlinkHref="data:image/png;base64,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"
         />
      </defs>
   </svg>
)
export default GoogleAnalyticsIcon
