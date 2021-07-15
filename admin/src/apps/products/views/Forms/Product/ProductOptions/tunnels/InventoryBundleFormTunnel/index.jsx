import React from 'react'
import {
   ButtonTile,
   Flex,
   Form,
   IconButton,
   OptionTile,
   Spacer,
   Text,
   TunnelHeader,
} from '@dailykit/ui'
import {
   InlineLoader,
   Tooltip,
} from '../../../../../../../../shared/components'
import { TunnelBody } from '../../../tunnels/styled'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   INVENTORY_BUNDLES,
   INVENTORY_BUNDLE_SACHETS,
} from '../../../../../../graphql'
import { toast } from 'react-toastify'
import { logger, randomSuffix } from '../../../../../../../../shared/utils'
import { InventoryBundleContext } from '../../../../../../context/product/inventoryBundle'
import { SachetWrapper } from './styled'
import {
   CloneIcon,
   DeleteIcon,
} from '../../../../../../../../shared/assets/icons'

const InventoryBundleFormTunnel = ({ open, close }) => {
   const {
      bundleState: { bundleId },
   } = React.useContext(InventoryBundleContext)

   const [bundle, setBundle] = React.useState(null)
   const [label, setLabel] = React.useState({
      value: '',
      meta: {
         errors: [],
         isValid: true,
         isTouched: false,
      },
   })

   const { loading } = useSubscription(INVENTORY_BUNDLES.VIEW, {
      variables: {
         id: bundleId,
      },
      onSubscriptionData: data => {
         setBundle(data.subscriptionData.data.inventoryProductBundle)
         setLabel({
            ...label,
            value: data.subscriptionData.data.inventoryProductBundle.label,
         })
      },
   })

   const [updateBundle] = useMutation(INVENTORY_BUNDLES.UPDATE, {
      onCompleted: data => {
         console.log(data)
         toast.success('Bundle updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const [createBundleSachet] = useMutation(INVENTORY_BUNDLE_SACHETS.CREATE, {
      onCompleted: data => {
         toast.success('Item cloned!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const [deleteBundleSachet] = useMutation(INVENTORY_BUNDLE_SACHETS.DELETE, {
      onCompleted: data => {
         toast.success('Item deleted!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const handleUpdateLabel = () => {
      if (label.value.trim()) {
         updateBundle({
            variables: {
               id: bundle.id,
               _set: {
                  label: label.value,
               },
            },
         })
      }
   }

   const cloneItem = sachetItemId => {
      createBundleSachet({
         variables: {
            object: {
               inventoryProductBundleId: bundle.id,
               sachetItemId,
            },
         },
      })
   }

   const deleteItem = id => {
      deleteBundleSachet({
         variables: {
            id,
         },
      })
   }

   return (
      <>
         <TunnelHeader
            title={`${label.value}`}
            close={() => close(2)}
            right={{
               title: 'Done',
               action: () => close(2),
            }}
            tooltip={<Tooltip identifier="create_inventory_bundle_tunnel" />}
         />
         <TunnelBody>
            {loading ? (
               <InlineLoader />
            ) : (
               <>
                  <Form.Group>
                     <Form.Label htmlFor="label" title="label">
                        Label*
                     </Form.Label>
                     <Form.Text
                        id="label"
                        name="label"
                        onBlur={handleUpdateLabel}
                        onChange={e =>
                           setLabel({ ...label, value: e.target.value })
                        }
                        value={label.value}
                        placeholder="Enter label"
                        hasError={label.meta.isTouched && !label.meta.isValid}
                     />
                     {label.meta.isTouched &&
                        !label.meta.isValid &&
                        label.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Spacer size="16px" />
                  {!!bundle?.inventoryProductBundleSachets?.length && (
                     <>
                        <Text as="subtitle">Items</Text>
                        <Spacer size="4px" />
                        {bundle?.inventoryProductBundleSachets?.map(
                           ({ sachetItem: sachet, id }) => (
                              <SachetWrapper key={id}>
                                 <Text as="p">{`${sachet.bulkItem.supplierItem.name} ${sachet.bulkItem.processingName} - ${sachet.unitSize} ${sachet.unit}`}</Text>
                                 <Spacer xAxis size="16px" />
                                 <Flex container alignItem="center">
                                    <IconButton
                                       type="ghost"
                                       onClick={() => cloneItem(sachet.id)}
                                    >
                                       <CloneIcon color="#00A7E1" />
                                    </IconButton>
                                    <Spacer xAxis size="8px" />
                                    <IconButton
                                       type="ghost"
                                       onClick={() => deleteItem(id)}
                                    >
                                       <DeleteIcon color="#FF5A52" />
                                    </IconButton>
                                 </Flex>
                              </SachetWrapper>
                           )
                        )}
                     </>
                  )}
                  <ButtonTile
                     type="secondary"
                     text="Add Item"
                     onClick={() => open(3)}
                  />
               </>
            )}
         </TunnelBody>
      </>
   )
}

export default InventoryBundleFormTunnel
