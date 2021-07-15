import React, { useState } from 'react'
import { Row } from './style'
import { Close } from '../../assets/Icons'
export default function CustomSelect({ values, title, options, onChange }) {
   const [isActive, setIsActive] = useState(false)
   const applyChange = newItem => {
      onChange && onChange([...values, newItem])
   }

   const removeValue = removedItemId => {
      onChange && onChange(values.filter(value => value.id !== removedItemId))
   }

   return (
      <Row>
         <div className="dropdown-container">
            <label>{title}</label>
            <div className="dropdown-input">
               <span
                  onClick={() => setIsActive(!isActive)}
                  className="arrow-down"
               />
               <div className="dropdown-values">
                  {values.length ? (
                     values.map(value => (
                        <div key={value?.id} className="dropdown-value">
                           <p>
                              {options?.findIndex(
                                 option => option.id === value.id
                              ) >= 0 &&
                                 options[
                                    options?.findIndex(
                                       option => option.id === value.id
                                    )
                                 ]?.title}
                           </p>
                           <span
                              className="dropdown-remove"
                              onClick={() => removeValue(value.id)}
                           >
                              <Close />
                           </span>
                        </div>
                     ))
                  ) : (
                     <div
                        onClick={() => setIsActive(!isActive)}
                        className="dropdown-placeholder"
                     >
                        Select a file
                     </div>
                  )}
               </div>
            </div>
            <div className={!isActive ? 'dropdown-options' : 'dropdown-active'}>
               {options
                  .filter(
                     option =>
                        values.findIndex(value => value.id === option.id) === -1
                  )
                  .map(item => (
                     <div
                        onClick={() => applyChange(item)}
                        className="dropdown-item"
                        key={item.id}
                     >
                        {item.title}
                     </div>
                  ))}
            </div>
         </div>
      </Row>
   )
}
