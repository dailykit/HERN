import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Filler,
   List,
   ListHeader,
   ListItem,
   ListOptions,
   ListSearch,
   Tag,
   TagGroup,
   TunnelHeader,
   useMultiList,
} from '@dailykit/ui'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
   Banner,
   ErrorState,
   Tooltip,
} from '../../../../../../../shared/components'
import { InlineLoader } from '../../../../../../../shared/components/InlineLoader'
import { logger } from '../../../../../../../shared/utils'
import { ERROR_ADDING_ALLERGENS } from '../../../../../constants/errorMessages'
import { NO_ALLERGENS } from '../../../../../constants/infoMessages'
import { ALLERGENS_ADDED } from '../../../../../constants/successMessages'
import {
   MASTER_ALLERGENS_SUBSCRIPTION,
   UPDATE_BULK_ITEM,
} from '../../../../../graphql'
import { TunnelBody } from '../styled'

const address = 'apps.inventory.views.forms.item.tunnels.allergens.'

export default function AllergensTunnel({ close, bulkItemId }) {
   const { t } = useTranslation()
   const [search, setSearch] = React.useState('')

   const {
      loading: allergensLoading,
      data: { masterAllergens = [] } = {},
      error,
   } = useSubscription(MASTER_ALLERGENS_SUBSCRIPTION)

   const [udpateBulkItem, { loading }] = useMutation(UPDATE_BULK_ITEM, {
      onCompleted: () => {
         toast.success(ALLERGENS_ADDED)
         close()
      },
      onError: error => {
         logger(error)
         toast.error(ERROR_ADDING_ALLERGENS)
         close()
      },
   })

   const [list, selected, selectOption] = useMultiList(masterAllergens)

   const save = () => {
      udpateBulkItem({
         variables: {
            id: bulkItemId,
            object: {
               allergens: selected,
            },
         },
      })
   }

   if (allergensLoading) return <InlineLoader />
   if (error) {
      logger(error)
      return <ErrorState />
   }

   return (
      <>
         <TunnelHeader
            title={t(address.concat('add allergens'))}
            right={{
               title: loading ? 'Saving...' : t(address.concat('save')),
               action: save,
            }}
            close={close}
            description="select allergens for this bulk item"
            tooltip={
               <Tooltip identifier="supplier_item_form_add_allergens_tunnel" />
            }
         />

         <TunnelBody>
            <Banner id="inventory-app-items-supplier-item-add-allergens-tunnel-top" />
            {list.length ? (
               <List>
                  <ListSearch
                     onChange={value => setSearch(value)}
                     placeholder={t(
                        address.concat("type what you're looking for")
                     )}
                  />
                  {selected.length > 0 && (
                     <TagGroup style={{ margin: '8px 0' }}>
                        {selected.map(option => (
                           <Tag
                              key={option.id}
                              title={option.title}
                              onClick={() => selectOption('id', option.id)}
                           >
                              {option.title}
                           </Tag>
                        ))}
                     </TagGroup>
                  )}
                  <ListHeader type="MSL1" label="allergens" />
                  <ListOptions>
                     {list
                        .filter(option =>
                           option.title.toLowerCase().includes(search)
                        )
                        .map(option => (
                           <ListItem
                              type="MSL1"
                              key={option.id}
                              title={option.title}
                              onClick={() => selectOption('id', option.id)}
                              isActive={selected.find(
                                 item => item.id === option.id
                              )}
                           />
                        ))}
                  </ListOptions>
               </List>
            ) : (
               <Filler message={NO_ALLERGENS} />
            )}
            <Banner id="inventory-app-items-supplier-item-add-allergens-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}
