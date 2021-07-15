import React from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import {
   ComboButton,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
   Flex,
   IconButton,
} from '@dailykit/ui'

import { AddTypesTunnel } from './tunnels'
import { MASTER } from '../../../../graphql'
import { logger } from '../../../../../../shared/utils'
import tableOptions from '../../../Listings/tableOption'
import { useTooltip, useTabs } from '../../../../../../shared/providers'
import { AddIcon, DeleteIcon } from '../../../../../../shared/assets/icons'
import {
   Tooltip,
   ErrorState,
   InlineLoader,
   Banner,
} from '../../../../../../shared/components'

const address = 'apps.settings.views.forms.accompanimenttypes.'

const AccompanimentTypesForm = () => {
   const { t } = useTranslation()
   const { tab, addTab } = useTabs()
   const tableRef = React.useRef()
   const { tooltip } = useTooltip()

   const [tunnels, openTunnel, closeTunnel] = useTunnel()

   // subscription
   const { loading, data, error } = useSubscription(MASTER.ACCOMPANIMENTS.LIST)

   // Mutation
   const [deleteElement] = useMutation(MASTER.ACCOMPANIMENTS.DELETE, {
      onCompleted: () => {
         toast.success('Successfully deleted the accompaniment!')
      },
      onError: error => {
         toast.error('Failed to delete the accompaniment')
         logger(error)
      },
   })

   React.useEffect(() => {
      if (!tab) {
         addTab(
            'Accompaniment Types',
            `/settings/master-lists/accompaniment-types`
         )
      }
   }, [tab, addTab])

   const remove = id => {
      deleteElement({
         variables: {
            ids: [id],
         },
      })
   }

   const columns = [
      {
         title: t(address.concat('type')),
         field: 'name',
         headerFilter: true,
         headerTooltip: column => {
            const identifier = 'listing_accompaniment_column_name'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Actions',
         headerFilter: false,
         headerSort: false,
         hozAlign: 'center',
         cssClass: 'center-text',
         formatter: reactFormatter(<Delete remove={remove} />),
      },
   ]

   if (loading) return <InlineLoader />
   if (!loading && error) {
      logger(error)
      toast.error('Failed to fetch accompaniments!')
      return <ErrorState />
   }
   return (
      <Flex width="calc(100% - 32px)" maxWidth="1280px" margin="0 auto">
         <Banner id="settings-app-master-lists-accompaniments-top" />
         <Flex
            as="header"
            container
            height="80px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex container alignItems="center">
               <Text as="h2">
                  {t(address.concat('accompaniment types'))} (
                  {data.accompaniments.length || 0})
               </Text>
               <Tooltip identifier="listing_accompaniments_heading" />
            </Flex>
            <ComboButton type="solid" onClick={() => openTunnel(1)}>
               <AddIcon size={24} /> Create Accompaniment Type
            </ComboButton>
         </Flex>
         <ReactTabulator
            ref={tableRef}
            columns={columns}
            data={data.accompaniments}
            options={tableOptions}
         />
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <AddTypesTunnel closeTunnel={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <Banner id="settings-app-master-lists-accompaniments-bottom" />
      </Flex>
   )
}

export default AccompanimentTypesForm

const Delete = ({ cell, remove }) => {
   const removeItem = () => {
      const { id = null, name = '' } = cell.getData()
      if (
         window.confirm(
            `Are your sure you want to delete ${name} accompaniment?`
         )
      ) {
         remove(id)
      }
   }

   return (
      <IconButton size="sm" type="ghost" onClick={removeItem}>
         <DeleteIcon color="#FF5A52" />
      </IconButton>
   )
}
