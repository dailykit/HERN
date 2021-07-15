import React from 'react'
import { toast } from 'react-toastify'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   List,
   ListHeader,
   ListItem,
   ListOptions,
   ListSearch,
   TunnelHeader,
   useSingleList,
} from '@dailykit/ui'

import {
   InlineLoader,
   Tooltip,
} from '../../../../../../../../shared/components'
import { logger } from '../../../../../../../../shared/utils'
import {
   CREATE_ITEM,
   CREATE_SACHET_ITEM,
} from '../../../../../../../inventory/graphql/mutations/item'
import { ProductContext } from '../../../../../../context/product'
import {
   INVENTORY_BUNDLE_SACHETS,
   PRODUCT_OPTION,
   S_BULK_ITEMS,
   S_SACHET_ITEMS,
   S_SIMPLE_RECIPE_YIELDS,
   S_SUPPLIER_ITEMS,
} from '../../../../../../graphql'
import { TunnelBody } from '../../../tunnels/styled'
import { InventoryBundleContext } from '../../../../../../context/product/inventoryBundle'

const InventoryBundleItemsTunnel = ({ close }) => {
   const { bundleState } = React.useContext(InventoryBundleContext)
   console.log(bundleState)

   const [search, setSearch] = React.useState('')
   const [items, setItems] = React.useState([])
   const [list, current, selectOption] = useSingleList(items)

   // Subscription for fetching items
   const { loading: supplierItemsLoading } = useSubscription(S_SUPPLIER_ITEMS, {
      skip: bundleState.bundleItemType !== 'supplier',
      onSubscriptionData: data => {
         const { supplierItems } = data.subscriptionData.data
         const updatedItems = supplierItems.map(item => {
            return {
               id: item.id,
               title: `${item.name} - ${item.unitSize} ${item.unit}`,
            }
         })
         setItems([...updatedItems])
      },
   })
   const { loading: sachetItemsLoading } = useSubscription(S_SACHET_ITEMS, {
      skip: bundleState.bundleItemType !== 'sachet',
      onSubscriptionData: data => {
         const { sachetItems } = data.subscriptionData.data
         const updatedItems = sachetItems.map(item => {
            return {
               id: item.id,
               title: `${item.bulkItem.supplierItem.name} ${item.bulkItem.processingName} - ${item.unitSize} ${item.unit}`,
            }
         })
         setItems([...updatedItems])
      },
   })
   const { loading: bulkItemsLoading } = useSubscription(S_BULK_ITEMS, {
      skip: bundleState.bundleItemType !== 'bulk',
      onSubscriptionData: data => {
         const { bulkItems } = data.subscriptionData.data
         const updatedItems = bulkItems.map(item => {
            return {
               id: item.id,
               title: `${item.supplierItem.name} ${item.processingName}`,
            }
         })
         setItems([...updatedItems])
      },
   })

   const [createBundleSachet] = useMutation(INVENTORY_BUNDLE_SACHETS.CREATE, {
      onCompleted: () => {
         toast.success('Item added!')
         close(4)
         close(3)
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const [createSupplierItem] = useMutation(CREATE_ITEM, {
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const [createSachetItem] = useMutation(CREATE_SACHET_ITEM, {
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   // Handlers
   const quickCreateItem = () => {
      const itemName = search.slice(0, 1).toUpperCase() + search.slice(1)
      switch (bundleState.bundleItemType) {
         case 'inventory':
            return createSupplierItem({
               variables: {
                  object: {
                     name: itemName,
                  },
               },
            })
         // TODO: handle sachet item quick create in inventory products
         // case 'sachet':
         //    return createSachetItem({
         //       variables: {
         //          object: {
         //             name: itemName,
         //          },
         //       },
         //    })
         default:
            console.error('No item type matched!')
      }
   }

   React.useEffect(() => {
      if (current.id) {
         if (bundleState.bundleItemType === 'bulk') {
            const qty = parseInt(
               window.prompt("What's the quantity for this bulk item?")
            )
            if (!isNaN(qty) && qty > 0) {
               createBundleSachet({
                  variables: {
                     object: {
                        inventoryProductBundleId: bundleState.bundleId,
                        bulkItemId: current.id,
                        bulkItemQuantity: qty,
                     },
                  },
               })
            } else {
               toast.error('Invalid quantity!')
            }
         } else {
            createBundleSachet({
               variables: {
                  object: {
                     inventoryProductBundleId: bundleState.bundleId,
                     sachetItemId:
                        bundleState.bundleItemType === 'sachet'
                           ? current.id
                           : null,
                     supplierItemId:
                        bundleState.bundleItemType === 'supplier'
                           ? current.id
                           : null,
                     bulkItemId: null,
                  },
               },
            })
         }
      }
   }, [current])

   return (
      <>
         <TunnelHeader
            title="Select an Item"
            close={() => close(4)}
            tooltip={<Tooltip identifier="inventory_bundle_item_tunnel" />}
         />
         <TunnelBody>
            {sachetItemsLoading || supplierItemsLoading || bulkItemsLoading ? (
               <InlineLoader />
            ) : (
               <List>
                  {Object.keys(current).length > 0 ? (
                     <ListItem type="SSL1" title={current.title} />
                  ) : (
                     <ListSearch
                        onChange={value => setSearch(value)}
                        placeholder="Type what you're looking for"
                     />
                  )}
                  <ListHeader type="SSL1" label="Items" />
                  <ListOptions
                     search={search}
                     handleOnCreate={
                        bundleState.bundleItemType === 'inventory'
                           ? quickCreateItem
                           : null
                     }
                  >
                     {list
                        .filter(option =>
                           option.title.toLowerCase().includes(search)
                        )
                        .map(option => (
                           <ListItem
                              type="SSL1"
                              key={option.id}
                              title={option.title}
                              isActive={option.id === current.id}
                              onClick={() => selectOption('id', option.id)}
                           />
                        ))}
                  </ListOptions>
               </List>
            )}
         </TunnelBody>
      </>
   )
}

export default InventoryBundleItemsTunnel
