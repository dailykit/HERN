import React from 'react'
import moment from 'moment'
import { toast } from 'react-toastify'
import { useSubscription } from '@apollo/react-hooks'
import { Flex, Text, Spacer, useTunnel, Checkbox, TextButton, ButtonGroup, Tunnels, Tunnel } from '@dailykit/ui'
import { ReactTabulator, reactFormatter } from '@dailykit/react-tabulator'

import tableOptions from '../../../../tableOption'
import { logger } from '../../../../../../shared/utils'
import { useTooltip } from '../../../../../../shared/providers'
import { ActivityLogs } from '../../../../../../shared/components'
import { SUBSCRIPTION_OCCURENCES_LIST } from '../../../../graphql'
import {
   Tooltip,
   ErrorState,
   InlineLoader,
} from '../../../../../../shared/components'
import { AddOnProductsTunnel, PlanProductsTunnel } from '../../../../components'
import { SubscriptionOccurrenceBulkAction } from '../../../Listings/Subscriptions/BulkActionTunnel'

const Occurences = ({ id, setOccurencesTotal }) => {
   const tableRef = React.useRef()
   const { tooltip } = useTooltip()
   const [occurenceId, setOccurenceId] = React.useState(null)
   const [subscriptionId, setSubscriptionId] = React.useState(null)
   const [addOnTunnels, openAddOnTunnel, closeAddOnTunnel] = useTunnel(1)
   const [menuTunnels, openMenuTunnel, closeMenuTunnel] = useTunnel(1)
   const [logTunnels, openLogTunnel, closeLogTunnel] = useTunnel(1)
   const [logOccurenceId, setLogOccurenceId] = React.useState(null)
   const [selectedRows, setSelectedRows] = React.useState([])
   const [bulkTunnels, openBulkTunnel, closeBulkTunnel] = useTunnel(3)
   const [checked, setChecked] = React.useState(false)

   const {
      error,
      loading,
      data: { subscription_occurences = {} } = {},
   } = useSubscription(SUBSCRIPTION_OCCURENCES_LIST, {
      variables: { id },
      onSubscriptionData: ({ subscriptionData: { data = {} } = {} }) => {
         const {
            aggregate = {},
         } = data.subscription_occurences?.occurences_aggregate
         setOccurencesTotal(aggregate?.count || 0)
         console.log("this is subscription id::::", id)

      },
   })

   const editAddOns = (e, { _cell = {} }) => {
      const data = _cell.row.getData()
      setOccurenceId(data.id)
      setSubscriptionId(data.subscription.id)
      openAddOnTunnel(1)
   }

   const editMenu = (e, { _cell = {} }) => {
      const data = _cell.row.getData()
      setOccurenceId(data.id)
      setSubscriptionId(data.subscription.id)
      openMenuTunnel(1)
   }

   const columns = React.useMemo(() => [
      {
         title: 'Label',
         field: 'label',
         visible: false,
         frozen: true,
         headerFilter: 'true',
         headerHozAlign: 'center',
      },
      {
         title: 'Fulfillment Date',
         field: 'fulfillmentDate',
         cssClass: 'cell',
         cellClick: (e, cell) => {
            const data = cell.getData()
            if (data?.id) {
               setLogOccurenceId(data?.id)
               openLogTunnel(1)
            }
         },
         formatter: ({ _cell: { value } }) =>
            moment(value).format('MMM DD, YYYY'),
         headerTooltip: column => {
            const identifier = 'listing_occurences_column_fulfillment'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Cut Off Time',
         field: 'cutoffTimeStamp',
         formatter: ({ _cell: { value } }) =>
            moment(value).format('MMM DD, YYYY HH:mm A'),
         headerTooltip: column => {
            const identifier = 'listing_occurences_column_cutoff'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Start Time',
         field: 'startTimeStamp',
         formatter: ({ _cell: { value } }) =>
            moment(value).format('MMM DD, YYYY HH:mm A'),
         headerTooltip: column => {
            const identifier = 'listing_occurences_column_start'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         cssClass: 'cell',
         hozAlign: 'right',
         cellClick: editAddOns,
         title: 'Add On Products',
         formatter: reactFormatter(<AddOnProductsCount />),
         headerTooltip: column => {
            const identifier = 'listing_occurences_column_products'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         cssClass: 'cell',
         hozAlign: 'right',
         cellClick: editMenu,
         title: 'Menu Products',
         formatter: reactFormatter(<ProductsCount />),
         headerTooltip: column => {
            const identifier = 'listing_occurences_column_products'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
   ],[])
   const handleRowSelection = React.useCallback((_row) => {
      const rowData = _row.getData()
      const lastPersistence = localStorage.getItem(
         'selected-rows-id_subscription_occurrence_table'
      )
      const lastPersistenceParse =
         lastPersistence !== undefined &&
            lastPersistence !== null &&
            lastPersistence.length !== 0
            ? JSON.parse(lastPersistence)
            : []
      setSelectedRows(prevState => [...prevState, _row.getData()])
      let newData = [...lastPersistenceParse, rowData.id]
      localStorage.setItem(
         'selected-rows-id_subscription_occurrence_table',
         JSON.stringify(newData)
      )
   }, [])
   const handleRowDeselection = React.useCallback(({ _row }) => {
      const data = _row.getData()
      const lastPersistence = localStorage.getItem(
         'selected-rows-id_subscription_occurrence_table'
      )
      const lastPersistenceParse =
         lastPersistence !== undefined &&
            lastPersistence !== null &&
            lastPersistence.length !== 0
            ? JSON.parse(lastPersistence)
            : []
      setSelectedRows(prevState => prevState.filter(row => row.id !== data.id))
      const newLastPersistenceParse = lastPersistenceParse.filter(
         id => id !== data.id
      )
      localStorage.setItem(
         'selected-rows-id_subscription_occurrence_table',
         JSON.stringify(newLastPersistenceParse)
      )
   }, [])

   const removeSelectedOccurrence = () => {
      setChecked({ checked: false })
      setSelectedRows([])
      tableRef.current.table.deselectRow()
      localStorage.setItem(
         'selected-rows-id_subscription_occurrence_table',
         JSON.stringify([])
      )
   }

   const handleMultipleRowSelection = () => {
      setChecked(!checked)
      if (!checked) {
         tableRef.current.table.selectRow('active')
         let multipleRowData = tableRef.current.table.getSelectedData()
         setSelectedRows(multipleRowData)
         console.log('first', selectedRows)
         localStorage.setItem(
            'selected-rows-id_subscription_occurrence_table',
            JSON.stringify(multipleRowData.map(row => row.id))
         )
      } else {
         tableRef.current.table.deselectRow()
         setSelectedRows([])
         console.log('second', selectedRows)

         localStorage.setItem(
            'selected-rows-id_subscription_occurrence_table',
            JSON.stringify([])
         )
      }
   }
   console.log('selected row:::::', selectedRows)
   const selectionColumn =
      selectedRows.length > 0 &&
         selectedRows.length < subscription_occurences.length
         ? {
            formatter: 'rowSelection',
            titleFormatter: reactFormatter(
               <CrossBox
                  removeSelectedOccurrence={removeSelectedOccurrence}
               />
            ),
            align: 'center',
            hozAlign: 'center',
            width: 10,
            headerSort: false,
            frozen: true,
         }
         : {
            formatter: 'rowSelection',
            titleFormatter: reactFormatter(
               <CheckBox
                  checked={checked}
                  handleMultipleRowSelection={handleMultipleRowSelection}
               />
            ),
            align: 'center',
            hozAlign: 'center',
            width: 20,
            headerSort: false,
            frozen: true,
         }

   const removeSelectedRow = id => {
      tableRef.current.table.deselectRow(id)
   }
   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Failed to fetch the list of occurences!')
      logger(error)
      return <ErrorState message="Failed to fetch the list of occurences!" />
   }
   return (
      <>
         <Flex container alignItems="center">
            <Text as="h3">Occurences</Text>
            <Tooltip identifier="form_subscription_section_delivery_day_section_occurences" />
         </Flex>
         <Spacer size="16px" />
         <Tunnels tunnels={bulkTunnels}>
            <Tunnel layer={1} size="full">
               <SubscriptionOccurrenceBulkAction
                  close={closeBulkTunnel}
                  selectedRows={selectedRows}
                  removeSelectedRow={removeSelectedRow}
                  setSelectedRows={setSelectedRows}
               />
            </Tunnel>
         </Tunnels>
         <ActionBar
            title="subscription"
            selectedRows={selectedRows}
            // defaultIDs={defaultIDs()}
            openTunnel={openBulkTunnel}
         />
         <ReactTabulator
            ref={tableRef}
            columns={[selectionColumn, ...columns]}
            options={{
               ...tableOptions,
               layout: 'fitColumns',
               // scrollToRowIfVisible: false,
            }}
            rowSelected={handleRowSelection}
            rowDeselected={handleRowDeselection}
            selectableCheck={() => true}
            data={subscription_occurences?.occurences_aggregate?.nodes || []}
         />
         <AddOnProductsTunnel
            occurenceId={occurenceId}
            subscriptionId={subscriptionId}
            tunnel={{ list: addOnTunnels, close: closeAddOnTunnel }}
         />
         <PlanProductsTunnel
            occurenceId={occurenceId}
            subscriptionId={subscriptionId}
            tunnel={{ list: menuTunnels, close: closeMenuTunnel }}
         />
         <ActivityLogs
            tunnels={logTunnels}
            openTunnel={openLogTunnel}
            closeTunnel={closeLogTunnel}
            subscriptionOccurenceId={logOccurenceId}
         />
      </>
   )
}

export default Occurences

const ProductsCount = ({ cell: { _cell } }) => {
   const data = _cell.row.getData()
   return (
      <div>
         <span title="Added to this occurence">
            {data.products.aggregate.count}
         </span>
         /
         <span title="Added to the subscription">
            {data.subscription.products.aggregate.count}
         </span>
      </div>
   )
}

const AddOnProductsCount = ({ cell: { _cell } }) => {
   const data = _cell.row.getData()
   return (
      <div>
         <span title="Added to this occurence">
            {data.addOnProducts.aggregate.count}
         </span>
         /
         <span title="Added to the subscription">
            {data.subscription.addOnProducts.aggregate.count}
         </span>
      </div>
   )
}
const ActionBar = ({ title, selectedRows, openTunnel }) => {
   return (
      <>
         <Flex
            container
            as="header"
            width="100%"
            style={{ marginLeft: 0 }}
            alignItems="center"
            justifyContent="flex-start"
         >
            <Text as="subtitle">
               {selectedRows.length == 0
                  ? `No ${title}`
                  : selectedRows.length == 1
                     ? `${selectedRows.length} ${title}`
                     : `${selectedRows.length} ${title}s`}{' '}
               selected
            </Text>
            <ButtonGroup align="left">
               <TextButton
                  type="ghost"
                  size="sm"
                  disabled={selectedRows.length === 0 ? true : false}
                  onClick={() => openTunnel(1)}
               >
                  APPLY BULK ACTIONS
               </TextButton>
            </ButtonGroup>
         </Flex>
      </>
   )
}
const CheckBox = ({ handleMultipleRowSelection, checked }) => {
   return (
      <Checkbox
         id="label"
         checked={checked}
         onChange={() => {
            handleMultipleRowSelection()
         }}
         isAllSelected={null}
      />
   )
}
const CrossBox = ({ removeSelectedOccurrence }) => {
   return (
      <Checkbox
         id="label"
         checked={false}
         onChange={removeSelectedOccurrence}
         isAllSelected={false}
      />
   )
}
