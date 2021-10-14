import { useMutation, useSubscription } from '@apollo/react-hooks'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import {
   ComboButton,
   Flex,
   IconButton,
   Loader,
   Spacer,
   Text,
   TextButton,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import DeleteIcon from '../../../../../shared/assets/icons/Delete'
import { Banner } from '../../../../../shared/components'
import { Tooltip } from '../../../../../shared/components/Tooltip'
import { useTooltip, useTabs } from '../../../../../shared/providers'
import { logger, randomSuffix } from '../../../../../shared/utils/index'
import { AddIcon } from '../../../assets/icons'
import {
   GENERAL_ERROR_MESSAGE,
   SUPPLIER_CANNOT_BE_DELETED,
} from '../../../constants/errorMessages'
import {
   CONFIRM_DELETE_SUPPLIER,
   SUPPLIER_DELETED,
} from '../../../constants/successMessages'
import {
   ALL_SUPPLIERS_SUBSCRIPTION,
   CREATE_SUPPLIER,
   DELETE_SUPPLIER,
} from '../../../graphql'
import { StyledWrapper } from '../styled'
import tableOptions from '../tableOption'
import CreateSupplier from '../../../../../shared/CreateUtils/Inventory/createSupplier'

const address = 'apps.inventory.views.listings.supplier.'

export default function SupplierListing() {
   const { t } = useTranslation()
   const { addTab } = useTabs()

   const { tooltip } = useTooltip()
   const [supplierTunnels, openSupplierTunnel, closeSupplierTunnel] = useTunnel(1)

   const {
      loading: listLoading,
      error,
      data: { suppliers = [] } = {},
   } = useSubscription(ALL_SUPPLIERS_SUBSCRIPTION)

   if (error) {
      logger(error)
      toast.error(GENERAL_ERROR_MESSAGE)
   }

   const [createSupplier] = useMutation(CREATE_SUPPLIER, {
      onCompleted: input => {
         const supplierData = input.createSupplier.returning[0]
         toast.success('Supplier Added!')
         addTab(supplierData.name, `/inventory/suppliers/${supplierData.id}`)
      },
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
      },
   })

   const [deleteSupplier] = useMutation(DELETE_SUPPLIER, {
      onCompleted: () => {
         toast.info(SUPPLIER_DELETED)
      },
      onError: error => {
         logger(error)
         toast.error(SUPPLIER_CANNOT_BE_DELETED)
      },
   })

   const createSupplierHandler = () => {
      // create supplier in DB
      const name = `supplier-${randomSuffix()}`
      createSupplier({
         variables: {
            object: {
               name,
            },
         },
      })
   }

   const tableRef = React.useRef()

   const openForm = (_, cell) => {
      const { id, name } = cell.getData()
      addTab(name, `/inventory/suppliers/${id}`)
   }

   const columns = [
      {
         title: 'Name',
         field: 'name',
         headerFilter: true,
         cssClass: 'RowClick',
         cellClick: openForm,
         headerTooltip: col => {
            const identifier = 'suppliers_listings_supplier_name'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
         width: 350,
      },
      {
         title: 'Person of Contact',
         field: 'contactPerson',
         headerFilter: false,
         headerSort: false,
         hozAlign: 'left',
         formatter: reactFormatter(<ContactPerson />),
         headerTooltip: col => {
            const identifier = 'suppliers_listings_contact_person'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
         width: 250,
      },
      {
         title: 'Available',
         field: 'available',
         headerFilter: false,
         formatter: 'tickCross',
         hozAlign: 'center',
         cssClass: 'center-text',
         width: 120,
         headerTooltip: col => {
            const identifier = 'suppliers_listings_supplier_availability'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
      {
         title: 'Actions',
         headerFilter: false,
         headerSort: false,
         hozAlign: 'center',
         cssClass: 'center-text',
         formatter: reactFormatter(
            <DeleteSupplier deleteSupplier={deleteSupplier} />
         ),
         width: 100,
      },
   ]

   if (listLoading) return <Loader />

   return (
      <>
         <StyledWrapper>
            <Banner id="inventory-app-suppliers-listing-top" />
            <Tunnels tunnels={supplierTunnels}>
               <Tunnel layer={1} size="md">
                  <CreateSupplier closeTunnel={closeSupplierTunnel} />
               </Tunnel>
            </Tunnels>
            <Flex
               container
               alignItems="center"
               justifyContent="space-between"
               padding="16px 0"
            >
               <Flex container>
                  <Text as="h2">{t(address.concat('suppliers'))}({suppliers.length})</Text>
                  <Tooltip identifier="suppliers_listings_heading" />
               </Flex>
               <Flex
                  container
                  alignItems="center"
                  justifyContent="space-between"
               >
                  <TextButton
                     type="outline"
                     onClick={() => tableRef.current.table.clearHeaderFilter()}
                  >
                     Clear Filters
                  </TextButton>
                  <Spacer xAxis size="10px" />
                  <ComboButton type="solid" onClick={() => openSupplierTunnel(1)}>
                     <AddIcon color="#fff" size={24} /> Add Supplier
                  </ComboButton>
               </Flex>
            </Flex>

            <Spacer size="16px" />
            <ReactTabulator
               ref={tableRef}
               columns={columns}
               data={suppliers}
               options={tableOptions}
            />
            <Banner id="inventory-app-suppliers-listing-bottom" />
         </StyledWrapper>
      </>
   )
}

function DeleteSupplier({ deleteSupplier, cell }) {
   const handleDelete = () => {
      if (window.confirm(CONFIRM_DELETE_SUPPLIER)) {
         const { id } = cell.getData()
         deleteSupplier({
            variables: { id },
         })
      }
   }

   return (
      <IconButton type="ghost" onClick={handleDelete}>
         <DeleteIcon color="#FF5A52" />
      </IconButton>
   )
}

function ContactPerson({
   cell: {
      _cell: { value },
   },
}) {
   if (value && value.firstName && value.lastName && value.phoneNumber)
      return (
         <>{`${value.firstName} ${value.lastName} (${value.phoneNumber})`}</>
      )

   return 'NA'
}
