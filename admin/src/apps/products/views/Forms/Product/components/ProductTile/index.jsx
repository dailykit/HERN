import { IconButton, Spacer } from '@dailykit/ui'
import React from 'react'
import { DeleteIcon } from '../../../../../../../shared/assets/icons'

import { Action, ProductImage, Wrapper } from './styled'

const ProductTile = ({ name, assets, handleDelete }) => {
   const renderProductImage = () => {
      if (assets.images.length) {
         const [src] = assets.images
         return (
            <>
               <ProductImage src={src} size="40px" />
               <Spacer xAxis size="8px" />
            </>
         )
      }
      return null
   }

   const renderDeleteIcon = () => {
      return (
         <Action role="button" onClick={handleDelete}>
            <DeleteIcon color="#FFF" />
         </Action>
      )
   }

   return (
      <Wrapper>
         {renderDeleteIcon()}
         {renderProductImage()}
         <h4>{name}</h4>
      </Wrapper>
   )
}

export default ProductTile
