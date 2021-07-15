import { useSubscription } from '@apollo/react-hooks'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import {
   Filler,
   Flex,
   IconButton,
   SectionTab,
   SectionTabList,
   SectionTabPanel,
   SectionTabPanels,
   SectionTabs,
   SectionTabsListHeader,
   Spacer,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AddIcon, ChevronRight } from '../../../../../shared/assets/icons'
import { ErrorState, InlineLoader } from '../../../../../shared/components'
import { Ranger } from '../../../../../shared/components/Ranger'
import { useTooltip } from '../../../../../shared/providers'
import { dateFmt } from '../../../../../shared/utils/dateFmt'
import { logger } from '../../../../../shared/utils/errorLog'
import { DataCard } from '../../../components'
import {
   NO_BULK_ITEMS,
   NO_SACHET_ITEMS,
} from '../../../constants/emptyMessages'
import { NO_SACHET_HISTORIES } from '../../../constants/infoMessages'
import { SACHET_ITEM_HISTORIES } from '../../../graphql'
import tableOptions from '../../Listings/tableOption'
import { ConfigureSachetTunnel, CreateSachetTunnel } from './tunnels'

const address = 'apps.inventory.views.forms.item.'

export default function PlannedLotView({
   sachetItems = [],
   procId,
   unit,
   openLinkConversionTunnel,
}) {
   const { t } = useTranslation()
   const [
      configureSachetTunnel,
      openConfigureSachetTunnel,
      closeConfigureSachetTunnel,
   ] = useTunnel(1)

   if (!procId) return <Filler message={NO_BULK_ITEMS} />

   return (
      <>
         <Tunnels tunnels={configureSachetTunnel}>
            <Tunnel layer={1}>
               <CreateSachetTunnel
                  open={openConfigureSachetTunnel}
                  close={closeConfigureSachetTunnel}
                  procId={procId}
                  unit={unit}
               />
            </Tunnel>
            <Tunnel layer={2}>
               <ConfigureSachetTunnel
                  open={openConfigureSachetTunnel}
                  close={closeConfigureSachetTunnel}
                  procId={procId}
                  unit={unit}
                  openLinkConversionTunnel={openLinkConversionTunnel}
               />
            </Tunnel>
         </Tunnels>
         <SectionTabsListHeader>
            <Text as="h2">{t(address.concat('sachets'))}</Text>
            <IconButton
               type="outline"
               onClick={() => {
                  openConfigureSachetTunnel(1)
               }}
            >
               <AddIcon />
            </IconButton>
         </SectionTabsListHeader>
         <SectionTabs>
            <SectionTabList>
               {sachetItems.map(sachet => {
                  return (
                     <SectionTab key={sachet.id}>
                        <div style={{ textAlign: 'left', padding: '14px' }}>
                           <h3>
                              {sachet.unitSize} {sachet.unit}
                           </h3>

                           <Text as="subtitle">
                              {t(address.concat('par'))}: {sachet.parLevel}{' '}
                              {sachet.unit}
                           </Text>
                        </div>
                     </SectionTab>
                  )
               })}
            </SectionTabList>

            <SectionTabPanels>
               {sachetItems.length ? (
                  sachetItems.map(activeSachet => {
                     return (
                        <SectionTabPanel key={activeSachet.id}>
                           <PlannedLotStats sachet={activeSachet} />
                        </SectionTabPanel>
                     )
                  })
               ) : (
                  <Filler message={NO_SACHET_ITEMS} />
               )}
            </SectionTabPanels>
         </SectionTabs>
      </>
   )
}

function PlannedLotStats({ sachet }) {
   const { t } = useTranslation()
   const [showHistory, setShowHistory] = useState(false)

   return (
      <>
         {showHistory && <BreadCrumb setShowHistory={setShowHistory} />}
         {showHistory ? (
            <SachetHistories sachetId={sachet.id} />
         ) : (
            <Flex margin="54px 0 0 0">
               <Ranger
                  label="On hand qty"
                  max={sachet.maxLevel}
                  min={sachet.parLevel}
                  maxLabel="Max Inventory qty"
                  minLabel="Par Level"
                  value={sachet.onHand}
               />
               <Spacer size="16px" />
               <Flex container style={{ flexWrap: 'wrap' }}>
                  <DataCard
                     title={t(address.concat('awaiting'))}
                     quantity={`${sachet.awaiting || 0} pkt`}
                  />
                  <Spacer xAxis size="16px" />
                  <DataCard
                     title={t(address.concat('commited'))}
                     quantity={`${sachet.committed || 0} pkt`}
                  />
                  <Spacer xAxis size="16px" />
                  <DataCard
                     title={t(address.concat('consumed'))}
                     quantity={`${sachet.consumed || 0} pkt`}
                     actionText="view history"
                     action={() => setShowHistory(true)}
                  />
               </Flex>
            </Flex>
         )}
      </>
   )
}

function SachetHistories({ sachetId }) {
   const {
      data: { sachetItemHistories = [] } = {},
      error,
      loading,
   } = useSubscription(SACHET_ITEM_HISTORIES, {
      variables: {
         sachetId,
      },
   })
   const { tooltip } = useTooltip()

   if (error) {
      logger(error)
      return <ErrorState height="400px" />
   }

   if (loading) return <InlineLoader />

   if (!sachetItemHistories.length)
      return <Filler message={NO_SACHET_HISTORIES} height="400px" />

   const columns = [
      {
         title: 'Input bulk Item',
         field: 'sachetWorkOrder.bulkItem.processingName',
         headerFilter: true,
         // cellClick: openForm,
         headerTooltip: col => {
            const identifier = 'sachet_item_history_input_bulk_item'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
      {
         title: 'Output Quantity',
         field: 'sachetWorkOrder.outputQuantity',
         headerFilter: false,
         headerTooltip: col => {
            const identifier = 'sachet_item_history_output_quantity'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
      {
         title: 'Scheduled on',
         field: 'sachetWorkOrder.scheduledOn',
         headerFilter: false,
         formatter: reactFormatter(<ShowDate />),
         headerTooltip: col => {
            const identifier = 'sachet_item_history_scheduledOn'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
      {
         title: 'Status',
         field: 'status',
         headerFilter: false,
         headerSort: false,
         headerTooltip: col => {
            const identifier = 'sachet_item_history_status'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
   ]

   return (
      <ReactTabulator
         data={sachetItemHistories}
         columns={columns}
         options={tableOptions}
      />
   )
}

function BreadCrumb({ setShowHistory }) {
   return (
      <Flex container margin="0 0 16px 0">
         <Text
            as="h3"
            style={{ color: '#00A7E1' }}
            role="button"
            onClick={() => setShowHistory(false)}
         >
            Bulk Item
         </Text>

         <ChevronRight />

         <Text as="h3">History</Text>
      </Flex>
   )
}

function ShowDate({ cell }) {
   const date = cell.getData().sachetWorkOrder?.scheduledOn

   if (date) return dateFmt.format(new Date(date))
   return 'N/A'
}
