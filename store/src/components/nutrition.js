import React from 'react'

export const Nutritions = ({ simpleRecipeYield }) => {
   const nutritionalInfo = simpleRecipeYield?.nutritionalInfo || {}
   const nutritions = Object.keys(nutritionalInfo).filter(
      item =>
         item !== 'per' &&
         item !== 'excludes' &&
         item !== 'allergens' &&
         Number(nutritionalInfo[item]) !== 0
   )
   const allergens = nutritionalInfo?.allergens
   return (
      <div id="nutrition">
         <header className="hern-nutritionas-header">
            <h2>Nutritions &amp; Allergens </h2>
         </header>
         {nutritions.length > 0 ? (
            <>
               <div className="hern-nutrition-info">
                  {nutritions.map((nutrition, index) => (
                     <div key={index}>
                        <div>{nutrition}</div>
                        <span></span>
                        <div>{nutritionalInfo[nutrition]}</div>
                     </div>
                  ))}
                  {allergens?.length > 0 && (
                     <span>Allergens : {allergens?.join(',')}</span>
                  )}
               </div>
            </>
         ) : (
            <div
               style={{
                  textAlign: 'center',
                  padding: '64px 0',
                  color: '#6b7280',
               }}
            >
               (nutrition info not available)
            </div>
         )}
      </div>
   )
}
