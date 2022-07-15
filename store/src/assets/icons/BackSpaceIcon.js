import React from 'react'

export const BackSpaceIcon = ({ size = '61', color = '#7124B4' }) => {
   return (
      <svg
         width="100"
         height={size}
         viewBox="0 0 100 61"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M45.9181 19.5616C46.5059 18.9738 47.3031 18.6436 48.1344 18.6436C48.9658 18.6436 49.763 18.9738 50.3508 19.5616L57 26.2108L63.6492 19.5616C64.237 18.9738 65.0342 18.6436 65.8656 18.6436C66.6969 18.6436 67.4941 18.9738 68.0819 19.5616C68.6698 20.1494 69 20.9467 69 21.778C69 22.6093 68.6698 23.4066 68.0819 23.9944L61.4328 30.6436L68.0819 37.2927C68.6698 37.8805 69 38.6778 69 39.5091C69 40.3404 68.6698 41.1377 68.0819 41.7255C67.4941 42.3133 66.6969 42.6436 65.8656 42.6436C65.0342 42.6436 64.237 42.3133 63.6492 41.7255L57 35.0763L50.3508 41.7255C49.763 42.3133 48.9658 42.6436 48.1344 42.6436C47.3031 42.6436 46.5059 42.3133 45.9181 41.7255C45.3302 41.1377 45 40.3404 45 39.5091C45 38.6778 45.3302 37.8805 45.9181 37.2927L52.5672 30.6436L45.9181 23.9944C45.3302 23.4066 45 22.6093 45 21.778C45 20.9467 45.3302 20.1494 45.9181 19.5616Z"
            fill={color}
         />
         <path
            d="M31.8285 3.1929C32.2001 2.84019 32.693 2.64355 33.2053 2.64355H96C97.1046 2.64355 98 3.53899 98 4.64355V56.6436C98 57.7481 97.1046 58.6436 96 58.6436H33.2053C32.6929 58.6436 32.2001 58.4469 31.8285 58.0942L4.43376 32.0942C3.60283 31.3056 3.60283 29.9815 4.43376 29.1929L31.8285 3.1929Z"
            stroke={color}
            strokeWidth="4"
         />
      </svg>
   )
}
