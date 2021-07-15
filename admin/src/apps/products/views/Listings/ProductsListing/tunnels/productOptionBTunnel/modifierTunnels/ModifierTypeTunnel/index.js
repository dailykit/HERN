import React from 'react'
import { TunnelHeader, Text, OptionTile, Spacer } from '@dailykit/ui'
import { TunnelBody, SolidTile } from '../../../styled'
import { ModifiersContext } from '../../../../context/modifier'
import { Tooltip } from '../../../../../../../../../shared/components'

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
         </TunnelBody>
      </>
   )
}

export default ModifierTypeTunnel
