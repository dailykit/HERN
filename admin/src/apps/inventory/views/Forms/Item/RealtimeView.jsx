import { useSubscription } from '@apollo/react-hooks'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { Filler, Flex, Spacer, Text } from '@dailykit/ui'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from '../../../../../shared/assets/icons'
import { ErrorState, InlineLoader } from '../../../../../shared/components'
import { Ranger } from '../../../../../shared/components/Ranger'
import { useTooltip } from '../../../../../shared/providers'
import { dateFmt } from '../../../../../shared/utils/dateFmt'
import { logger } from '../../../../../shared/utils/errorLog'
import { DataCard } from '../../../components'
import { NO_HISTORY } from '../../../constants/infoMessages'
import { BULK_ITEM_HISTORIES } from '../../../graphql'
import tableOptions from '../../Listings/tableOption'

const address = 'apps.inventory.views.forms.item.'

export default function RealTimeView({ proc, formState }) {
   const { t } = useTranslation()
   const [showHistory, setShowHistory] = useState(false)
   const unit = proc.unit || formState.unit || ''

   if (!proc) return null

   return (
      <>
         {showHistory && <BreadCrumb setShowHistory={setShowHistory} />}

         {showHistory ? (
            <HistoryTable bulkItemId={proc.id} />
         ) : (
            <Flex margin="64px 48px 0 0">
               <Ranger
                  label="On hand qty"
                  max={proc.maxLevel}
                  min={proc.parLevel}
                  minLabel="Par Level"
                  maxLabel="Max Inventory qty"
                  value={proc.onHand}
                  unit={proc.unit}
               />
               <Spacer size="16px" />
               <Flex container style={{ flexWrap: 'wrap' }}>
                  <DataCard
                     title={t(address.concat('awaiting'))}
                     quantity={`${proc.awaiting} ${unit}`}
                  />
                  <Spacer xAxis size="16px" />
                  <DataCard
                     title={t(address.concat('commited'))}
                     quantity={`${proc.committed} ${unit}`}
                  />
                  <Spacer xAxis size="16px" />
                  <DataCard
                     title={t(address.concat('consumed'))}
                     quantity={`${proc.consumed} ${unit}`}
                     actionText="view history"
                     action={() => setShowHistory(true)}
                  />
               </Flex>
            </Flex>
         )}
      </>
   )
}

function HistoryTable({ bulkItemId }) {
   const {
      data: { bulkItemHistories = [] } = {},
      loading,
      error,
   } = useSubscription(BULK_ITEM_HISTORIES, {
      variables: {
         bulkItemId,
      },
   })
   const { tooltip } = useTooltip()

   if (error) {
      logger(error)
      return <ErrorState height="400px" />
   }

   if (loading) return <InlineLoader />
   if (!bulkItemHistories.length)
      return <Filler message={NO_HISTORY} height="400px" />

   const columns = [
      {
         title: 'Output item',
         field: 'bulkWorkOrder.outputBulkItem.processingName',
         headerFilter: true,
         // cellClick: openForm,
         headerTooltip: col => {
            const identifier = 'bulk_item_history_output_bulkItem'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
      {
         title: 'Output Quantity',
         field: 'bulkWorkOrder.outputQuantity',
         headerFilter: false,
         headerTooltip: col => {
            const identifier = 'bulk_item_history_output_quantity'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
      {
         title: 'Scheduled on',
         field: 'bulkWorkOrder.scheduledOn',
         headerFilter: false,
         formatter: reactFormatter(<ShowDate />),
         headerTooltip: col => {
            const identifier = 'bulk_item_history_scheduledOn'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
      {
         title: 'Status',
         field: 'status',
         headerFilter: false,
         headerSort: false,
         headerTooltip: col => {
            const identifier = 'bulk_item_history_status'
            return tooltip(identifier)?.description || col.getDefinition().title
         },
      },
   ]

   return (
      <ReactTabulator
         data={bulkItemHistories}
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
   const date = cell.getData().bulkWorkOrder?.scheduledOn

   if (date) return dateFmt.format(new Date(date))
   return 'N/A'
}
