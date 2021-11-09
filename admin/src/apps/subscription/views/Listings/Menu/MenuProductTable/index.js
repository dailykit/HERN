import React, { useState } from 'react'
import {
   Flex,
   HorizontalTab,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
   HorizontalTabs,
   Text,
   Filler,
   IconButton,
   Checkbox,
   Spacer,
   ButtonGroup,
   TextButton,
   useTunnel,
   Tunnels,
   Tunnel,
} from '@dailykit/ui'
import moment from 'moment'
import { toast } from 'react-toastify'
import { useSubscription } from '@apollo/react-hooks'
import TableOptions from './tableOptions'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { ErrorState, InlineLoader } from '../../../../../../shared/components'
import { logger } from '../../../../../../shared/utils'
import {
   MENU_PRODUCT_BY_SUBSCRIPTION,
   MENU_PRODUCT_BY_SUBSCRIPTION_OCCURRENCE,
} from '../../../../graphql/subscriptions'
import {
   PublishIcon,
   UnPublishIcon,
} from '../../../../../products/assets/icons'
import { MenuProduct } from './BulkActionTunnel'

const MenuProductTables = () => {
   return (
      <>
         <Flex padding="4px 32px">
            <Flex>
               <Text as="h2">Menu Product</Text>
            </Flex>
            <Flex>
               <HorizontalTabs>
                  <HorizontalTabList>
                     <HorizontalTab>Occurences</HorizontalTab>
                     <HorizontalTab>Subscription</HorizontalTab>
                  </HorizontalTabList>
                  <HorizontalTabPanels>
                     <HorizontalTabPanel>
                        <MenuProductOccurenceTable />
                     </HorizontalTabPanel>
                     <HorizontalTabPanel>
                        <MenuProductSubscriptionTable />
                     </HorizontalTabPanel>
                  </HorizontalTabPanels>
               </HorizontalTabs>
            </Flex>
         </Flex>
      </>
   )
}
const MenuProductOccurenceTable = () => {
   const [selectedRows, setSelectedRows] = React.useState([])
   const [tunnels, openTunnel, closeTunnel] = useTunnel(3)

   const tableRef = React.useRef()
   const [productOccurrenceData, setProductOccurrenceData] = useState([])
   const [checked, setChecked] = React.useState(false)

   const { loading: subsLoading, error: subsError } = useSubscription(
      MENU_PRODUCT_BY_SUBSCRIPTION_OCCURRENCE,
      {
         onSubscriptionData: ({ subscriptionData }) => {
            const newData =
               subscriptionData.data.subscription_subscriptionOccurence_product.map(
                  each => {
                     each.fulfillmentDate = moment(
                        each.subscriptionOccurence.fulfillmentDate
                     ).format('DD-MM-YYYY')
                     each.servingSize =
                        each.subscriptionOccurence.subscriptionServing.servingSize
                     each.title =
                        each.subscriptionOccurence.subscriptionTitle.title
                     each.ItemCount =
                        each.subscriptionOccurence.subscriptionItemCount.count
                     each.productName =
                        each.productOption?.product?.name || 'N/A'
                     return each
                  }
               )
            setProductOccurrenceData(newData)
         },
      }
   )

   console.log('productOccurrenceData', productOccurrenceData)
   const columns = [
      {
         title: 'Label',
         field: 'label',
         visible: false,
         frozen: true,
         headerFilter: 'true',
         headerHozAlign: 'center',
      },
      {
         title: 'Product Name',
         field: 'productName',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Serving Size',
         field: 'servingSize',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Add On Price',
         field: 'addOnPrice',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Add On Label',
         field: 'addOnLabel',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Plan Title',
         field: 'title',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Serving Size',
         field: 'servingSize',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Item Count',
         field: 'ItemCount',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Product Category',
         field: 'productCategory',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Fulfillment Date',
         field: 'fulfillmentDate',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Visibility',
         field: 'isVisible',
         formatter: reactFormatter(<BooleanIcon check={'visible'} />),
         headerTooltip: true,
         width: 85,
      },
      {
         title: 'Availability',
         field: 'isAvailable',
         formatter: reactFormatter(<BooleanIcon check={'available'} />),
         headerTooltip: true,
         width: 85,
      },
      {
         title: 'Single Select',
         field: 'isSingleSelect',
         formatter: reactFormatter(<BooleanIcon check={'singleSelect'} />),
         headerTooltip: true,
         width: 85,
      },
   ]

   const handleRowSelection = ({ _row }) => {
      const rowData = _row.getData()
      const lastPersistence = localStorage.getItem(
         'selected-rows-id_occurrence_table'
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
         'selected-rows-id_occurrence_table',
         JSON.stringify(newData)
      )
   }
   const handleRowDeselection = ({ _row }) => {
      const data = _row.getData()
      const lastPersistence = localStorage.getItem(
         'selected-rows-id_occurrence_table'
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
         'selected-rows-id_occurrence_table',
         JSON.stringify(newLastPersistenceParse)
      )
   }

   const removeSelectedOccurrence = () => {
      setChecked({ checked: false })
      setSelectedRows([])
      tableRef.current.table.deselectRow()
      localStorage.setItem(
         'selected-rows-id_occurrence_table',
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
            'selected-rows-id_occurrence_table',
            JSON.stringify(multipleRowData.map(row => row.id))
         )
      } else {
         tableRef.current.table.deselectRow()
         setSelectedRows([])
         console.log('second', selectedRows)

         localStorage.setItem(
            'selected-rows-id_occurrence_table',
            JSON.stringify([])
         )
      }
   }
   console.log('selected row:::::', selectedRows)
   const selectionColumn =
      selectedRows.length > 0 &&
      selectedRows.length < productOccurrenceData.length
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
   if (subsLoading && !subsError) {
      return <InlineLoader />
   }
   if (subsError) {
      toast.error('Failed to fetch Occurrence!')
      logger(subsError)
      return <ErrorState />
   }
   if (productOccurrenceData.length == 0) {
      return <Filler message="Data not available" />
   }

   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="full">
               <MenuProduct
                  close={closeTunnel}
                  selectedRows={selectedRows}
                  removeSelectedRow={removeSelectedRow}
                  setSelectedRows={setSelectedRows}
               />
            </Tunnel>
         </Tunnels>
         <ActionBar
            title="subscription occurrence"
            selectedRows={selectedRows}
            // defaultIDs={defaultIDs()}
            openTunnel={openTunnel}
         />
         <Spacer size="30px" />
         <ReactTabulator
            ref={tableRef}
            // dataLoaded={tableLoaded}
            data={productOccurrenceData}
            options={TableOptions}
            rowSelected={handleRowSelection}
            rowDeselected={handleRowDeselection}
            selectableCheck={() => true}
            columns={[selectionColumn, ...columns]}
         />
      </>
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

