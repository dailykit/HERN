import React from 'react'
import { Text, TunnelHeader } from '@dailykit/ui'
import { Trans, useTranslation } from 'react-i18next'
import { SolidTile, TunnelBody } from '../../../tunnels/styled'
import { Tooltip } from '../../../../../../../../shared/components'
import { ProductContext } from '../../../../../../context/product'
import { InventoryBundleContext } from '../../../../../../context/product/inventoryBundle'

const InventoryBundleItemTypeTunnel = ({ close, open }) => {
   const { bundleDispatch } = React.useContext(InventoryBundleContext)

   const select = value => {
      bundleDispatch({
         type: 'BUNDLE_ITEM_TYPE',
         payload: value,
      })
      open(4)
   }

   return (
      <>
         <TunnelHeader
            title="Select Item Type"
            close={() => close(3)}
            tooltip={<Tooltip identifier="inventory_bundle_item_type_tunnel" />}
         />
         <TunnelBody>
            <SolidTile onClick={() => select('supplier')}>
               <Text as="h1">Supplier Item</Text>
               <Text as="subtitle">Items bought directly from a supplier.</Text>
            </SolidTile>
            <br />
            <SolidTile onClick={() => select('sachet')}>
               <Text as="h1">Sachet Item</Text>
               <Text as="subtitle">
                  Items processed and packaged from a supplier item.
               </Text>
            </SolidTile>
            <br />
            <SolidTile onClick={() => select('bulk')}>
               <Text as="h1">Bulk Item</Text>
            </SolidTile>
         </TunnelBody>
      </>
   )
}

export default InventoryBundleItemTypeTunnel
