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

import { Add } from './tunnels'
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

const ProductCategoriesForm = () => {
   const { t } = useTranslation()
   const { tooltip } = useTooltip()
   const tableRef = React.useRef()
   const { tab, addTab } = useTabs()

   const [tunnels, openTunnel, closeTunnel] = useTunnel()

   // subscription
   const { loading, data, error } = useSubscription(
      MASTER.PRODUCT_CATEGORY.LIST
   )

   // Mutation
   const [deleteElement] = useMutation(MASTER.PRODUCT_CATEGORY.DELETE, {
      onCompleted: () => {
         toast.success('Successfully deleted the product category!')
      },
      onError: error => {
         toast.error('Failed to delete the product category')
         logger(error)
      },
   })

   React.useEffect(() => {
      if (!tab) {
         addTab(
            'Product Categories',
            `/settings/master-lists/product-categories`
         )
      }
   }, [tab, addTab])

   const remove = name => {
      deleteElement({
         variables: {
            where: {
               name: { _eq: name },
            },
         },
      })
   }

   const columns = [
      {
         title: t(address.concat('type')),
         field: 'name',
         headerFilter: true,
         headerTooltip: column => {
            const identifier = 'listing_product_categories_column_name'
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
      toast.error('Failed to fetch product categories!')
      return <ErrorState />
   }
   return (
      <Flex width="calc(100% - 32px)" maxWidth="1280px" margin="0 auto">
         <Banner id="settings-app-master-lists-product-categories-top" />
         <Flex
            as="header"
            container
            height="80px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex container alignItems="center">
               <Text as="h2">
                  Product Categories ({data.productCategories.length})
               </Text>
               <Tooltip identifier="listing_product_categories_heading" />
            </Flex>
            <ComboButton type="solid" onClick={() => openTunnel(1)}>
               <AddIcon size={24} /> Create Product Category
            </ComboButton>
         </Flex>
         <ReactTabulator
            ref={tableRef}
            columns={columns}
            data={data.productCategories}
            options={tableOptions}
         />
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <Add closeTunnel={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <Banner id="settings-app-master-lists-product-categories-bottom" />
      </Flex>
   )
}

export default ProductCategoriesForm

const Delete = ({ cell, remove }) => {
   const removeItem = () => {
      const { name = '' } = cell.getData()
      if (
         window.confirm(
            `Are your sure you want to delete product category - ${name} ?`
         )
      ) {
         remove(name)
      }
   }

   return (
      <IconButton size="sm" type="ghost" onClick={removeItem}>
         <DeleteIcon color="#FF5A52" />
      </IconButton>
   )
}
