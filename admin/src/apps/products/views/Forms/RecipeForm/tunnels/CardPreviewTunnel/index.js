import React from 'react'
import { Text, TunnelHeader } from '@dailykit/ui'
import { TunnelBody, StyledRow, ImageContainer } from '../styled'
import { RecipeContext } from '../../../../../context/recipe'

const CardPreviewTunnel = ({ closeTunnel }) => {
   const { recipeState } = React.useContext(RecipeContext)

   return (
      <>
         <TunnelHeader
            title={`Card Preview: ${recipeState.preview.title}`}
            close={() => closeTunnel(9)}
         />
         <TunnelBody>
            <StyledRow>
               <Text as="title">Front</Text>
            </StyledRow>
            <StyledRow>
               <ImageContainer>
                  <img
                     src={recipeState.preview.img}
                     alt={recipeState.preview.title}
                  />
               </ImageContainer>
            </StyledRow>
         </TunnelBody>
      </>
   )
}

export default CardPreviewTunnel
