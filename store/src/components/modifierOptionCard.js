import React from 'react'
import { ShowImageIcon } from '../assets/icons'
import { formatCurrency } from '../utils'
import classNames from 'classnames'
import { useTranslation } from '../context'

export const ModifierOptionCard = ({
   modifierOption,
   onCardClick,
   onCustomizeClick,
   checkIcon: CheckIcon,
   checkIconPosition = 'LEFT',
   showCheckIcon = true,
   showPrice = false,
   showImageIcon = false,
   showCustomize = true,
}) => {
   const { t } = useTranslation()
   return (
      <div
         className="hern-modifier-option-card"
         onClick={() => {
            console.log('click')
            onCardClick()
         }}
      >
         <div className="hern-modifier-option-card-left">
            {showCheckIcon && checkIconPosition === 'LEFT' && (
               <span className="hern-modifier-option-card-checkIcon">
                  <CheckIcon />
               </span>
            )}
            <span className="hern-modifier-option-name" data-translation="true"
               data-original-value={modifierOption.name}>
               {modifierOption.name}
            </span>
            {showPrice &&
               checkIconPosition === 'RIGHT' &&
               modifierOption.price > 0 && (
                  <span className="hern-modifier-option-price">
                     {'('}
                     {modifierOption.discount > 0 && (
                        <span
                           style={{
                              textDecoration: 'line-through',
                           }}
                        >
                           {formatCurrency(modifierOption.price)}
                        </span>
                     )}
                     {formatCurrency(
                        modifierOption.price - modifierOption.discount
                     )}
                     {')'}
                  </span>
               )}
            {showImageIcon && (
               <span
                  className="hern-modifier-option-showImageIcon"
                  onClick={e => {
                     e.stopPropagation()
                  }}
               >
                  <ShowImageIcon />
               </span>
            )}
         </div>
         <div className="hern-modifier-option-card-right">
            {/* <span className="hern-modifier-card-checkIcon">
              <CheckIcon />
            </span> */}
            {showCheckIcon && checkIconPosition === 'RIGHT' && (
               <span className="hern-modifier-option-card-checkIcon">
                  <CheckIcon />
               </span>
            )}
            {showPrice &&
               checkIconPosition === 'LEFT' &&
               modifierOption.price > 0 && (
                  <span className="hern-modifier-option-price">
                     {modifierOption.discount > 0 && (
                        <span
                           style={{
                              textDecoration: 'line-through',
                           }}
                        >
                           {formatCurrency(modifierOption.price)}
                        </span>
                     )}
                     {formatCurrency(
                        modifierOption.price - modifierOption.discount
                     )}
                  </span>
               )}
            {showCustomize && modifierOption.additionalModifierTemplateId && (
               <span
                  className={classNames('hern-modifier-option-card-customize', {
                     'hern-modifier-option-card-customize-on-right-check':
                        checkIconPosition === 'RIGHT',
                     'hern-modifier-option-card-customize-on-left-check-zero-price':
                        checkIconPosition === 'LEFT' &&
                        modifierOption.price === 0,
                     'hern-modifier-option-card-customize-on-left-check-with-price':
                        checkIconPosition === 'LEFT' &&
                        modifierOption.price > 0,
                  })}
                  onClick={e => {
                     if (onCustomizeClick) {
                        e.stopPropagation()
                        onCustomizeClick()
                     }
                  }}
               >
                  {t('customize')}
               </span>
            )}
         </div>
      </div>
   )
}