const MenuProductSubscriptionTable = () => {
   const tableRef = React.useRef()
   const [productSubscriptionData, setProductSubscriptionData] = useState([])
   const [selectedRows, setSelectedRows] = React.useState([])
   const [tunnels, openTunnel, closeTunnel] = useTunnel(3)

   const [checked, setChecked] = React.useState(false)
   const { loading: subsLoading, error: subsError } = useSubscription(
      MENU_PRODUCT_BY_SUBSCRIPTION,
      {
         onSubscriptionData: ({ subscriptionData }) => {
            const newData =
               subscriptionData.data.subscription_subscriptionOccurence_product.map(
                  each => {
                     each.servingSize =
                        each.subscription.subscriptionServing.servingSize
                     each.title = each.subscription.subscriptionTitle.title
                     each.ItemCount =
                        each.subscription.subscriptionItemCount.count
                     each.productName =
                        each.productOption?.product?.name || 'N/A'
                     return each
                  }
               )
            setProductSubscriptionData(newData)
         },
      }
   )

   const dataLoaded = () => {
      tableRef.current.table.setGroupBy('productCategory')
   }
   console.log('productSubscriptionData', productSubscriptionData)
   const columns = [
      {
         title: 'Label',
         field: 'label',
         visible: false,
         frozen: true,
         headerFilter: 'true',
         headerHozAlign: 'center',
      },
      {
         title: 'Product Name',
         field: 'productName',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Serving Size',
         field: 'servingSize',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Add On Price',
         field: 'addOnPrice',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Add On Label',
         field: 'addOnLabel',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Plan Title',
         field: 'title',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Serving Size',
         field: 'servingSize',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Item Count',
         field: 'ItemCount',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Product Category',
         field: 'productCategory',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Visibility',
         field: 'isVisible',
         formatter: reactFormatter(<BooleanIcon check={'visible'} />),
         headerTooltip: true,
         width: 85,
      },
      {
         title: 'Availability',
         field: 'isAvailable',
         formatter: reactFormatter(<BooleanIcon check={'available'} />),
         headerTooltip: true,
         width: 85,
      },
      {
         title: 'Single Select',
         field: 'isSingleSelect',
         formatter: reactFormatter(<BooleanIcon check={'singleSelect'} />),
         headerTooltip: true,
         width: 85,
      },
   ]

   const handleRowSelection = ({ _row }) => {
      const rowData = _row.getData()
      const lastPersistence = localStorage.getItem(
         'selected-rows-id_subscription_table'
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
         'selected-rows-id_subscription_table',
         JSON.stringify(newData)
      )
   }
   const handleRowDeselection = ({ _row }) => {
      const data = _row.getData()
      const lastPersistence = localStorage.getItem(
         'selected-rows-id_subscription_table'
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
         'selected-rows-id_subscription_table',
         JSON.stringify(newLastPersistenceParse)
      )
   }

   const removeSelectedOccurrence = () => {
      setChecked({ checked: false })
      setSelectedRows([])
      tableRef.current.table.deselectRow()
      localStorage.setItem(
         'selected-rows-id_subscription_table',
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
            'selected-rows-id_subscription_table',
            JSON.stringify(multipleRowData.map(row => row.id))
         )
      } else {
         tableRef.current.table.deselectRow()
         setSelectedRows([])
         console.log('second', selectedRows)

         localStorage.setItem(
            'selected-rows-id_subscription_table',
            JSON.stringify([])
         )
      }
   }
   console.log('selected row:::::', selectedRows)
   const selectionColumn =
      selectedRows.length > 0 &&
      selectedRows.length < productSubscriptionData.length
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
   if (subsLoading && !subsError) {
      return <InlineLoader />
   }
   if (subsError) {
      toast.error('Failed to fetch Subscription!')
      logger(subsError)
      return <ErrorState />
   }
   if (productSubscriptionData.length == 0) {
      return <Filler message="Data not available" />
   }
   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="full">
               <MenuProduct
                  close={closeTunnel}
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
            openTunnel={openTunnel}
         />
         <Spacer size="30px" />
         <ReactTabulator
            ref={tableRef}
            columns={columns}
            data={productSubscriptionData}
            options={TableOptions}
            dataLoaded={dataLoaded}
            rowSelected={handleRowSelection}
            rowDeselected={handleRowDeselection}
            selectableCheck={() => true}
            columns={[selectionColumn, ...columns]}
         />
      </>
   )
}
const BooleanIcon = ({ cell, check }) => {
   const data = cell.getData()
   let isCheck = false
   if (check === 'visible') {
      isCheck = data.isVisible
   }
   if (check === 'available') {
      isCheck = data.isAvailable
   }
   if (check === 'singleSelect') {
      isCheck = data.isSingleSelect
   }
   console.log('isCheck', isCheck)
   return (
      <Flex
         container
         width="100%"
         justifyContent="space-between"
         alignItems="center"
      >
         <IconButton type="ghost">
            {isCheck ? <PublishIcon /> : <UnPublishIcon />}
         </IconButton>
      </Flex>
   )
}
export default MenuProductTables
