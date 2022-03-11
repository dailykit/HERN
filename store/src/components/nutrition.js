import React from 'react'
import _ from 'lodash'
import { useTranslation } from '../context'

export const Nutritions = ({ simpleRecipeYield }) => {
   const { t, dynamicTrans } = useTranslation()

   const nutritionalInfo = simpleRecipeYield?.nutritionalInfo || {}
   const nutritions = Object.keys(nutritionalInfo).filter(
      item =>
         item !== 'per' &&
         item !== 'excludes' &&
         item !== 'allergens' &&
         Number(nutritionalInfo[item]) !== 0
   )
   const allergens = nutritionalInfo?.allergens


   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [])

   return (
      <div id="nutrition">
         <header className="hern-nutritionas-header">
            <h2><span>{t('Nutritions')}</span><span>{t('&')}</span> <span>{t('Allergens')}</span> </h2>
         </header>
         {nutritions.length > 0 ? (
            <>
               <div className="hern-nutrition-info">
                  {nutritions.map((nutrition, index) => (
                     <div key={index}>
                        <div data-translation="true"
                        >{_.startCase(nutrition)}</div>
                        <span></span>

                        <div>{nutritionalInfo[nutrition]}</div>
                     </div>
                  ))}
                  {allergens?.length > 0 && (
                     <span> <span>{t('Allergens')}</span>{': '}
                        <span data-translation="true"
                        >
                           {allergens?.join(',')} </span>

                     </span>
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
               (<span>{t('nutrition info not available')}</span>)
            </div>
         )
         }
      </div >
   )
}
