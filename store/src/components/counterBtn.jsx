import React from 'react'
import { DeleteIcon } from '../assets/icons'

export const CounterButton = props => {
   const { incrementClick, decrementClick, count } = props
   return (
      <div className="hern-counter-button">
         {count == 1 && props?.showDeleteButton ? (
            <DeleteIcon
               stroke={'red'}
               onClick={decrementClick}
               disabled={count === 0}
               // onClick={() => removeCartItems(data.ids)}
               style={{
                  cursor: 'pointer',
                  margin: '0rem 0.5rem',
                  padding: '2px',
               }}
               title="Delete"
            />
         ) : (
            <button
               className="hern-counter-minus-button"
               onClick={decrementClick}
               disabled={count === 1}
               style={{ padding: '2px' }}
            >
               -
            </button>
         )}
         <span className="hern-counter-count" style={{ padding: '2px' }}>
            {count}
         </span>
         <button
            className="hern-counter-plus-button"
            onClick={incrementClick}
            style={{ padding: '2px' }}
         >
            +
         </button>
      </div>
   )
}
