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
   Banner,
   ErrorState,
   InlineLoader,
   Tooltip,
} from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { GENERAL_ERROR_MESSAGE } from '../../../../../constants/errorMessages'
import { NO_SUPPLIERS } from '../../../../../constants/infoMessages'
import {
   SUPPLIERS_SUBSCRIPTION,
   UPDATE_PACKAGING,
} from '../../../../../graphql'
import { TunnelWrapper } from '../../../utils/TunnelWrapper'

const address = 'apps.inventory.views.forms.item.tunnels.suppliers.'

export default function SuppliersTunnel({ close, state }) {
   const { t } = useTranslation()
   const [search, setSearch] = React.useState('')
   const [data, setData] = React.useState([])
   const [list, current, selectOption] = useSingleList(data)

   const { loading, error } = useSubscription(SUPPLIERS_SUBSCRIPTION, {
      onSubscriptionData: input => {
         const newSuppliers = input.subscriptionData.data.suppliers.map(sup => {
            const firstName = sup.contactPerson?.firstName || ''
            const lastName = firstName ? `${sup.contactPerson?.lastName}` : ''
            const title = firstName + lastName || sup.name

            return {
               id: sup.id,
               supplier: { title: sup.name },
               contact: {
                  title,
                  img: '',
               },
            }
         })

         setData(newSuppliers)
      },
   })

   const [updatePackaging] = useMutation(UPDATE_PACKAGING, {
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
      },
      onCompleted: () => {
         close(1)
         toast.success('Supplier Added!')
      },
   })

   const handleSave = option => {
      updatePackaging({
         variables: {
            id: state.id,
            object: {
               supplierId: option.id,
            },
         },
      })
   }

   if (error) {
      logger(error)
      return <ErrorState />
   }

   if (loading) return <InlineLoader />

   return (
      <>
         <TunnelHeader
            title={t(address.concat('select supplier'))}
            close={() => close(1)}
            description="select supplier for this supplier item"
            tooltip={
               <Tooltip identifier="packaging-form-select-supplier_tunnel" />
            }
         />
         <TunnelWrapper>
            <Banner id="inventory-app-packaging-form-select-supplier-tunnel-top" />
            {list.length ? (
               <List>
                  <ListSearch
                     onChange={value => setSearch(value)}
                     placeholder="type what you’re looking for..."
                  />
                  <ListHeader
                     type="SSL22"
                     label={{ left: 'Supplier', right: 'Contact person' }}
                  />
                  <ListOptions>
                     {list
                        .filter(option =>
                           option.supplier.title.toLowerCase().includes(search)
                        )
                        .map(option => (
                           <ListItem
                              type="SSL22"
                              key={option.id}
                              isActive={option.id === current.id}
                              onClick={() => handleSave(option)}
                              content={{
                                 supplier: option.supplier,
                                 contact: option.contact,
                              }}
                           />
                        ))}
                  </ListOptions>
               </List>
            ) : (
               <Filler message={NO_SUPPLIERS} />
            )}
            <Banner id="inventory-app-packaging-form-select-supplier-tunnel-bottom" />
         </TunnelWrapper>
      </>
   )
}
