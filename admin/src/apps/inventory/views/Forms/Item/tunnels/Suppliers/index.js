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
import React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
   ErrorState,
   InlineLoader,
   Tooltip,
   Banner,
} from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils/errorLog'
import { TunnelContainer } from '../../../../../components'
import { NO_SUPPLIERS } from '../../../../../constants/infoMessages'
import {
   SUPPLIERS_SUBSCRIPTION,
   UPDATE_SUPPLIER_ITEM,
} from '../../../../../graphql'

const address = 'apps.inventory.views.forms.item.tunnels.suppliers.'

export default function SupplierTunnel({ close, formState }) {
   const { t } = useTranslation()
   const [search, setSearch] = React.useState('')
   const [data, setData] = React.useState([])
   const [list, current, selectOption] = useSingleList(data)

   const { loading: supplierLoading, error } = useSubscription(
      SUPPLIERS_SUBSCRIPTION,
      {
         onSubscriptionData: input => {
            const newSuppliers = input.subscriptionData.data.suppliers.map(
               sup => {
                  const title = sup.contactPerson?.firstName || ''
                  const lastName = title ? `${sup.contactPerson?.lastName}` : ''
                  return {
                     id: sup.id,
                     supplier: { title: sup.name },
                     contact: {
                        title: title + lastName,
                        img: '',
                     },
                  }
               }
            )

            setData(newSuppliers)
         },
      }
   )

   const [updateSupplierItem, { loading }] = useMutation(UPDATE_SUPPLIER_ITEM, {
      onCompleted: () => {
         // toast and close
         toast.info('Supplier Information Added')
         close(1)
      },
      onError: error => {
         // toast and log error
         logger(error)
         toast.info('Error adding the supplier. Please try again')
         close(1)
      },
   })

   const handleSave = option => {
      const { id: supplierId } = option
      updateSupplierItem({
         variables: {
            id: formState.id,
            object: {
               supplierId,
            },
         },
      })
   }

   if (error) {
      logger(error)
      return <ErrorState />
   }

   if (loading || supplierLoading) return <InlineLoader />

   return (
      <>
         <TunnelHeader
            title={t(address.concat('select supplier'))}
            close={() => close(1)}
            description="select supplier for this supplier item"
            tooltip={
               <Tooltip identifier="supplier_item_form_select_supplier-tunnel" />
            }
         />
         <Banner id="inventory-app-items-supplier-item-tunnel-top" />
         <TunnelContainer>
            {list.length ? (
               <List>
                  {Object.keys(current).length > 0 ? (
                     <ListItem
                        type="SSL22"
                        content={{
                           supplier: current.supplier,
                           contact: current.contact,
                        }}
                     />
                  ) : (
                     <ListSearch
                        onChange={value => setSearch(value)}
                        placeholder="type what you’re looking for..."
                     />
                  )}
                  <ListHeader
                     type="SSL22"
                     label={{ left: 'Supplier', right: 'Contact person' }}
                  />
                  <ListOptions>
                     {list
                        .filter(option =>
                           option.supplier.title.toLowerCase().includes(search)
                        )
                        .map(option => {
                           return (
                              // prettier-ignore
                              <ListItem
                              type="SSL22"
                              key={option.id}
                              isActive={option.id === current.id}
                              onClick={() => handleSave(option)}
                              content={{
                                 supplier: option.supplier,
                                 contact:
                                    option.contact && option.contact.title
                                       ? option.contact
                                       : { title: 'N/A', img: '' },
                              }}
                           />
                           )
                        })}
                  </ListOptions>
               </List>
            ) : (
               <Filler message={NO_SUPPLIERS} />
            )}
         </TunnelContainer>
         <Banner id="inventory-app-items-supplier-item-tunnel-bottom" />
      </>
   )
}
