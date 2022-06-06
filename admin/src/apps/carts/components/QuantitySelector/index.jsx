import React from 'react'
import {
   Flex,
   IconButton,
   MinusIcon,
   PlusIcon,
   Spacer,
   Text,
} from '@dailykit/ui'

const QuantitySelector = ({ quantity, setQuantity }) => {
   return (
      <div style={{ background: '#fff' }}>
         <Flex container alignItems="center" justifyContent="center">
            <IconButton
               type="solid"
               size="sm"
               onClick={() => quantity > 1 && setQuantity(qty => qty - 1)}
            >
               <MinusIcon color="#fff" />
            </IconButton>
            <Spacer xAxis size="16px" />
            <Text as="title">{quantity}</Text>
            <Spacer xAxis size="16px" />
            <IconButton
               type="solid"
               size="sm"
               onClick={() => setQuantity(qty => qty + 1)}
            >
               <PlusIcon color="#fff" />
            </IconButton>
         </Flex>
      </div>
   )
}

export default QuantitySelector
