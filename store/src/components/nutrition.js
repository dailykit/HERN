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
   return (
      <div>
         <header
            style={{ paddingTop: '32px', borderBottom: '0.5px solid #f4f4f4' }}
         >
            <h2>Nutritions </h2>
         </header>
         {nutritions.length > 0 ? (
            <div>
               <table
                  style={{
                     width: '100%',
                     maxWidth: '600px',
                     margin: '0 auto',
                     paddingTop: '16px',
                  }}
               >
                  <tr>
                     <th>Nutrition</th>
                     <th>Per({nutritionalInfo?.per})</th>
                  </tr>
                  {nutritions.map((nutrition, index) => (
                     <tr key={index}>
                        <td>{nutrition}</td>
                        <td> {nutritionalInfo[nutrition]}</td>
                     </tr>
                  ))}
               </table>
            </div>
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
