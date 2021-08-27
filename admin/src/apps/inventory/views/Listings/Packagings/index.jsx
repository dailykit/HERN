import { useSubscription } from '@apollo/react-hooks'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import {
   ComboButton,
   Flex,
   Loader,
   Spacer,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { Banner } from '../../../../../shared/components'
import { Tooltip } from '../../../../../shared/components/Tooltip'
import { useTooltip, useTabs } from '../../../../../shared/providers'
import { logger } from '../../../../../shared/utils'
import { AddIcon, PackagingHubIcon } from '../../../assets/icons'
import { GENERAL_ERROR_MESSAGE } from '../../../constants/errorMessages'
import { PACKAGINGS_LISTINGS_SUBSCRIPTION } from '../../../graphql'
import { StyledWrapper } from '../styled'
import tableOptions from '../tableOption'
import PackagingTypeTunnel from './PackagingTypeTunnel'
import { HeaderFlex, StyledFlex } from './styled'

export default function Packagings() {
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const { addTab } = useTabs()
   const { tooltip } = useTooltip()

   const {
      loading: subLoading,
      data: { packagings = [] } = {},
      error,
   } = useSubscription(PACKAGINGS_LISTINGS_SUBSCRIPTION)

   if (error) {
      toast.error(GENERAL_ERROR_MESSAGE)
      logger(error)
   }

   const tableRef = React.useRef()

   const openForm = (_, cell) => {
      const { id, packagingName } = cell.getData()
      addTab(packagingName, `/inventory/packagings/${id}`)
   }

   const columns = [
      {
         title: 'Name',
         field: 'packagingName',
         headerFilter: true,
         frozen: true,
         width: 400,
         cssClass: 'RowClick',   
         cellClick: openForm,
         headerTooltip: col => {
            const identifier = 'packagings_listings_table_name'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
      {
         title: 'Supplier',
         field: 'supplier',
         headerFilter: false,
         formatter: reactFormatter(<SupplierName />),
         hozAlign: 'left',
         headerHozAlign: 'left',
         width: 180,
         headerTooltip: col => {
            const identifier = 'packagings_listings_table_Supplier'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
      {
         title: 'Type',
         field: 'type',
         headerFilter: false,
         hozAlign: 'left',
         headerHozAlign: 'left',
         width: 200,
         headerTooltip: col => {
            const identifier = 'packagings_listings_table_Type'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
      {
         title: 'Par Level',
         field: 'parLevel',
         headerFilter: false,
         headerSort: false,
         hozAlign: 'right',
         headerHozAlign: 'right',
         width: 120,
         headerTooltip: col => {
            const identifier = 'packagings_listings_table_Par_Level'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
      {
         title: 'On Hand',
         field: 'onHand',
         headerFilter: true,
         hozAlign: 'right',
         headerHozAlign: 'right',
         width: 120,
         headerTooltip: col => {
            const identifier = 'packagings_listings_table_On_Hand'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
      {
         title: 'Max Level',
         field: 'maxLevel',
         headerFilter: true,
         hozAlign: 'right',
         headerHozAlign: 'right',
         width: 120,
         headerTooltip: col => {
            const identifier = 'packagings_listings_table_Max_Level'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
      {
         title: 'Awaiting',
         field: 'awaiting',
         headerFilter: true,
         hozAlign: 'right',
         headerHozAlign: 'right',
         width: 120,
         headerTooltip: col => {
            const identifier = 'packagings_listings_table_awaiting'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
   ]

   if (subLoading) return <Loader />

   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="sm">
               <PackagingTypeTunnel close={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <StyledWrapper>
            <Banner id="inventory-app-packagings-listing-top" />
            <StyledFlex container justifyContent="space-between">
               <HeaderFlex container alignItems="center">
                  <Text as="h2" textAlign="left">
                     Packagings({packagings.length})
                  </Text>
                  <Tooltip identifier="packagings_listings_header_title" />
               </HeaderFlex>
               <StyledFlex container>
                  <ComboButton
                     type="outline"
                     onClick={() =>
                        addTab('Packaging Hub', '/inventory/packaging-hub')
                     }
                  >
                     <PackagingHubIcon />
                     EXPLORE PACKAGING HUB
                  </ComboButton>
                  <Spacer xAxis size="10px" />
                  <ComboButton type="solid" onClick={() => openTunnel(1)}>
                     <AddIcon color="#fff" size={24} />
                     Add Packaging
                  </ComboButton>
               </StyledFlex>
            </StyledFlex>
            <Spacer size="16px" />
            <ReactTabulator
               ref={tableRef}
               columns={columns}
               data={packagings}
               options={tableOptions}
            />
            <Banner id="inventory-app-packagings-listing-bottom" />
         </StyledWrapper>
      </>
   )
}

function SupplierName({
   cell: {
      _cell: { value },
   },
}) {
   if (value && value.name) return <>{value.name}</>
   return 'NA'
}
