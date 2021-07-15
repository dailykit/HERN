import React from 'react'
import { TunnelHeader, Text, OptionTile, Spacer } from '@dailykit/ui'
import { TunnelBody, SolidTile } from '../../../tunnels/styled'
import { ModifiersContext } from '../../../../../../context/product/modifiers'
import { Tooltip, Banner } from '../../../../../../../../shared/components'

const ModifierTypeTunnel = ({ open, close }) => {
   const { modifiersDispatch } = React.useContext(ModifiersContext)

   const select = type => {
      modifiersDispatch({
         type: 'OPTION_TYPE',
         payload: type,
      })
      open(4)
   }

   return (
      <>
         <TunnelHeader
            title="Choose Option Type"
            close={() => close(3)}
            tooltip={<Tooltip identifier="modifier_option_type_tunnel" />}
         />
         <TunnelBody>
            <Banner id="products-app-single-product-modifier-option-type-tunnel-top" />
            <OptionTile
               title="Sachet Item"
               onClick={() => select('sachetItem')}
            />
            <Spacer size="16px" />
            <OptionTile
               title="Ingredient Sachet"
               onClick={() => select('ingredientSachet')}
            />
            <Spacer size="16px" />
            <OptionTile
               title="Simple Recipe Servings"
               onClick={() => select('simpleRecipeYield')}
            />
            <Banner id="products-app-single-product-modifier-option-type-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default ModifierTypeTunnel
