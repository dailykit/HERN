import React from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import {
   ComboButton,
   IconButton,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
   Flex,
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

const address = 'apps.settings.views.forms.cuisines.'

const CuisineForm = () => {
   const { t } = useTranslation()
   const { tab, addTab } = useTabs()
   const { tooltip } = useTooltip()

   const [tunnels, openTunnel, closeTunnel] = useTunnel()

   // subscription
   const { loading, data, error } = useSubscription(MASTER.CUISINES.LIST)

   // Mutation
   const [deleteElement] = useMutation(MASTER.CUISINES.DELETE, {
      onCompleted: () => {
         toast.success('Successfully deleted the cuisine!')
      },
      onError: error => {
         toast.error('Failed to delete the cuisine')
         logger(error)
      },
   })

   React.useEffect(() => {
      if (!tab) {
         addTab('Cuisines', `/settings/master-lists/cuisines`)
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
         title: t(address.concat('name')),
         field: 'name',
         headerFilter: true,
         headerTooltip: column => {
            const identifier = 'listing_cuisine_column_name'
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
      toast.error('Failed to fetch cuisines!')
      return <ErrorState />
   }

   return (
      <Flex width="calc(100% - 32px)" maxWidth="1280px" margin="0 auto">
         <Banner id="settings-app-master-lists-cuisine-top" />

         <Flex
            as="header"
            container
            height="80px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex container alignItems="center">
               <Text as="h2">
                  {t(address.concat('cuisines'))} ({data.cuisineNames.length})
               </Text>
               <Tooltip identifier="listing_cuisines_heading" />
            </Flex>
            <ComboButton type="solid" onClick={() => openTunnel(1)}>
               <AddIcon size={24} /> Create Cuisine
            </ComboButton>
         </Flex>
         <ReactTabulator
            columns={columns}
            data={data.cuisineNames}
            options={tableOptions}
         />
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <AddTypesTunnel closeTunnel={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <Banner id="settings-app-master-lists-cuisine-bottom" />
      </Flex>
   )
}

export default CuisineForm

const Delete = ({ cell, remove }) => {
   const removeItem = () => {
      const { id = null, name = '' } = cell.getData()
      if (
         window.confirm(`Are your sure you want to delete cuisine - ${name}?`)
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
