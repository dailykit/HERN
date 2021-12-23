import { useMutation, useSubscription } from '@apollo/react-hooks'
import React, { useRef, useState, useImperativeHandle, useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { COLLECTION_PRODUCTS, PRODUCT_PRICE_BRAND_LOCATION } from '../../Query'
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
   Form,
} from '@dailykit/ui'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { StyledGroupBy, StyledTitle } from './styled'
import { BrandManager } from './BulkActionTunnel'
import { logger } from '../../../../utils'
import { toast } from 'react-toastify'
import SpecificPriceTunnel from './BulkActionTunnel/Tunnel/specificPriceTunnel'

const LiveMenu = () => {
   const [CollectionProducts, setCollectionProducts] = React.useState([])
   const tableRef = useRef()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(3)
   const [checked, setChecked] = useState(false) //me
   const [selectedRows, setSelectedRows] = React.useState([])
   const [popupTunnels, openPopupTunnel, closePopupTunnel] = useTunnel(1)
   const [selectedRowData, setSelectedRowData] = React.useState(null)
   const location = useLocation()

   console.log('location:::', location)

   const { loading } = useSubscription(COLLECTION_PRODUCTS, {
      variables: {
         brandId: location.state[0].brandId,
         brandId1: location.state[0].brandId,
         brand_locationId: location.state[0].brandLocationId
            ? location.state[0].brandLocationId
            : null,
      },
      onSubscriptionData: data => {
         const result = data.subscriptionData.data.products.map(product => {
            const specialPrice = !product?.productPrice_brand_locations.length
               ? product.price
               : product?.productPrice_brand_locations[0]?.specificPrice !==
                 null
               ? product?.productPrice_brand_locations[0]?.specificPrice
               : product.price *
                 (1 +
                    product?.productPrice_brand_locations[0]
                       ?.markupOnStandardPriceInPercentage /
                       100)
            // console.log('specialPrice', specialPrice)
            // console.log('whole data', product?.productPrice_brand_locations)
            return {
               id: product.id,
               name: product.name,
               brandId: location.state[0].brandId,
               brand_locationId: location.state[0].brandLocationId
                  ? location.state[0].brandLocationId
                  : null,
               category:
                  product?.collection_categories[0]?.collection_productCategory
                     ?.productCategoryName || 'Not in Menu',

               specificPrice: specialPrice,
               specificDiscount:
                  !product?.productPrice_brand_locations.length ||
                  product?.productPrice_brand_locations[0]?.specificDiscount ===
                     null
                     ? 'Not Set'
                     : product?.productPrice_brand_locations[0]
                          ?.specificDiscount,
               isPublished: !product?.productPrice_brand_locations.length
                  ? true
                  : product?.productPrice_brand_locations[0]?.isPublished,
               isAvailable: !product?.productPrice_brand_locations.length
                  ? true
                  : product?.productPrice_brand_locations[0]?.isAvailable,
            }
         })
         setCollectionProducts(result)
      },
   })
   // console.log('products', CollectionProducts)

   const groupByOptions = [
      { id: 1, title: 'Published', payload: 'isPublished' },
      { id: 2, title: 'Available', payload: 'isAvailable' },
   ]

   const [updateBrandProduct] = useMutation(PRODUCT_PRICE_BRAND_LOCATION, {
      onCompleted: () => toast.success('Successfully updated!'),
      onError: error => {
         toast.error('Failed to update, please try again!')
         logger(error)
      },
   })

   const columns = [
      {
         title: 'Id',
         field: 'id',
         headerFilter: true,
         frozen: true,
      },

      {
         title: 'Product Name',
         field: 'name',
         headerFilter: true,
         frozen: true,
      },
      {
         title: 'Specific Price',
         field: 'specificPrice',
         headerFilter: true,
         formatter: reactFormatter(
            <SpecificPrice
               openPopupTunnel={openPopupTunnel}
               setSelectedRowData={setSelectedRowData}
            />
         ),
      },
      {
         title: 'Specific Discount',
         field: 'specificDiscount',
         headerFilter: true,
      },
      {
         title: 'Availability',
         field: 'isAvailable',
         formatter: reactFormatter(
            <AvailableToggleStatus update={updateBrandProduct} />
         ),
      },
      {
         title: 'Published',
         field: 'isPublished',
         formatter: reactFormatter(
            <PublishedToggleStatus update={updateBrandProduct} />
         ),
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
            case 'isPublished':
               newHeader = 'Published'
               break
            case 'isAvailable':
               newHeader = 'Available'
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
      tableRef.current.table.setGroupBy(['category', ...option])
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
   // console.log('table ref', tableRef)
   return (
      <>
         <StyledTitle>
            <Text as="h2">
               We are changing product settings for{' '}
               {location.state[0].brandName} brand{' '}
            </Text>
         </StyledTitle>
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
         <Tunnels tunnels={popupTunnels}>
            <Tunnel layer={1} size="sm">
               <SpecificPriceTunnel
                  closeTunnel={closePopupTunnel}
                  selectedRowData={selectedRowData}
               />
            </Tunnel>
         </Tunnels>
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
   layout: 'fitColumns',
   resizableColumns: true,
   movableColumns: true,
   pagination: 'local',
   paginationSize: 8,
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
   const defaultIDs = () => {
      let arr = []
      const productGroup = localStorage.getItem(
         `tabulator-brand-manager_table-groupBy`
      )
      const productGroupParse =
         productGroup !== undefined &&
         productGroup !== null &&
         productGroup.length !== 0
            ? JSON.parse(productGroup)
            : null
      if (productGroupParse !== null) {
         productGroupParse.forEach(x => {
            const foundGroup = groupByOptions.find(y => y.payload == x)
            arr.push(foundGroup.id)
         })
      }
      return arr.length == 0 ? [] : arr
   }
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
            style={{ marginLeft: '1em', paddingBottom: '2em', gap: '4em' }}
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
                  defaultIds={defaultIDs()}
                  options={groupByOptions}
                  searchedOption={searchedOption}
                  selectedOption={selectedOption}
                  typeName="groupBy"
               />
            </StyledGroupBy>
         </Flex>
      </>
   )
}
const AvailableToggleStatus = ({ update, cell }) => {
   const [checkedAvailable, setCheckedAvailable] = React.useState(
      cell.getData().isAvailable
   )
   // console.log('toggle data', cell.getData().name, cell.getData())
   const toggleStatus = ({
      Available,
      BrandId,
      ProductId,
      brand_locationId,
   }) => {
      update({
         variables: {
            objects: {
               isAvailable: Available,
               brandId: BrandId,
               productId: ProductId,
               // brand_locationId,
            },
            constraint: 'productPrice_brand_location_brandId_productId_key',
            update_columns: ['isAvailable'],
         },
      })
      // console.log('mutation data on available', Available, BrandId, ProductId)
   }
   React.useEffect(() => {
      if (checkedAvailable !== cell.getData().isAvailable) {
         toggleStatus({
            Available: checkedAvailable,
            BrandId: cell.getData().brandId,
            ProductId: cell.getData().id,
            // brand_locationId: cell.getData().brand_locationId,
         })
         // console.log('mutation data on available', {
         //    Available: checkedAvailable,
         // })
      }
   }, [checkedAvailable])

   return (
      <Form.Toggle
         name={`Available-${cell.getData().name}`}
         onChange={() => setCheckedAvailable(!checkedAvailable)}
         value={checkedAvailable}
      />
   )
}
const PublishedToggleStatus = ({ update, cell }) => {
   const [checkedPublished, setCheckedPublished] = React.useState(
      cell.getData().isPublished
   )
   // console.log('toggle data', cell.getData().name, cell.getData())
   const toggleStatus = ({
      isPublished,
      brandId,
      productId,
      brand_locationId,
   }) => {
      const objects = {
         isPublished,
         brandId,
         productId,
         // brand_locationId,
      }
      update({
         variables: {
            objects,
            constraint: 'productPrice_brand_location_brandId_productId_key',
            update_columns: ['isPublished'],
         },
      })
   }
   React.useEffect(() => {
      if (checkedPublished !== cell.getData().isPublished) {
         toggleStatus({
            isPublished: checkedPublished,
            brandId: cell.getData().brandId,
            productId: cell.getData().id,
            // brand_locationId: cell.getData().brand_locationId,
         })
         // console.log('mutation data on published', {
         //    Published: checkedPublished,
         // })
      }
   }, [checkedPublished])

   return (
      <Form.Toggle
         name={`Published-${cell.getData().name}`}
         onChange={() => setCheckedPublished(!checkedPublished)}
         value={checkedPublished}
      />
   )
}
function SpecificPrice({ cell, addTab, openPopupTunnel, setSelectedRowData }) {
   const openTunnelButton = () => {
      const data = cell.getData()
      // console.log('open tunnel data', data)
      setSelectedRowData(data)
      openPopupTunnel(1)
   }
   return (
      <>
         <Flex
            container
            width="100%"
            justifyContent="space-between"
            alignItems="center"
         >
            <Flex
               container
               width="auto"
               justifyContent="flex-end"
               alignItems="center"
            >
               <p
                  style={{
                     width: 'auto',
                     whiteSpace: 'nowrap',
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                  }}
               >
                  {cell._cell.value}
               </p>
            </Flex>
            <Flex container justifyContent="space-between" alignItems="center">
               <TextButton
                  type="ghost"
                  onClick={() => openTunnelButton()}
                  style={{ height: '42px' }}
                  title="Click to modify the row data"
               >
                  Customize
               </TextButton>
            </Flex>
         </Flex>
      </>
   )
}
