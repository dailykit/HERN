import { useSubscription } from '@apollo/react-hooks'
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
import {
   ErrorState,
   InlineLoader,
   Tooltip,
   Banner,
} from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils/errorLog'
import { TunnelContainer } from '../../../../../components'
import { NO_PROCESSING } from '../../../../../constants/infoMessages'
import { MASTER_PROCESSINGS_SUBSCRIPTION } from '../../../../../graphql'

const address = 'apps.inventory.views.forms.item.tunnels.processing.'

export default function ProcessingTunnel({
   close,
   formState,
   createBulkItem,
   creatingBulkItem,
}) {
   const { t } = useTranslation()
   const [search, setSearch] = React.useState('')
   const [data, setData] = React.useState([])
   const [list, current, selectOption] = useSingleList(data)

   const { loading: processingsLoading, error } = useSubscription(
      MASTER_PROCESSINGS_SUBSCRIPTION,
      {
         variables: { supplierItemId: formState.id },
         onSubscriptionData: input => {
            const newProcessings =
               input.subscriptionData.data.masterProcessingsAggregate.nodes

            setData(newProcessings)
         },
      }
   )

   const handleSave = option => {
      createBulkItem({
         variables: {
            processingName: option.title,
            itemId: formState.id,
            unit: formState.unit, // string
         },
      })
      close(1)
   }

   if (error) {
      logger(error)
      return <ErrorState />
   }

   if (creatingBulkItem || processingsLoading) return <InlineLoader />

   return (
      <>
         <TunnelHeader
            title="Select processing"
            close={() => close(1)}
            description="select processing to use in this supplier item"
            tooltip={
               <Tooltip identifier="supplier_item_form_select_processing_tunnel" />
            }
         />
         <Banner id="inventory-app-items-supplier-item-processing-tunnel-top" />
         <TunnelContainer>
            {list.length ? (
               <List>
                  {Object.keys(current).length > 0 ? (
                     <ListItem type="SSL1" title={current.title} />
                  ) : (
                     <ListSearch
                        onChange={value => setSearch(value)}
                        placeholder={t(
                           address.concat("type what you're looking for")
                        )}
                     />
                  )}
                  <ListHeader type="SSL1" label="processing" />
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
                              onClick={() => handleSave(option)}
                           />
                        ))}
                  </ListOptions>
               </List>
            ) : (
               <Filler message={NO_PROCESSING} />
            )}
            <Banner id="inventory-app-items-supplier-item-processing-tunnel-bottom" />
         </TunnelContainer>
      </>
   )
}
