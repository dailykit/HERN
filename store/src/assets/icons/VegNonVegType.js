export const VegNonVegType = ({ vegNonVegType, size = 20 }) => {
   const isVegeterian =
      vegNonVegType === 'vegetarian' ||
      vegNonVegType === 'veg' ||
      vegNonVegType === 'Veg' ||
      vegNonVegType === 'VEG'
         ? true
         : false

   return (
      <>
         {vegNonVegType !== null && (
            <span title={vegNonVegType}>
               {isVegeterian ? (
                  <svg
                     width={size}
                     height={size}
                     viewBox="0 0 21 21"
                     fill="none"
                     xmlns="http://www.w3.org/2000/svg"
                  >
                     <rect
                        x="1.13628"
                        y="0.957812"
                        width="18.6"
                        height="18.6"
                        rx="1.3"
                        fill="white"
                        stroke="#37A169"
                        strokeWidth="1.4"
                     />
                     <circle
                        cx="10.6251"
                        cy="10.0686"
                        r="5.66038"
                        fill="#37A169"
                     />
                  </svg>
               ) : (
                  <svg
                     width={size}
                     height={size}
                     viewBox="0 0 21 21"
                     fill="none"
                     xmlns="http://www.w3.org/2000/svg"
                  >
                     <rect
                        x="1.1801"
                        y="0.768359"
                        width="18.6"
                        height="18.6"
                        rx="1.3"
                        fill="white"
                        stroke="#FF0000"
                        strokeWidth="1.4"
                     />
                     <circle
                        cx="10.6689"
                        cy="9.87913"
                        r="5.66038"
                        fill="#FF0000"
                     />
                  </svg>
               )}
            </span>
         )}
      </>
   )
}
