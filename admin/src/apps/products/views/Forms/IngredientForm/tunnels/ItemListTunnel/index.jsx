import React from 'react'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'
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
   InlineLoader,
   Tooltip,
   Banner,
} from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { IngredientContext } from '../../../../../context/ingredient'
import { BULK_ITEMS, MOF, SACHET_ITEMS } from '../../../../../graphql'
import { TunnelBody } from '../styled'

const ItemListTunnel = ({ closeTunnel }) => {
   const { ingredientState, ingredientDispatch } = React.useContext(
      IngredientContext
   )
   const [items, setItems] = React.useState([])
   const [search, setSearch] = React.useState('')

   const [list, current, selectOption] = useSingleList(items)

   const TUNNEL_NUMBER = ingredientState.editMode ? 4 : 2

   // Queries for fetching items
   const [fetchBulkItems, { loading: bulkItemsLoading }] = useLazyQuery(
      BULK_ITEMS,
      {
         onCompleted: data => {
            const updatedItems = data.bulkItems.map(item => {
               return {
                  ...item,
                  title: `${item.supplierItem.name} ${item.processingName}`,
               }
            })
            setItems([...updatedItems])
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
         fetchPolicy: 'cache-and-network',
      }
   )
   const [fetchSupplierItems, { loading: supplierItemsLoading }] = useLazyQuery(
      SACHET_ITEMS,
      {
         onCompleted: data => {
            const updatedItems = data.sachetItems.map(item => {
               return {
                  ...item,
                  title: `${item.bulkItem.supplierItem.name} ${item.bulkItem.processingName} - ${item.unitSize} ${item.unit}`,
               }
            })
            setItems([...updatedItems])
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
         fetchPolicy: 'cache-and-network',
      }
   )

   React.useEffect(() => {
      if (ingredientState.itemType === 'bulk') {
         fetchBulkItems()
      } else {
         fetchSupplierItems()
      }
   }, [])

   // Mutation
   const [create, { loading: creating }] = useMutation(MOF.CREATE, {
      onCompleted: () => {
         if (!ingredientState.editMode) {
            toast.success('Item added successfully!')
         }
         closeTunnel(TUNNEL_NUMBER)
         closeTunnel(TUNNEL_NUMBER - 1)
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const add = () => {
      if (current?.id && !creating) {
         if (ingredientState.editMode) {
            ingredientDispatch({
               type: 'EDIT_MODE',
               payload: {
                  ...ingredientState.editMode,
                  sachetItem:
                     ingredientState.itemType === 'sachet' ? current : null,
                  bulkItem:
                     ingredientState.itemType === 'bulk' ? current : null,
               },
            })
            closeTunnel(TUNNEL_NUMBER)
            closeTunnel(TUNNEL_NUMBER - 1)
         } else {
            create({
               variables: {
                  object: {
                     ingredientSachetId: ingredientState.sachetId,
                     sachetItemId:
                        ingredientState.itemType === 'sachet'
                           ? current.id
                           : null,
                     bulkItemId:
                        ingredientState.itemType === 'bulk' ? current.id : null,
                  },
               },
            })
         }
      }
   }

   const renderButtonText = () => {
      if (ingredientState.editMode) {
         return 'Update'
      }
      return creating ? 'Adding...' : 'Add'
   }

   return (
      <>
         <TunnelHeader
            title="Select Item"
            close={() => closeTunnel(TUNNEL_NUMBER)}
            tooltip={<Tooltip identifier="sachet_item_tunnel" />}
            right={{ action: add, title: renderButtonText() }}
         />
         <TunnelBody>
            <Banner id="products-app-ingredients-item-tunnel-top" />
            {bulkItemsLoading || supplierItemsLoading ? (
               <InlineLoader />
            ) : (
               <>
                  {list.length ? (
                     <List>
                        {Object.keys(current).length > 0 ? (
                           <ListItem type="SSL1" title={current.title} />
                        ) : (
                           <ListSearch
                              onChange={value => setSearch(value)}
                              placeholder="type what you’re looking for..."
                           />
                        )}
                        <ListHeader
                           type="SSL1"
                           label={
                              ingredientState.currentMode === 'realTime'
                                 ? 'Bulk Items'
                                 : 'Sachet Items'
                           }
                        />
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
                                    onClick={() =>
                                       selectOption('id', option.id)
                                    }
                                 />
                              ))}
                        </ListOptions>
                     </List>
                  ) : (
                     <Filler height="500px" message="No Items found!" />
                  )}
               </>
            )}
            <Banner id="products-app-ingredients-item-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default ItemListTunnel
