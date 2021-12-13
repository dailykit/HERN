import { useSubscription } from '@apollo/react-hooks'
import React, { useRef, useState, useImperativeHandle, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { COLLECTION_PRODUCTS } from '../../Query'
import {
   Text,
   Spacer,
   Dropdown,
   Checkbox,
   ButtonGroup,
   TextButton,
   useTunnel,
   Flex,
   Tunnels,
   Tunnel,
} from '@dailykit/ui'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { StyledGroupBy } from './styled'
import { MenuProduct } from '../../../../../apps/subscription/views/Listings/Menu/MenuProductTable/BulkActionTunnel'
import { BrandManager } from './BulkActionTunnel'

const LiveMenu = () => {
   const [CollectionProducts, setCollectionProducts] = React.useState([])
   const { id } = useParams()
   const tableRef = useRef()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(3)
   const [checked, setChecked] = useState(false) //me
   const [selectedRows, setSelectedRows] = React.useState([])
   const { loading } = useSubscription(COLLECTION_PRODUCTS, {
      variables: { brandId: parseInt(id) },
      onSubscriptionData: data => {
         const result = data.subscriptionData.data.products.map(product => {
            return {
               id: product.id,
               name: product.name,
               price: product.price,
               category:
                  product?.collection_categories[0]?.collection_productCategory
                     ?.productCategoryName || 'Not in Menu',
               specificPrice:
                  product?.productPrice_brand_locations[0]?.specificPrice ||
                  'Not set',
               specificDiscount:
                  product?.productPrice_brand_locations[0]?.specificDiscount ||
                  'Not set',
               isPublished:
                  product?.productPrice_brand_locations[0]?.isPublished ||
                  'Not set',
               isAvailable:
                  product?.productPrice_brand_locations[0]?.isAvailable ||
                  false,
               brandLocationId:
                  product?.productPrice_brand_locations[0]?.id || 'Not set',
            }
         })
         setCollectionProducts(result)
      },
   })
   console.log('products', CollectionProducts)

   const groupByOptions = [{ id: 1, title: 'Category', payLoad: 'category' }]
   const columns = [
      {
         title: 'Id',
         field: 'id',
      },

      {
         title: 'Product Name',
         field: 'name',
      },

      {
         title: 'Basic Price',
         field: 'price',
      },
      {
         title: 'Specific Price',
         field: 'specificPrice',
      },
      {
         title: 'Specific Discount',
         field: 'specificDiscount',
      },
      {
         title: 'Availability',
         field: 'isAvailable',
      },
      {
         title: 'Published',
         field: 'isPublished',
      },
   ]
   useEffect(() => {}, [])

   const handleRowSelection = ({ _row }) => {
      const rowData = _row.getData()
      const lastPersistence = localStorage.getItem(
         'selected-rows-id_brand-manager_table'
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
         'selected-rows-id_brand-manager_table',
         JSON.stringify(newData)
      )
   }
   const handleRowDeselection = ({ _row }) => {
      const data = _row.getData()
      const lastPersistence = localStorage.getItem(
         'selected-rows-id_brand-manager_table'
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
         'selected-rows-id_brand-manager_table',
         JSON.stringify(newLastPersistenceParse)
      )
   }
   const tableLoaded = () => {
      const productGroup = localStorage.getItem(
         'tabulator-brand-manager_table-groupBy'
      )
      const productGroupParse =
         productGroup !== undefined &&
         productGroup !== null &&
         productGroup.length !== 0
            ? JSON.parse(productGroup)
            : null
      tableRef.current.table.setGroupBy(
         !!productGroupParse && productGroupParse.length > 0
            ? ['category', ...productGroupParse]
            : 'category'
      )
      tableRef.current.table.setGroupHeader(function (
         value,
         count,
         data1,
         group
      ) {
         let newHeader
         switch (group._group.field) {
            case 'category':
               newHeader = 'Category'
               break

            default:
               break
         }
         return `${newHeader} - ${value} || ${count} Products `
      })

      const selectedRowsId =
         localStorage.getItem('selected-rows-id_brand-manager_table') || '[]'
      if (JSON.parse(selectedRowsId).length > 0) {
         tableRef.current.table.selectRow(JSON.parse(selectedRowsId))
         let newArr = []
         JSON.parse(selectedRowsId).forEach(rowID => {
            const newFind = CollectionProducts.find(
               option => option.id == rowID
            )
            newArr = [...newArr, newFind]
         })
         setSelectedRows(newArr)
      } else {
         setSelectedRows([])
      }
   }
   const removeSelectedProducts = () => {
      setChecked({ checked: false })
      setSelectedRows([])
      tableRef.current.table.deselectRow()
      localStorage.setItem(
         'selected-rows-id_brand-manager_table',
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
            'selected-rows-id_brand-manager_table',
            JSON.stringify(multipleRowData.map(row => row.id))
         )
      } else {
         tableRef.current.table.deselectRow()
         setSelectedRows([])
         console.log('second', selectedRows)

         localStorage.setItem(
            'selected-rows-id_brand-manager_table',
            JSON.stringify([])
         )
      }
   }

   const handleGroupBy = option => {
      tableRef.current.table.setGroupBy(['label', ...option])
   }
   const selectionColumn =
      selectedRows.length > 0 && selectedRows.length < CollectionProducts.length
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
   const removeSelectedRow = id => {
      tableRef.current.table.deselectRow(id)
   }
   console.log('table ref', tableRef)
   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="full">
               <BrandManager
                  close={closeTunnel}
                  selectedRows={selectedRows}
                  removeSelectedRow={removeSelectedRow}
                  setSelectedRows={setSelectedRows}
               />
            </Tunnel>
         </Tunnels>
         <ActionBar
            title="Product"
            groupByOptions={groupByOptions}
            selectedRows={selectedRows}
            handleGroupBy={handleGroupBy}
            openTunnel={openTunnel}
         />
         <ReactTabulator
            columns={[selectionColumn, ...columns]}
            dataLoaded={tableLoaded}
            data={CollectionProducts}
            ref={tableRef}
            selectableCheck={() => true}
            rowSelected={handleRowSelection}
            rowDeselected={handleRowDeselection}
            options={{
               ...options,
               persistenceID: 'brand_manager_table',
               reactiveData: true,
            }}
         />
      </>
   )
}

