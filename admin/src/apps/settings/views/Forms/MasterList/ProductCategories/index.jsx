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
   ButtonGroup
} from '@dailykit/ui'

import { Add, Edit } from './tunnels'
import { MASTER } from '../../../../graphql'
import { logger } from '../../../../../../shared/utils'
import tableOptions from '../../../Listings/tableOption'
import { useTooltip, useTabs } from '../../../../../../shared/providers'
import { AddIcon, DeleteIcon, EditIcon } from '../../../../../../shared/assets/icons'
import {
   Tooltip,
   ErrorState,
   InlineLoader,
   Banner,
} from '../../../../../../shared/components'
import useAssets from '../../../../../../shared/components/AssetUploader/useAssets'

const address = 'apps.settings.views.forms.accompanimenttypes.'

const ProductCategoriesForm = () => {
   const { t } = useTranslation()
   const { tooltip } = useTooltip()
   const tableRef = React.useRef()
   const { tab, addTab } = useTabs()

   const [addTunnels, addOpenTunnel, addCloseTunnel] = useTunnel()

   const [editTunnels, editOpenTunnel, editCloseTunnel] = useTunnel()

   const [productCategoryNameSelected, setProductCategoryNameSelected] = React.useState('')

   const [assetDeleteLoading, setAssetDeleteLoading] = React.useState(false)

   const {remove} = useAssets('images')


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
         console.log(error)
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

   const deleteCategory = async (name, metaDetails) => {
      if (metaDetails){
         setAssetDeleteLoading(true)
         if (metaDetails.iconKey) await remove(metaDetails.iconKey)
         if (metaDetails.imageKey) await remove(metaDetails.imageKey)
         if (metaDetails.bannerKey) await remove(metaDetails.bannerKey)
      }
      
      deleteElement({
         variables: {
            where: {
               name: { _eq: name },
            },
         },
      })
      setAssetDeleteLoading(false)
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
         formatter: reactFormatter(<Action deleteCategory={deleteCategory} setProductCategoryNameSelected={setProductCategoryNameSelected} editOpenTunnel={editOpenTunnel} />),
      },
   ]

   if (loading||assetDeleteLoading) return <InlineLoader />
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
            <ComboButton type="solid" onClick={() => addOpenTunnel(1)}>
               <AddIcon size={24} /> Create Product Category
            </ComboButton>
         </Flex>
         <ReactTabulator
            ref={tableRef}
            columns={columns}
            data={data.productCategories}
            options={tableOptions}
         />
         <Tunnels tunnels={addTunnels}>
            <Tunnel layer={1}>
               <Add closeTunnel={addCloseTunnel} />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={editTunnels}>
            <Tunnel layer={1}>
               {productCategoryNameSelected && <Edit closeTunnel={editCloseTunnel} productCategoryName={productCategoryNameSelected} />}
            </Tunnel>
         </Tunnels>
         <Banner id="settings-app-master-lists-product-categories-bottom" />
      </Flex>
   )
}

export default ProductCategoriesForm

const Action = ({ cell, deleteCategory, setProductCategoryNameSelected, editOpenTunnel }) => {
   const removeItem = () => {
      const { name = '', metaDetails = {} } = cell.getData()
      if (
         window.confirm(
            `Are your sure you want to delete product category - ${name} ?`
         )
      ) {
         deleteCategory(name, metaDetails)
      }
      

   }

   const editItem = () => {
      const { name = '' } = cell.getData()
      setProductCategoryNameSelected(name)
      editOpenTunnel(1)
   }

   return (
      <ButtonGroup>
         <IconButton size="sm" type="ghost" onClick={removeItem}>
            <DeleteIcon title="delete" color="#FF5A52" />
         </IconButton>
         <IconButton size="sm" type="ghost" onClick={editItem}>
            <EditIcon title="edit" color='#367BF5' />
         </IconButton>
    </ButtonGroup>
   )
}