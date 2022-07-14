import React from 'react'
import tw from 'twin.macro'

export const CartIcon = props => {
   const {
      size,
      stroke = '#0F6BB1',
      count = 0,
      variant = 'bag',
      ...rest
   } = props
   if (variant === 'simple') {
      return (
         <div tw="relative">
            {count > 0 && (
               <span tw="absolute top-[-10px] left-[50%] translate-x-[-50%] text-white">
                  {count}
               </span>
            )}
            <svg
               width="52"
               height="88"
               viewBox="0 0 34 50"
               fill="none"
               xmlns="http://www.w3.org/2000/svg"
               xmlnsXlink="http://www.w3.org/1999/xlink"
            >
               <path
                  d="M6.90773 44.16C5.7344 44.16 4.7264 43.9253 3.88373 43.456C3.05173 42.976 2.41173 42.304 1.96373 41.44C1.51573 40.5653 1.29173 39.536 1.29173 38.352C1.29173 37.168 1.51573 36.144 1.96373 35.28C2.41173 34.416 3.05173 33.7493 3.88373 33.28C4.7264 32.8 5.7344 32.56 6.90773 32.56C7.66507 32.56 8.37973 32.6773 9.05173 32.912C9.7344 33.1467 10.2944 33.4827 10.7317 33.92L10.0597 35.552C9.57974 35.1467 9.08907 34.8533 8.58774 34.672C8.0864 34.48 7.54773 34.384 6.97173 34.384C5.8304 34.384 4.96107 34.7307 4.36373 35.424C3.7664 36.1067 3.46773 37.0827 3.46773 38.352C3.46773 39.6213 3.7664 40.6027 4.36373 41.296C4.96107 41.9893 5.8304 42.336 6.97173 42.336C7.54773 42.336 8.0864 42.2453 8.58774 42.064C9.08907 41.872 9.57974 41.5733 10.0597 41.168L10.7317 42.8C10.2944 43.2267 9.7344 43.5627 9.05173 43.808C8.37973 44.0427 7.66507 44.16 6.90773 44.16ZM14.6219 44.16C14.0565 44.16 13.5499 44.0533 13.1019 43.84C12.6645 43.616 12.3179 43.3173 12.0619 42.944C11.8165 42.5707 11.6939 42.1493 11.6939 41.68C11.6939 41.104 11.8432 40.6507 12.1419 40.32C12.4405 39.9787 12.9259 39.7333 13.5979 39.584C14.2699 39.4347 15.1712 39.36 16.3019 39.36H16.8619V39.024C16.8619 38.4907 16.7445 38.1067 16.5099 37.872C16.2752 37.6373 15.8805 37.52 15.3259 37.52C14.8885 37.52 14.4405 37.5893 13.9819 37.728C13.5232 37.856 13.0592 38.0587 12.5899 38.336L12.0139 36.976C12.2912 36.784 12.6165 36.6187 12.9899 36.48C13.3739 36.3307 13.7739 36.2187 14.1899 36.144C14.6165 36.0587 15.0165 36.016 15.3899 36.016C16.5312 36.016 17.3792 36.2827 17.9339 36.816C18.4885 37.3387 18.7659 38.1547 18.7659 39.264V44H16.8939V42.752C16.7125 43.1893 16.4245 43.536 16.0299 43.792C15.6352 44.0373 15.1659 44.16 14.6219 44.16ZM15.0379 42.784C15.5605 42.784 15.9925 42.6027 16.3339 42.24C16.6859 41.8773 16.8619 41.4187 16.8619 40.864V40.512H16.3179C15.3152 40.512 14.6165 40.592 14.2219 40.752C13.8379 40.9013 13.6459 41.1787 13.6459 41.584C13.6459 41.936 13.7685 42.224 14.0139 42.448C14.2592 42.672 14.6005 42.784 15.0379 42.784ZM20.7959 44V36.176H22.7479V37.552C23.1319 36.624 23.9532 36.112 25.2119 36.016L25.8199 35.968L25.9479 37.664L24.7959 37.776C23.4839 37.904 22.8279 38.576 22.8279 39.792V44H20.7959ZM31.0986 44.16C29.0293 44.16 27.9946 43.136 27.9946 41.088V37.68H26.4906V36.176H27.9946V33.84H29.9946V36.176H32.3626V37.68H29.9946V40.976C29.9946 41.488 30.1066 41.872 30.3306 42.128C30.5546 42.384 30.9173 42.512 31.4186 42.512C31.5679 42.512 31.7226 42.496 31.8826 42.464C32.0426 42.4213 32.2079 42.3787 32.3786 42.336L32.6826 43.808C32.4906 43.9147 32.2453 44 31.9466 44.064C31.6586 44.128 31.3759 44.16 31.0986 44.16Z"
                  fill="#7124B4"
               />
               <rect
                  x="2.92773"
                  y="6"
                  width="28"
                  height="28"
                  fill="url(#pattern0)"
               />
               <circle
                  cx="16.9795"
                  cy="10.4409"
                  r="9"
                  fill="#7124B4"
                  stroke="white"
               />

               <defs>
                  <pattern
                     id="pattern0"
                     patternContentUnits="objectBoundingBox"
                     width="1"
                     height="1"
                  >
                     <use
                        xlinkHref="#image0_0_1"
                        transform="scale(0.0104167)"
                     />
                  </pattern>
                  <image
                     id="image0_0_1"
                     width="96"
                     height="96"
                     xlinkHref="data:image/png;base64,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"
                  />
               </defs>
            </svg>
         </div>
      )
   }
   return (
      <svg
         width={size}
         height={size}
         viewBox="0 0 48 48"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...rest}
      >
         <path
            d="M12.96 17.5556C12.96 33.5556 35.5 32.8 35.5 17.5556M9.25699 3.63008L8.24782 2.52031L9.25699 3.63008C9.34903 3.54638 9.46897 3.5 9.59338 3.5H38.8316C38.9613 3.5 39.0858 3.55034 39.1791 3.64042L43.2887 7.61111H4.87909L9.25699 3.63008ZM2.80659 10.6111H45.2154L39.3715 44.086C39.3297 44.3253 39.1219 44.5 38.8789 44.5H9.56059C9.3199 44.5 9.11337 44.3285 9.06911 44.0919L2.80659 10.6111ZM14.46 17.5556C14.46 16.7271 13.7884 16.0556 12.96 16.0556C12.1316 16.0556 11.46 16.7271 11.46 17.5556C11.46 21.9319 13.0141 25.3008 15.4672 27.554C17.8972 29.7861 21.1016 30.8249 24.2551 30.772C30.5802 30.666 37 26.1191 37 17.5556C37 16.7271 36.3284 16.0556 35.5 16.0556C34.6716 16.0556 34 16.7271 34 17.5556C34 24.2364 29.1498 27.6896 24.2049 27.7724C21.7234 27.814 19.2928 26.9945 17.4966 25.3446C15.7234 23.7159 14.46 21.1792 14.46 17.5556Z"
            stroke={stroke}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   )
}
