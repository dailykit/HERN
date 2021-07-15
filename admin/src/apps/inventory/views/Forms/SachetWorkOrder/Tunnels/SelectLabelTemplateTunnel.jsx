import { useMutation } from '@apollo/react-hooks'
import {
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
import { Tooltip, Banner } from '../../../../../../shared/components'
import { logger } from '../../../../../../shared/utils'
import { GENERAL_ERROR_MESSAGE } from '../../../../constants/errorMessages'
import { UPDATE_SACHET_WORK_ORDER } from '../../../../graphql'
import { TunnelWrapper } from '../../utils/TunnelWrapper'

const address = 'apps.inventory.views.forms.sachetworkorder.tunnels.'

const onError = error => {
   logger(error)
   toast.error(GENERAL_ERROR_MESSAGE)
}

export default function SelectLabelTemplateTunnel({ close, state }) {
   const { t } = useTranslation()

   const [search, setSearch] = React.useState('')
   const [data] = React.useState([
      {
         id: 1,
         title: 'Slip Name',
      },
      { id: 2, title: 'Bar Code' },
      {
         id: 3,
         title: 'Sachet Quantity',
      },
      { id: 4, title: 'Supplier Name' },
      { id: 5, title: 'Packaging date' },
   ])

   const [list, selected, selectOption] = useMultiList(data || [])

   const [updateSachetWorkOrder, { loading }] = useMutation(
      UPDATE_SACHET_WORK_ORDER,
      {
         onCompleted: () => {
            toast.info('Work Order updated successfully!')
            close(1)
         },
         onError,
      }
   )

   const handleNext = () => {
      updateSachetWorkOrder({
         variables: {
            id: state.id,
            set: {
               label: selected,
            },
         },
      })
   }

   return (
      <>
         <TunnelHeader
            title={t(address.concat('select label templates'))}
            close={() => close(1)}
            right={{ title: 'Save', action: handleNext, isLoading: loading }}
            description="select label templates for this work order"
            tooltip={
               <Tooltip identifier="sachet_work_order_select_label_template_tunnel" />
            }
         />
         <TunnelWrapper>
            <Banner id="inventory-app-work-orders-sachet-template-tunnel-top" />
            <List>
               <ListSearch
                  onChange={value => setSearch(value)}
                  placeholder="type what you’re looking for..."
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
               <ListHeader type="MSL" label="labels" />
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
            <Banner id="inventory-app-work-orders-sachet-template-tunnel-bottom" />
         </TunnelWrapper>
      </>
   )
}
