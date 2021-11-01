import React from 'react'
import {
   ComboButton,
   IconButton,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
   Flex,
} from '@dailykit/ui'
import {
   Tooltip,
   ErrorState,
   InlineLoader,
   Banner,
} from '../../../../../../shared/components'
import tableOptions from '../../../Listings/tableOption'
import { MASTER } from '../../../../graphql'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { AddIcon, DeleteIcon } from '../../../../../../shared/assets/icons'
import { logger } from '../../../../../../shared/utils'
import { toast } from 'react-toastify'
import AddTypesTunnel from './tunnels/AddTypes/index'

const address = 'apps.settings.views.forms.vegnonveg.'

const VegNonVeg = () => {
   const [tunnels, openTunnel, closeTunnel] = useTunnel()
   const { loading, data, error } = useSubscription(MASTER.VEG_NONVEG.LIST)
   const [deleteElement] = useMutation(MASTER.VEG_NONVEG.DELETE, {
      onCompleted: () => {
         toast.success('Successfully deleted the cuisine!')
      },
      onError: error => {
         toast.error('Failed to delete the cuisine')
         console.log(error)
      },
   })
   const remove = lbl => {
      deleteElement({
         variables: {
            where: {
               label: {
                  _eq: lbl,
               },
            },
         },
      })
   }

   const columns = [
      {
         title: 'Label',
         field: 'label',
         headerFilter: true,
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
   if (!loading && error) {
      logger(error)
      toast.error('Failed to fetch cuisines!')
      return <ErrorState />
   }
   if (loading) {
      return <InlineLoader />
   }
   return (
      <>
         <Flex width="calc(100% - 32px)" maxWidth="1280px" margin="0 auto">
            <Banner id="settings-app-master-lists-vegnonveg-top" />
            <Flex
               as="header"
               container
               height="80px"
               alignItems="center"
               justifyContent="space-between"
            >
               <Flex container alignItems="center">
                  <Text as="h2">Veg-NonVeg (0)</Text>
               </Flex>
               <ComboButton type="solid" onClick={() => openTunnel(1)}>
                  <AddIcon size={24} /> Create new type
               </ComboButton>
            </Flex>
            <Flex>
               <ReactTabulator
                  columns={columns}
                  data={data?.master_vegNonvegType}
                  options={tableOptions}
               ></ReactTabulator>
            </Flex>
            <Tunnels tunnels={tunnels}>
               <Tunnel layer={1}>
                  <AddTypesTunnel closeTunnel={closeTunnel} />
               </Tunnel>
            </Tunnels>
            <Banner id="settings-app-master-lists-vegnonveg-bottom" />
         </Flex>
      </>
   )
}

export default VegNonVeg

const Delete = ({ cell, remove }) => {
   const removeItem = () => {
      const { label = '' } = cell.getData()
      if (window.confirm(`Are your sure you want to delete - ${label}?`)) {
         remove(label)
      }
   }

   return (
      <IconButton size="sm" type="ghost" onClick={removeItem}>
         <DeleteIcon color="#FF5A52" />
      </IconButton>
   )
}