export default LiveMenu

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
const options = {
   cellVertAlign: 'middle',
   autoResize: true,
   virtualDomBuffer: 20,
   placeholder: 'No Data Available',
   index: 'id',
   persistence: true,
   persistenceMode: 'local',
   selectablePersistence: true,
   persistence: {
      group: false,
      sort: true, //persist column sorting
      filter: true, //persist filter sorting
      page: true, //persist page
      columns: true, //persist columns
   },
   layout: 'fitDataStretch',
   resizableColumns: true,
   movableColumns: true,
   tooltips: true,
   downloadDataFormatter: data => data,
   downloadReady: (fileContents, blob) => blob,
}
const ActionBar = ({
   title,
   selectedRows,
   openTunnel,
   groupByOptions,
   handleGroupBy,
}) => {
   const selectedOption = option => {
      localStorage.setItem(
         `tabulator-brand-manager_table-groupBy`,
         JSON.stringify(option.map(val => val.payload))
      )
      const newOptions = option.map(x => x.payload)
      handleGroupBy(newOptions)
   }
   const searchedOption = option => console.log(option)
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

            <StyledGroupBy>
               <Spacer size="5px" xAxis />
               <Text as="text1">Group By:</Text>
               <Spacer size="5px" xAxis />
               <Dropdown
                  type="multi"
                  variant="revamp"
                  disabled={true}
                  options={groupByOptions}
                  searchedOption={() => {}}
                  selectedOption={selectedOption}
                  typeName="groupBy"
               />
            </StyledGroupBy>
         </Flex>
      </>
   )
}
