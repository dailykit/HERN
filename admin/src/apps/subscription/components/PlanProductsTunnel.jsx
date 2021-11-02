import React, { useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { startCase, isEmpty } from 'lodash'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { useQuery, useSubscription, useMutation } from '@apollo/react-hooks'
import {
   Form,
   Flex,
   Tunnel,
   Spacer,
   Tunnels,
   Dropdown,
   useTunnel,
   IconButton,
   TunnelHeader,
   HorizontalTab,
   HorizontalTabs,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
   ButtonGroup,
   TextButton,
   Checkbox,
   Text,
} from '@dailykit/ui'

import tableOptions from '../tableOption'
import { useTooltip } from '../../../shared/providers'
import { Banner, InlineLoader } from '../../../shared/components'
import { DeleteIcon } from '../../../shared/assets/icons'
import { currencyFmt, logger } from '../../../shared/utils'
import {
   PLAN_PRODUCTS,
   PRODUCT_CATEGORIES,
   DELETE_PLAN_PRODUCT,
   UPDATE_PLAN_PRODUCT,
   DELETE_MULTIPLE_PRODUCT,
} from '../graphql'
import { Button } from 'react-scroll'
import { AddToSubscription } from './BulkActionTunnel'

export const PlanProductsTunnel = ({ tunnel, occurenceId, subscriptionId }) => {
   const { tooltip } = useTooltip()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [remove] = useMutation(DELETE_PLAN_PRODUCT, {
      onCompleted: () => toast.success('Deleted the product successfully!'),
      onError: error => {
         toast.error('Failed to delete the product!')
         logger(error)
      },
   })
   const [selectedProduct, setSelectedProduct] = React.useState({})

   const edit = (e, cell) => {
      const data = cell.getData()
      setSelectedProduct(data)
      openTunnel(1)
   }
   const columns = React.useMemo(
      () => [
         {
            title: 'Product',
            cssClass: 'cell',
            cellClick: edit,
            headerFilter: true,
            field: 'productOption.product.name',
            headerFilterPlaceholder: 'Search products...',
            headerTooltip: column => {
               const identifier = 'product_listing_column_name'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            title: 'Label',
            field: 'productOption.label',
            headerTooltip: column => {
               const identifier = 'product_listing_column_label'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            width: 120,
            hozAlign: 'right',
            title: 'Add On Price',
            headerFilter: true,
            field: 'addOnPrice',
            headerTooltip: column => {
               const identifier = 'product_listing_column_addOnPrice'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            formatter: ({ _cell }) => currencyFmt(_cell.value),
         },
         {
            width: 120,
            hozAlign: 'right',
            title: 'Add On Label',
            headerFilter: true,
            field: 'addOnLabel',
            headerTooltip: column => {
               const identifier = 'product_listing_column_addOnLabel'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            width: 150,
            title: 'Type',
            headerFilter: true,
            field: 'productOption.type',
            headerFilterPlaceholder: 'Search label...',
            headerTooltip: column => {
               const identifier = 'product_listing_column_label'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            formatter: ({ _cell }) => startCase(_cell.value),
         },
         {
            width: 80,
            hozAlign: 'center',
            title: 'Visibility',
            formatter: 'tickCross',
            field: 'isVisible',
            headerTooltip: column => {
               const identifier = 'product_listing_column_isVisible'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            width: 80,
            hozAlign: 'center',
            title: 'Availability',
            formatter: 'tickCross',
            field: 'isAvailable',
            headerTooltip: column => {
               const identifier = 'product_listing_column_isAvailable'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            width: 80,
            hozAlign: 'center',
            title: 'Single Select',
            formatter: 'tickCross',
            field: 'isSingleSelect',
            headerTooltip: column => {
               const identifier = 'product_listing_column_isSingleSelect'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            width: 150,
            title: 'Actions',
            headerFilter: false,
            headerSort: false,
            hozAlign: 'center',
            cssClass: 'center-text',
            formatter: reactFormatter(<Delete remove={remove} />),
         },
      ],
      []
   )
   return (
      <>
         <Tunnels tunnels={tunnel.list}>
            <Tunnel layer={1} size="full">
               <TunnelHeader
                  title="Manage Menu Products"
                  close={() => tunnel.close(1)}
               />
               <Banner id="subscription-app-create-subscription-form-manage-menu-products-tunnel-top" />
               <Flex
                  overflowY="auto"
                  padding="0 16px 16px 16px"
                  height="calc(100% - 40px)"
               >
                  <Tabs>
                     <HorizontalTabList>
                        <HorizontalTab>Added to Occurence</HorizontalTab>
                        <HorizontalTab>Added to Subscription</HorizontalTab>
                     </HorizontalTabList>
                     <HorizontalTabPanels>
                        <HorizontalTabPanel>
                           <AddedToOccurence
                              columns={columns}
                              occurenceId={occurenceId}
                           />
                        </HorizontalTabPanel>
                        <HorizontalTabPanel>
                           <AddedToSubscription
                              columns={columns}
                              subscriptionId={subscriptionId}
                           />
                        </HorizontalTabPanel>
                     </HorizontalTabPanels>
                  </Tabs>
               </Flex>
               <Banner id="subscription-app-create-subscription-form-manage-menu-products-tunnel-bottom" />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer="1" size="sm">
               <EditTunnel close={closeTunnel} product={selectedProduct} />
            </Tunnel>
         </Tunnels>
      </>
   )
}

const AddedToOccurence = ({ columns, occurenceId, remove }) => {
   const tableRef = React.useRef()
   const [selectedRows, setSelectedRows] = useState([])
   const [checked, setChecked] = useState(false)
   const { loading, data: { planProducts = {} } = {} } = useSubscription(
      PLAN_PRODUCTS,
      {
         variables: {
            where: { subscriptionOccurenceId: { _eq: occurenceId } },
         },
      }
   )
   const [removeMultipleProducts] = useMutation(DELETE_MULTIPLE_PRODUCT, {
      onCompleted: () => toast.success('Deleted the product successfully!'),
      onError: error => {
         toast.error('Failed to delete the product!')
         logger(error)
      },
   })

   // delete multiple products
   const handleOnDelete = () => {
      const ids = selectedRows.map(each => each.id)
      if (
         window.confirm(
            `Are your sure you want to delete this ${selectedRows.length} product?`
         )
      ) {
         removeMultipleProducts({ variables: { _in: ids } })
         setSelectedRows([])
      }
   }

   const removeSelectedProducts = () => {
      setChecked(false)
      setSelectedRows([])
      tableRef.current.table.deselectRow()
      localStorage.setItem('selected-rows-id-occurence', JSON.stringify([]))
   }

   const handleMultipleRowSelection = () => {
      setChecked(!checked)

      if (!checked) {
         tableRef.current.table.selectRow('active')
         let multipleRowData = tableRef.current.table.getSelectedData()

         setSelectedRows(multipleRowData)
         localStorage.setItem(
            'selected-rows-id-occurence',
            JSON.stringify(multipleRowData.map(row => row.id))
         )
      } else {
         tableRef.current.table.deselectRow()
         setSelectedRows([])
         localStorage.setItem('selected-rows-id-occurence', JSON.stringify([]))
      }
   }

   const handleRowSelection = ({ _row }) => {
      const rowData = _row.getData()
      const lastPersistence = localStorage.getItem('selected-rows-id-occurence')
      const lastPersistenceParse =
         lastPersistence !== undefined &&
            lastPersistence !== null &&
            lastPersistence.length !== 0
            ? JSON.parse(lastPersistence)
            : []
      setSelectedRows(prevState => [...prevState, _row.getData()])
      let newData = [...lastPersistenceParse, rowData.id]
      localStorage.setItem(
         'selected-rows-id-occurence',
         JSON.stringify(newData)
      )
   }

   const handleRowDeselection = ({ _row }) => {
      const data = _row.getData()
      const lastPersistence = localStorage.getItem('selected-rows-id-occurence')
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
         'selected-rows-id-occurence',
         JSON.stringify(newLastPersistenceParse)
      )
   }

   //change column according to selected rows
   const selectionColumn =
      selectedRows.length > 0 && selectedRows.length < planProducts.nodes.length
         ? {
            formatter: 'rowSelection',
            titleFormatter: reactFormatter(
               <CrossBox removeSelectedProducts={removeSelectedProducts} />
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

   if (loading) return <InlineLoader />
   return (
      <div>
         <ActionBar selectedRows={selectedRows} onDelete={handleOnDelete} />
         <Spacer size="15px" />
         <ReactTabulator
            columns={[selectionColumn, ...columns]}
            ref={tableRef}
            selectableCheck={() => true}
            rowSelected={handleRowSelection}
            rowDeselected={handleRowDeselection}
            data={planProducts.nodes || []}
            options={{
               ...tableOptions,
               layout: 'fitColumns',
               groupBy: 'productCategory',
            }}
         />
      </div>
   )
}

const AddedToSubscription = ({ columns, subscriptionId }) => {
   const tableRef = React.useRef()
   const [selectedRows, setSelectedRows] = useState([])
   const [checked, setChecked] = useState(false)
   const [tunnels, openTunnel, closeTunnel] = useTunnel(3)


   const { loading, data: { planProducts = {} } = {} } = useSubscription(
      PLAN_PRODUCTS,
      {
         variables: {
            where: { subscriptionId: { _eq: subscriptionId } },
         },
      }
   )
   const [removeMultipleProducts] = useMutation(DELETE_MULTIPLE_PRODUCT, {
      onCompleted: () => toast.success('Deleted the product successfully!'),
      onError: error => {
         toast.error('Failed to delete the product!')
         logger(error)
      },
   })

   // delete multiple products
   const handleOnDelete = () => {
      const ids = selectedRows.map(each => each.id)
      if (
         window.confirm(
            `Are your sure you want to delete this ${selectedRows.length} product?`
         )
      ) {
         removeMultipleProducts({ variables: { _in: ids } })
         setSelectedRows([])
      }
   }

   const removeSelectedProducts = () => {
      setChecked(false)
      setSelectedRows([])
      tableRef.current.table.deselectRow()
      localStorage.setItem('selected-rows-id-subscription', JSON.stringify([]))
   }

   const handleMultipleRowSelection = () => {
      setChecked(!checked)
      if (!checked) {
         tableRef.current.table.selectRow('active')
         let multipleRowData = tableRef.current.table.getSelectedData()
         setSelectedRows(multipleRowData)
         localStorage.setItem(
            'selected-rows-id-subscription',
            JSON.stringify(multipleRowData.map(row => row.id))
         )
      } else {
         tableRef.current.table.deselectRow()
         setSelectedRows([])
         localStorage.setItem(
            'selected-rows-id-subscription',
            JSON.stringify([])
         )
      }
   }

   const handleRowSelection = ({ _row }) => {
      const rowData = _row.getData()
      const lastPersistence = localStorage.getItem(
         'selected-rows-id-subscription'
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
         'selected-rows-id-subscription',
         JSON.stringify(newData)
      )
   }

   const handleRowDeselection = ({ _row }) => {
      const data = _row.getData()
      const lastPersistence = localStorage.getItem(
         'selected-rows-id-subscription'
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
         'selected-rows-id-subscription',
         JSON.stringify(newLastPersistenceParse)
      )
   }
   const removeSelectedRow = () => {
      tableRef.current.table.deselectRow()

   }
   //change column according to selected rows
   const selectionColumn =
      selectedRows.length > 0 && selectedRows.length < planProducts.nodes.
         length
         ? {
            formatter: 'rowSelection',
            titleFormatter: reactFormatter(
               <CrossBox removeSelectedProducts={removeSelectedProducts} />
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

   if (loading) return <InlineLoader />
   return (
      <div>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="full">
               <AddToSubscription
                  close={closeTunnel}
                  selectedRows={selectedRows.map(row => {
                     return {
                        ...row,
                        productName: row?.productOption?.product?.name || "N/A"
                     }
                  })}
                  removeSelectedRow={removeSelectedRow}
                  setSelectedRows={setSelectedRows}
               />
            </Tunnel>
         </Tunnels>
         <ActionBar
            selectedRows={selectedRows}
            onDelete={handleOnDelete}
            openTunnel={openTunnel}
         />
         <Spacer size="15px" />
         <ReactTabulator
            columns={[selectionColumn, ...columns]}
            ref={tableRef}
            data={planProducts.nodes || []}
            selectableCheck={() => true}
            rowSelected={handleRowSelection}
            rowDeselected={handleRowDeselection}
            options={{
               ...tableOptions,
               layout: 'fitColumns',
               groupBy: 'productCategory',
            }}
         />
      </div>
   )
}

const EditTunnel = ({ close, product = {} }) => {
   const { data: { productCategories = [] } = {} } =
      useQuery(PRODUCT_CATEGORIES)
   const [updateProduct, { loading }] = useMutation(UPDATE_PLAN_PRODUCT, {
      onCompleted: () => {
         close(1)
         toast.success('Successfully updated the product!')
      },
      onError: error => {
         toast.error('Failed to update the product!')
         logger(error)
      },
   })
   const [form, setForm] = React.useState({
      addOnPrice: '',
      addOnLabel: '',
      productCategory: '',
      isVisible: false,
      isAvailable: false,
      isSingleSelect: false,
   })

   React.useEffect(() => {
      if (!isEmpty(product)) {
         setForm(existing => ({
            ...existing,
            addOnPrice: product.addOnPrice,
            addOnLabel: product.addOnLabel,
            productCategory: product.productCategory,
            isVisible: product.isVisible,
            isAvailable: product.isAvailable,
            isSingleSelect: product.isSingleSelect,
         }))
      }
   }, [])

   const update = () => {
      updateProduct({
         variables: {
            id: product.id,
            _set: { ...form, addOnPrice: Number(form.addOnPrice) },
         },
      })
   }

   const handleChange = (name, value) =>
      setForm(existing => ({ ...existing, [name]: value }))

   return (
      <>
         <TunnelHeader
            title="Edit Product"
            close={() => close(1)}
            right={{
               title: 'Save',
               isLoading: loading,
               action: () => update(),
               disabled: !form.productCategory,
            }}
         />
         <Flex
            overflowY="auto"
            padding="0 16px 16px 16px"
            height="calc(100% - 40px)"
         >
            <Form.Group>
               <Form.Label htmlFor="addOnPrice" title="addOnPrice">
                  Add On Price
               </Form.Label>
               <Form.Number
                  id="addOnPrice"
                  name="addOnPrice"
                  value={form.addOnPrice}
                  placeholder="Enter the add on price"
                  onChange={e => handleChange(e.target.name, e.target.value)}
               />
            </Form.Group>
            <Spacer size="24px" />
            <Form.Group>
               <Form.Label htmlFor="addOnLabel" title="addOnLabel">
                  Add On Label
               </Form.Label>
               <Form.Text
                  id="addOnLabel"
                  name="addOnLabel"
                  value={form.addOnLabel}
                  placeholder="Enter the add on label"
                  onChange={e => handleChange(e.target.name, e.target.value)}
               />
            </Form.Group>
            <Spacer size="24px" />
            <Form.Group>
               <Form.Toggle
                  name="isVisible"
                  onChange={() => handleChange('isVisible', !form.isVisible)}
                  value={form.isVisible}
               >
                  Visibility
               </Form.Toggle>
            </Form.Group>
            <Spacer size="24px" />
            <Form.Group>
               <Form.Toggle
                  name="isAvailable"
                  onChange={() =>
                     handleChange('isAvailable', !form.isAvailable)
                  }
                  value={form.isAvailable}
               >
                  Availablility
               </Form.Toggle>
            </Form.Group>
            <Spacer size="24px" />
            <Form.Group>
               <Form.Toggle
                  name="isSingleSelect"
                  onChange={() =>
                     handleChange('isSingleSelect', !form.isSingleSelect)
                  }
                  value={form.isSingleSelect}
               >
                  Can be added to cart only once?
               </Form.Toggle>
            </Form.Group>
            <Spacer size="24px" />
            <Dropdown
               type="single"
               searchedOption={() => { }}
               options={productCategories}
               placeholder="search for a product category"
               selectedOption={option =>
                  setForm(existing => ({
                     ...existing,
                     productCategory: option.title,
                  }))
               }
            />
         </Flex>
      </>
   )
}

const Delete = ({ cell, remove }) => {
   const removeItem = () => {
      const { id, productOption = {} } = cell.getData()
      if (
         window.confirm(
            `Are your sure you want to delete this ${productOption?.product.name} product?`
         )
      ) {
         remove({ variables: { id } })
      }
   }

   return (
      <IconButton size="sm" type="ghost" onClick={removeItem}>
         <DeleteIcon color="#FF5A52" />
      </IconButton>
   )
}

const Tabs = styled(HorizontalTabs)`
   > [data-reach-tab-panels] {
      > [data-reach-tab-panel] {
         padding: 16px 0;
      }
   }
`
const ActionBar = props => {
   const { selectedRows, onDelete, openTunnel } = props
   return (
      <>
         <Flex
            container
            as="header"
            width="100%"
            justifyContent="space-between"
         >
            <Flex
               container
               as="header"
               width="25%"
               alignItems="center"
               justifyContent="space-between"
            >
               <Text as="subtitle">
                  {selectedRows.length == 0
                     ? 'No product'
                     : selectedRows.length == 1
                        ? `${selectedRows.length} product`
                        : `${selectedRows.length} products`}{' '}
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
            <Flex>
               <ButtonGroup align="left">
                  <TextButton
                     type="ghost"
                     size="sm"
                     disabled={selectedRows.length === 0 ? true : false}
                     onClick={() => onDelete()}
                  >
                     Delete Selected Items
                  </TextButton>
               </ButtonGroup>
            </Flex>
         </Flex>
      </>
   )
}

const CrossBox = ({ removeSelectedProducts }) => {
   return (
      <Checkbox
         id="label"
         checked={false}
         onChange={removeSelectedProducts}
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
