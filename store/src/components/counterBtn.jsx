import React from 'react'

export const CounterButton = props => {
   const { incrementClick, decrementClick, count } = props
   return (
      <div className="hern-counter-button">
         <button
            className="hern-counter-minus-button"
            onClick={decrementClick}
            disabled={count === 0}
         >
            -
         </button>
         <span className="hern-counter-count">{count}</span>
         <button className="hern-counter-plus-button" onClick={incrementClick}>
            +
         </button>
      </div>
   )
}
