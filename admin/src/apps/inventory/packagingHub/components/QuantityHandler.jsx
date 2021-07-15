import React from 'react'

import { MultiplierWrapper } from './styled'

import { IncrementIcon, SubtractIcon } from '../../assets/icons'

const QuantityHandler = ({ value, onInc, onDec }) => {
   return (
      <MultiplierWrapper>
         <button style={{ marginBottom: '6px' }} type="button" onClick={onDec}>
            <SubtractIcon />
         </button>

         <span>{value}</span>

         <button type="button" onClick={onInc}>
            <IncrementIcon />
         </button>
      </MultiplierWrapper>
   )
}

export default QuantityHandler
