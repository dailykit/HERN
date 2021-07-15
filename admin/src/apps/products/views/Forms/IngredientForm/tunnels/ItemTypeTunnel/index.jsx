import React from 'react'
import { Flex, OptionTile, Spacer, TunnelHeader } from '@dailykit/ui'
import { IngredientContext } from '../../../../../context/ingredient'
import { Tooltip } from '../../../../../../../shared/components'

const ItemTypeTunnel = ({ closeTunnel, openTunnel }) => {
   const {
      ingredientDispatch,
      ingredientState: { editMode: mode },
   } = React.useContext(IngredientContext)

   const TUNNEL_NUMBER = mode ? 3 : 1

   const select = type => {
      ingredientDispatch({
         type: 'ITEM_TYPE',
         payload: type,
      })
      openTunnel(TUNNEL_NUMBER + 1)
   }

   return (
      <>
         <TunnelHeader
            title="Select Item Type"
            close={() => closeTunnel(TUNNEL_NUMBER)}
            tooltip={<Tooltip identifier="ingredient_sachet_item_type" />}
         />
         <Flex padding="16px">
            <OptionTile title="Bulk Item" onClick={() => select('bulk')} />
            <Spacer size="16px" />
            <OptionTile title="Sachet Item" onClick={() => select('sachet')} />
         </Flex>
      </>
   )
}

export default ItemTypeTunnel
