import React from 'react'
import { Text } from '@dailykit/ui'
import { DeleteIcon } from '../../assets/icons'

import {
   StyledProductWrapper,
   ProductContent,
   ActionButton,
   ProductImage,
} from './styled'

const ProductTile = ({ image, title, onDelete }) => {
   return (
      <StyledProductWrapper>
         <ProductContent>
            {Boolean(image) && <ProductImage src={image} />}
            <Text as="p"> {title} </Text>
         </ProductContent>
         <ActionButton onClick={onDelete}>
            <DeleteIcon color="#FF6B5E" />
         </ActionButton>
      </StyledProductWrapper>
   )
}

export default ProductTile
