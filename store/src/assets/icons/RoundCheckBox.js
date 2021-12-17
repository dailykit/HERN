import React from 'react'

export const RoundCheckBoxIcon = props => {
   const { fill = '#6CB20D', tickFill = '#FFFFFF', size = 30, ...rest } = props
   return (
      <svg
         width={size}
         height={size}
         viewBox="0 0 50 50"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...rest}
      >
         <rect width="50" height="50" rx="25" fill={fill} />
         <path
            d="M11.1632 27.4411L10.1703 28.1121C9.95316 28.2589 9.9422 28.5685 10.1458 28.7328C14.1094 31.9294 15.6886 34.6719 17.9086 39.7634C17.9912 39.9529 18.2123 40.0476 18.4101 39.9762L20.9418 39.062C21.0462 39.0243 21.1301 38.9435 21.1718 38.8427C26.1031 26.9148 30.0288 20.2909 39.8796 10.651C40.1852 10.352 39.8585 9.86394 39.4633 10.0357C30.621 13.8781 26.0243 18.7808 19.6633 31.0422C19.5352 31.2892 19.1872 31.3342 19.0048 31.1222L16.43 28.1306C15.1196 26.6081 12.8379 26.3094 11.1632 27.4411Z"
            fill={tickFill}
         />
      </svg>
   )
}
export const NoTickRoundCheckBoxIcon = props => {
   const { fill, size, ...rest } = props
   return (
      <svg
         width={size}
         height={size}
         viewBox="0 0 50 50"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...rest}
      >
         <rect
            x="0.5"
            y="0.5"
            width="49"
            height="49"
            rx="24.5"
            fill={fill}
            fill-opacity="0.85"
            stroke="#00406A"
         />
      </svg>
   )
}
