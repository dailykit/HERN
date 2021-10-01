import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { isEmpty } from 'lodash'
import styled from 'styled-components'
import { useSubscription } from '@apollo/react-hooks'
import {
   Text,
   Form,
   Flex,
   TextButton,
   ButtonGroup,
   useTunnel,
   Checkbox,
   Spacer,
} from '@dailykit/ui'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'

import { useMenu } from './state'
import tableOptions from '../../../tableOption'
import { SUBSCRIPTION_OCCURENCES } from '../../../graphql'
import { useTooltip } from '../../../../../shared/providers'
import { InlineLoader, Tooltip } from '../../../../../shared/components'
import { AddOnProductsTunnel, PlanProductsTunnel } from '../../../components'

const PlansSection = () => {
   const tableRef = React.useRef()
   const { tooltip } = useTooltip()
   const { state, dispatch } = useMenu()
   const [occurenceId, setOccurenceId] = React.useState(null)
   const [subscriptionId, setSubscriptionId] = React.useState(null)
   const [addOnTunnels, openAddOnTunnel, closeAddOnTunnel] = useTunnel(1)
   const [menuTunnels, openMenuTunnel, closeMenuTunnel] = useTunnel(1)
   const [selectedRows, setSelectedRows] = useState([])
   const [checked, setChecked] = useState(false)
   const { loading, data: { subscriptionOccurences = {} } = {} } =
      useSubscription(SUBSCRIPTION_OCCURENCES, {
         variables: {
            fulfillmentDate: {
               _in: state.dates.map(date => moment(date).format('YYYY-MM-DD')),
            },
         },
         onSubscriptionData: () => {
            setSelectedRows([])
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

   const columns = React.useMemo(
      () => [
         {
            title: 'Servings',
            headerFilter: true,
            headerFilterPlaceholder: 'Search servings...',
            field: 'subscription.itemCount.serving.size',
            hozAlign: 'right',
            headerHozAlign: 'right',
            headerTooltip: column => {
               const identifier = 'plan_listing_column_servings'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            title: 'Title',
            headerFilter: true,
            headerFilterPlaceholder: 'Search titles...',
            field: 'subscription.itemCount.serving.subscriptionTitle.title',
            headerTooltip: column => {
               const identifier = 'plan_listing_column_title'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            title: 'Item Count',
            headerFilter: true,
            headerFilterPlaceholder: 'Search item counts...',
            field: 'subscription.itemCount.count',
            hozAlign: 'right',
            headerHozAlign: 'right',
            headerTooltip: column => {
               const identifier = 'plan_listing_column_item_count'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            hozAlign: 'right',
            headerHozAlign: 'right',
            title: 'Fulfillment Date',
            field: 'fulfillmentDate',
            formatter: ({ _cell: { value } }) => moment(value).format('MMM DD'),
            headerTooltip: column => {
               const identifier = 'plan_listing_column_fulfillmentDate'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            title: 'Cut Off',
            field: 'cutoffTimeStamp',
            formatter: ({ _cell: { value } }) =>
               moment(value).format('MMM DD HH:mm A'),
            headerTooltip: column => {
               const identifier = 'plan_listing_column_cut_off'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            title: 'Start Time',
            field: 'startTimeStamp',
            formatter: ({ _cell: { value } }) =>
               moment(value).format('MMM DD HH:mm A'),
            headerTooltip: column => {
               const identifier = 'plan_listing_column_state_time'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            hozAlign: 'right',
            cellClick: editAddOns,
            title: 'Add On Products',
            formatter: reactFormatter(<AddOnProductsCount />),
            headerHozAlign: 'right',
            headerTooltip: column => {
               const identifier = 'plan_listing_column_addon_products'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            hozAlign: 'right',
            title: 'Menu Products',
            cellClick: editMenu,
            formatter: reactFormatter(<ProductsCount />),
            headerHozAlign: 'right',
            headerTooltip: column => {
               const identifier = 'plan_listing_column_products'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            title: 'Customers',
            field: 'subscription.customers.aggregate.count',
            hozAlign: 'right',
            headerHozAlign: 'right',
            headerTooltip: column => {
               const identifier = 'plan_listing_column_customers'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
      ],
      []
   )
   const handleRowSelection = ({ _row }) => {
      const data = _row.getData()
      setSelectedRows(prevState => [...prevState, data])
      dispatch({
         type: 'SET_PLAN',
         payload: {
            occurence: { id: data.id },
            subscription: { id: data.subscription.id },
            item: { count: data.subscription.itemCount.count },
            serving: { size: data.subscription.itemCount.serving.size },
         },
      })
   }
   const handleRowValidation = row => {
      if (!localStorage.getItem('serving_size')) return true
      return (
         row.getData().subscription.itemCount.serving.size ===
         Number(localStorage.getItem('serving_size'))
      )
   }
   const handleRowDeselection = ({ _row }) => {
      const data = _row.getData()
      setSelectedRows(prevState => prevState.filter(row => row.id !== data.id))
      dispatch({
         type: 'REMOVE_PLAN',
         payload: data.id,
      })
   }
   const handleMultipleRowSelection = () => {
      setChecked(!checked)
      if (!checked) {
         tableRef.current.table.selectRow('active')
         let multipleRowData = tableRef.current.table.getSelectedData()
         let dataForDispatch = multipleRowData.map(data => ({
            occurence: { id: data.id },
            subscription: { id: data.subscription.id },
            item: { count: data.subscription.itemCount.count },
            serving: { size: data.subscription.itemCount.serving.size },
         }))
         dataForDispatch.forEach(data => {
            dispatch({
               type: 'SET_PLAN',
               payload: data,
            })
         })
         setSelectedRows(multipleRowData)
      } else {
         tableRef.current.table.deselectRow()
         dispatch({
            type: 'CLEAR_STATE',
         })
         setSelectedRows([])
      }
   }
   const removeSelectedPlans = () => {
      setChecked(false)
      setSelectedRows([])
      tableRef.current.table.deselectRow()
      dispatch({
         type: 'CLEAR_STATE',
      })
   }
   //change column according to selected rows
   const selectionColumn =
      selectedRows.length > 0 &&
      selectedRows.length < subscriptionOccurences.nodes.length
         ? {
              formatter: 'rowSelection',
              titleFormatter: reactFormatter(
                 <CrossBox removeSelectedPlans={removeSelectedPlans} />
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

   return (
      <Wrapper>
         <Flex
            container
            height="48px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex container alignItems="center">
               <Flex container alignItems="center">
                  <Text as="h2" style={{ marginBottom: '0px' }}>
                     Plans
                  </Text>
                  <Tooltip identifier="listing_menu_section_plans_heading" />
               </Flex>

               <Flex style={{ marginLeft: '6px' }}>
                  {!isEmpty(state.dates) && (
                     <TextButton
                        size="sm"
                        type="ghost"
                        onClick={() => {
                           dispatch({ type: 'SET_DATE', payload: [] })
                           localStorage.removeItem('serving_size')
                        }}
                     >
                        Clear Selections
                     </TextButton>
                  )}
               </Flex>
            </Flex>
            <Flex container alignItems="center">
               <Form.Toggle
                  name="add_permanently"
                  value={state.plans.isPermanent}
                  onChange={() => dispatch({ type: 'TOGGLE_PERMANENT' })}
               >
                  Add Permanently
               </Form.Toggle>
               <Tooltip identifier="listing_menu_section_plans_add_permanently" />
            </Flex>
         </Flex>
         {isEmpty(state.dates) && (
            <Text as="h3">Select a date to view plans.</Text>
         )}
         {isEmpty(state.dates) && loading && <InlineLoader />}
         <Flex container justifyContent="space-between" alignItems="center">
            <Text as="helpText" style={{ marginBottom: '0em' }}>
               {selectedRows.length > 0 &&
                  `${selectedRows.length} ${
                     selectedRows.length == 1 ? 'plan' : 'plans'
                  } selected`}
            </Text>
            {state && !loading && subscriptionOccurences?.aggregate?.count > 0 && (
               <ButtonGroup align="left">
                  <TextButton
                     type="ghost"
                     size="sm"
                     onClick={() => tableRef.current.table.clearHeaderFilter()}
                  >
                     Clear Filters
                  </TextButton>
               </ButtonGroup>
            )}
         </Flex>
         <Spacer size="10px" />
         {state && !loading && subscriptionOccurences?.aggregate?.count > 0 && (
            <ReactTabulator
               ref={tableRef}
               columns={[selectionColumn, ...columns]}
               selectableCheck={() => true}
               rowSelected={handleRowSelection}
               rowDeselected={handleRowDeselection}
               data={subscriptionOccurences.nodes}
               selectableCheck={handleRowValidation}
               options={{
                  ...tableOptions,
                  reactiveData: true,
                  selectable: true,
                  groupBy:
                     'subscription.itemCount.serving.subscriptionTitle.title',
               }}
            />
         )}
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
      </Wrapper>
   )
}
export default PlansSection

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

const Wrapper = styled.main`
   padding: 0 16px;
`
const CrossBox = ({ removeSelectedPlans }) => {
   return (
      <Checkbox
         id="label"
         checked={false}
         onChange={removeSelectedPlans}
         isAllSelected={false}
      />
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
