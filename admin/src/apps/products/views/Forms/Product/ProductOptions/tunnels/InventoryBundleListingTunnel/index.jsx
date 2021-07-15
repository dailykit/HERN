import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Filler,
   List,
   ListHeader,
   ListItem,
   ListOptions,
   ListSearch,
   TunnelHeader,
   useSingleList,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import {
   ErrorBoundary,
   InlineLoader,
   Tooltip,
} from '../../../../../../../../shared/components'
import { logger } from '../../../../../../../../shared/utils'
import {
   INVENTORY_BUNDLES,
   MODIFIERS,
   PRODUCT_OPTION,
} from '../../../../../../graphql'
import { TunnelBody } from '../../../tunnels/styled'
import { ProductContext } from '../../../../../../context/product'

const InventoryBundleListingTunnel = ({ close }) => {
   const {
      productState: { optionId },
   } = React.useContext(ProductContext)

   // Subscription
   const {
      data: { inventoryProductBundles = [] } = {},
      loading,
      error,
   } = useSubscription(INVENTORY_BUNDLES.VIEW_ALL)

   const [search, setSearch] = React.useState('')
   const [list, current, selectOption] = useSingleList(inventoryProductBundles)

   // Mutation
   const [updateProductOption, { loading: inFlight }] = useMutation(
      PRODUCT_OPTION.UPDATE,
      {
         onCompleted: () => {
            toast.success('Inventory product bundle added to option!')
            close(5)
            close(1)
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   const save = () => {
      if (inFlight) return
      updateProductOption({
         variables: {
            id: optionId,
            _set: {
               inventoryProductBundleId: current.id,
            },
         },
      })
   }

   React.useEffect(() => {
      if (current.id) {
         save()
      }
   }, [current.id])

   if (loading) return <InlineLoader />
   if (!loading && error) return <ErrorBoundary rootRoute="/apps/products" />

   return (
      <>
         <TunnelHeader
            title="Choose Bundle"
            close={() => close(5)}
            tooltip={<Tooltip identifier="inventory_product_bundles_tunnel" />}
         />
         <TunnelBody>
            {!inventoryProductBundles.length ? (
               <Filler
                  message="No bundles found! To start, please add some."
                  height="500px"
               />
            ) : (
               <List>
                  {Object.keys(current).length > 0 ? (
                     <ListItem type="SSL1" title={current.title} />
                  ) : (
                     <ListSearch
                        onChange={value => setSearch(value)}
                        placeholder="type what you’re looking for..."
                     />
                  )}
                  <ListHeader type="SSL1" label="Bundles" />
                  <ListOptions>
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

export default InventoryBundleListingTunnel
