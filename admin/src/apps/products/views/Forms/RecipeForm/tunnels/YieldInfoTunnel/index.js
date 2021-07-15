import React from 'react'
import { TunnelHeader, Text } from '@dailykit/ui'
import { TunnelBody, Container } from '../styled'
import { RecipeContext } from '../../../../../context/recipe'
import { Nutrition, Tooltip } from '../../../../../../../shared/components'
import { currencyFmt } from '../../../../../../../shared/utils'

const InfoTunnel = ({ close }) => {
   const { recipeState } = React.useContext(RecipeContext)

   return (
      <>
         <TunnelHeader
            title="Cost and Nutrition"
            close={() => close(1)}
            tooltip={<Tooltip identifier="serving_info_tunnel" />}
         />
         <TunnelBody>
            <Container bottom="32">
               <Text as="subtitle"> Cost </Text>
               {recipeState.serving.cost ? (
                  <Text as="p">
                     {currencyFmt(Number(recipeState.serving.cost) || 0)}
                  </Text>
               ) : (
                  <Text as="p">NA</Text>
               )}
            </Container>
            <Container bottom="32">
               <Text as="subtitle"> Nutrition </Text>
               {recipeState.serving.nutritionalInfo ? (
                  <Nutrition
                     vertical
                     data={recipeState.serving.nutritionalInfo}
                  />
               ) : (
                  <Text as="p">NA</Text>
               )}
            </Container>
         </TunnelBody>
      </>
   )
}

export default InfoTunnel
