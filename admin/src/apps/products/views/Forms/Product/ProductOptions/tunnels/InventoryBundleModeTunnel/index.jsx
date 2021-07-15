import React from 'react'
import { OptionTile, Spacer, TunnelHeader } from '@dailykit/ui'
import { Tooltip } from '../../../../../../../../shared/components'
import { TunnelBody } from '../../../tunnels/styled'
import { useMutation } from '@apollo/react-hooks'
import { INVENTORY_BUNDLES } from '../../../../../../graphql'
import { toast } from 'react-toastify'
import { logger, randomSuffix } from '../../../../../../../../shared/utils'
import { InventoryBundleContext } from '../../../../../../context/product/inventoryBundle'

const InventoryBundleModeTunnel = ({ open, close }) => {
   const { bundleState, bundleDispatch } = React.useContext(
      InventoryBundleContext
   )

   const [createBundle] = useMutation(INVENTORY_BUNDLES.CREATE, {
      onCompleted: data => {
         bundleDispatch({
            type: 'BUNDLE_ID',
            payload: data.createInventoryProductBundle.id,
         })
         open(2)
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   return (
      <>
         <TunnelHeader
            title="Choose Method"
            close={() => close(1)}
            tooltip={<Tooltip identifier="inventory_bundle_mode_tunnel" />}
         />
         <TunnelBody>
            <OptionTile
               title="Choose Existing Bundle"
               onClick={() => open(5)}
            />
            <Spacer size="16px" />
            <OptionTile
               title="Create New Bundle"
               onClick={() =>
                  createBundle({
                     variables: {
                        object: {
                           label:
                              bundleState.label ?? `bundle-${randomSuffix()}`,
                        },
                     },
                  })
               }
            />
         </TunnelBody>
      </>
   )
}

export default InventoryBundleModeTunnel
