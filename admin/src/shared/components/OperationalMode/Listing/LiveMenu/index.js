import { useMutation, useSubscription } from '@apollo/react-hooks'
import React, { useRef, useState, useImperativeHandle, useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
   COLLECTION_PRODUCTS,
   COLLECTION_PRODUCT_OPTIONS,
   PRODUCT_PRICE_BRAND_LOCATION,
   RESET_BRAND_MANAGER,
} from '../../Query'
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
   HorizontalTabs,
   HorizontalTabList,
   HorizontalTab,
   HorizontalTabPanels,
   HorizontalTabPanel,
} from '@dailykit/ui'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { StyledGroupBy, StyledTitle } from './styled'
import { BrandManager, BrandManagerProductOption } from './BulkActionTunnel'
import { logger } from '../../../../utils'
import { toast } from 'react-toastify'
import SpecificPriceTunnel from './BulkActionTunnel/Tunnel/specificPriceTunnel'
import { useWindowSize } from '../../../../hooks'

const LiveMenu = () => {
   const location = useLocation()
   const { width } = useWindowSize()

   console.log('location:::', location)
   return (
      <>
         <Flex>
            <StyledTitle>
               {width > 768 ? (
                  <Text as="h2">
                     We are changing product settings for{' '}
                     {location.state[0].brandName} brand{' '}
                  </Text>
               ) : (
                  <Text as="h2">{location.state[0].brandName} Brand </Text>
               )}
            </StyledTitle>
            <Flex>
               <HorizontalTabs>
                  <HorizontalTabList
                     style={
                        width > 500
                           ? {
                                justifyContent: 'center',
                             }
                           : { marginLeft: '1em', justifyContent: 'flex-start' }
                     }
                  >
                     <HorizontalTab>Product</HorizontalTab>
                     <HorizontalTab>By Product Option</HorizontalTab>
                  </HorizontalTabList>
                  <HorizontalTabPanels>
                     <HorizontalTabPanel>
                        <LiveMenuProductTable location={location} />
                     </HorizontalTabPanel>
                     <HorizontalTabPanel>
                        <LiveMenuProductOptionTable location={location} />
                     </HorizontalTabPanel>
                  </HorizontalTabPanels>
               </HorizontalTabs>
            </Flex>
         </Flex>
      </>
   )
}
const LiveMenuProductTable = ({ location }) => {
   const [CollectionProducts, setCollectionProducts] = React.useState([])
   const tableRef = useRef()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(3)
   const [checked, setChecked] = useState(false) //me
   const [selectedRows, setSelectedRows] = React.useState([])
   const [popupTunnels, openPopupTunnel, closePopupTunnel] = useTunnel(1)
   const [selectedRowData, setSelectedRowData] = React.useState(null)
   const { width } = useWindowSize()
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
   const [resetProduct] = useMutation(RESET_BRAND_MANAGER, {
      onCompleted: () => {
         toast.success('Product has Reset!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const resetHandler = product => {
      if (
         window.confirm(
            `Are you sure you want to reset product - ${product.name}?`
         )
      ) {
         console.log('productId', product.id)
         resetProduct({
            variables: {
               where: {
                  brandId: { _eq: product.brandId },
                  brand_locationId: { _is_null: true },
                  productId: { _eq: product.id },
               },
            },
         })
      }
   }
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
         horAlign: 'center',
      },

      {
         title: 'Product Name',
         field: 'name',
         width: 350,
         headerFilter: true,
         // frozen: true,
         cssClass: 'colHover',
         resizable: 'true',
         minWidth: 100,
         maxWidth: 500,
      },
      {
         title: 'Specific Price',
         field: 'specificPrice',
         width: 190,
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
         title: 'Published',
         field: 'isPublished',
         formatter: reactFormatter(
            <PublishedToggleStatus update={updateBrandProduct} />
         ),
      },
      {
         title: 'Availability',
         field: 'isAvailable',
         formatter: reactFormatter(
            <AvailableToggleStatus update={updateBrandProduct} />
         ),
      },
      {
         title: 'Reset Row',
         formatter: reactFormatter(<ResetProduct onReset={resetHandler} />),
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
         'tabulator_brand_manager_product_groupBy'
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
         <ActionBar
            title="Product"
            groupByKeyName="brand_manager_product"
            groupByOptions={groupByOptions}
            selectedRows={selectedRows}
            handleGroupBy={handleGroupBy}
            openTunnel={openTunnel}
            width={width}
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
            <Tunnel layer={1} size="md">
               <SpecificPriceTunnel
                  closeTunnel={closePopupTunnel}
                  selectedRowData={selectedRowData}
               />
            </Tunnel>
         </Tunnels>
      </>
   )
}
const LiveMenuProductOptionTable = ({ location }) => {
   const [CollectionProducts, setCollectionProducts] = React.useState([])
   const tableRef = useRef()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(3)
   const [checked, setChecked] = useState(false) //me
   const [selectedRows, setSelectedRows] = React.useState([])
   const [popupTunnels, openPopupTunnel, closePopupTunnel] = useTunnel(1)
   const [selectedRowData, setSelectedRowData] = React.useState(null)
   const { width } = useWindowSize()
   const { loading } = useSubscription(COLLECTION_PRODUCT_OPTIONS, {
      variables: {
         brandId: location.state[0].brandId,
         brandId1: location.state[0].brandId,
         brand_locationId: null,
      },
      onSubscriptionData: data => {
         const result = data.subscriptionData.data.productOptions.map(
            productOptions => {
               const specialPrice = !productOptions
                  ?.productPrice_brand_locations.length
                  ? productOptions.price
                  : productOptions?.productPrice_brand_locations[0]
                       ?.specificPrice !== null
                  ? productOptions?.productPrice_brand_locations[0]
                       ?.specificPrice
                  : productOptions.price *
                    (1 +
                       productOptions?.productPrice_brand_locations[0]
                          ?.markupOnStandardPriceInPercentage /
                          100)
               // console.log('specialPrice', specialPrice)
               // console.log(
               //    'whole data',
               //    productOptions?.productPrice_brand_locations
               // )
               return {
                  id: productOptions.id,
                  name: productOptions.product.name,
                  brandId: location.state[0].brandId,
                  brand_locationId: location.state[0].brandLocationId
                     ? location.state[0].brandLocationId
                     : null,
                  category:
                     productOptions?.product?.collection_categories[0]
                        ?.collection_productCategory?.productCategoryName ||
                     'Not in Menu',

                  specificPrice: specialPrice,
                  specificDiscount:
                     !productOptions?.productPrice_brand_locations.length ||
                     productOptions?.productPrice_brand_locations[0]
                        ?.specificDiscount === null
                        ? 'Not Set'
                        : productOptions?.productPrice_brand_locations[0]
                             ?.specificDiscount,
                  isPublished: !productOptions?.productPrice_brand_locations
                     .length
                     ? true
                     : productOptions?.productPrice_brand_locations[0]
                          ?.isPublished,
                  isAvailable: !productOptions?.productPrice_brand_locations
                     .length
                     ? true
                     : productOptions?.productPrice_brand_locations[0]
                          ?.isAvailable,
               }
            }
         )
         setCollectionProducts(result)
      },
   })
   // console.log('products', CollectionProducts)

   const [resetProduct] = useMutation(RESET_BRAND_MANAGER, {
      onCompleted: () => {
         toast.success('Product has Reset!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const resetHandler = product => {
      if (
         window.confirm(
            `Are you sure you want to reset product - ${product.name}?`
         )
      ) {
         console.log('productId', product.id)
         resetProduct({
            variables: {
               where: {
                  brandId: { _eq: product.brandId },
                  brand_locationId: { _is_null: true },
                  productOptionId: { _eq: product.id },
               },
            },
         })
      }
   }
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
         horAlign: 'center',
         // cellClick: function (e, cell) {
         //    console.log('cell clicked ', e, cell)
         // },
      },

      {
         title: 'Product Name',
         field: 'name',
         width: 350,
         headerFilter: true,
         // frozen: true,
         cssClass: 'colHover',
         resizable: 'true',
         minWidth: 100,
         maxWidth: 500,
      },
      {
         title: 'Specific Price',
         field: 'specificPrice',
         width: 190,
         headerFilter: true,
         formatter: reactFormatter(
            <SpecificPrice
               openPopupTunnel={openPopupTunnel}
               setSelectedRowData={setSelectedRowData}
               check={'productOptionId'}
            />
         ),
      },
      {
         title: 'Specific Discount',
         field: 'specificDiscount',
         headerFilter: true,
      },
      {
         title: 'Published',
         field: 'isPublished',
         formatter: reactFormatter(
            <PublishedToggleStatus
               update={updateBrandProduct}
               check={'productOptionId'}
            />
         ),
      },
      {
         title: 'Availability',
         field: 'isAvailable',
         formatter: reactFormatter(
            <AvailableToggleStatus
               update={updateBrandProduct}
               check={'productOptionId'}
            />
         ),
      },
      {
         title: 'Reset Row',
         formatter: reactFormatter(<ResetProduct onReset={resetHandler} />),
      },
   ]

   useEffect(() => {}, [])

   const handleRowSelection = ({ _row }) => {
      const rowData = _row.getData()
      const lastPersistence = localStorage.getItem(
         'selected-rows-id_brand-manager-option-product_table'
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
         'selected-rows-id_brand-manager-option-product_table',
         JSON.stringify(newData)
      )
   }
   const handleRowDeselection = ({ _row }) => {
      const data = _row.getData()
      const lastPersistence = localStorage.getItem(
         'selected-rows-id_brand-manager-option-product_table'
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
         'selected-rows-id_brand-manager-option-product_table',
         JSON.stringify(newLastPersistenceParse)
      )
   }
   const tableLoaded = () => {
      const productGroup = localStorage.getItem(
         'tabulator_brand_manager_product_options_groupBy'
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
         localStorage.getItem(
            'selected-rows-id_brand-manager-option-product_table'
         ) || '[]'
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
         'selected-rows-id_brand-manager-option-product_table',
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
            'selected-rows-id_brand-manager-option-product_table',
            JSON.stringify(multipleRowData.map(row => row.id))
         )
      } else {
         tableRef.current.table.deselectRow()
         setSelectedRows([])
         console.log('second', selectedRows)

         localStorage.setItem(
            'selected-rows-id_brand-manager-option-product_table',
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
         <ActionBar
            title="Product"
            groupByKeyName="brand_manager_product_options"
            groupByOptions={groupByOptions}
            selectedRows={selectedRows}
            handleGroupBy={handleGroupBy}
            openTunnel={openTunnel}
            width={width}
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
               persistenceID: 'brand_manager_product-option_table',
               reactiveData: true,
            }}
         />
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="full">
               <BrandManagerProductOption
                  close={closeTunnel}
                  selectedRows={selectedRows}
                  removeSelectedRow={removeSelectedRow}
                  setSelectedRows={setSelectedRows}
               />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={popupTunnels}>
            <Tunnel layer={1} size="md">
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
   layout: 'fitDataStretch',
   resizableColumns: true,
   movableColumns: true,
   pagination: 'local',
   paginationSize: 8,
   downloadDataFormatter: data => data,
   downloadReady: (fileContents, blob) => blob,
}
const ActionBar = ({
   title,
   groupByKeyName,
   selectedRows,
   openTunnel,
   groupByOptions,
   handleGroupBy,
   width,
}) => {
   const defaultIDs = () => {
      let arr = []
      const productGroup = localStorage.getItem(
         `tabulator_${groupByKeyName}_groupBy`
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
         `tabulator_${groupByKeyName}_groupBy`,
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
            style={
               width > 500
                  ? { paddingBottom: '2em', gap: '3em' }
                  : { paddingBottom: '2em' }
            }
            alignItems={width > 500 ? 'center' : 'flex-start'}
            justifyContent="flex-start"
            flexDirection={width > 500 ? 'row' : 'column'}
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
                  style={
                     width > 500
                        ? {
                             padding: '7px 20px 8px 20px',
                          }
                        : { padding: 0 }
                  }
               >
                  APPLY BULK ACTIONS
               </TextButton>
            </ButtonGroup>

            <StyledGroupBy>
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
const AvailableToggleStatus = ({ cell, update, check }) => {
   const [checkedAvailable, setCheckedAvailable] = React.useState(
      cell.getData().isAvailable
   )
   // console.log('toggle data', cell.getData().name, cell.getData())
   const toggleStatus = ({ Available, BrandId, Id }) => {
      if (check === 'productOptionId') {
         update({
            variables: {
               objects: {
                  isAvailable: Available,
                  brandId: BrandId,
                  productOptionId: Id,
                  // brand_locationId,
               },
               constraint:
                  'productPrice_brand_location_productOptionId_brandId_key',
               update_columns: ['isAvailable'],
            },
         })
      } else {
         update({
            variables: {
               objects: {
                  isAvailable: Available,
                  brandId: BrandId,
                  productId: Id,
                  // brand_locationId,
               },
               constraint: 'productPrice_brand_location_brandId_productId_key',
               update_columns: ['isAvailable'],
            },
         })
      }
      // console.log('mutation data on available', Available, BrandId, ProductId)
   }

   React.useEffect(() => {
      if (checkedAvailable !== cell.getData().isAvailable) {
         toggleStatus({
            Available: checkedAvailable,
            BrandId: cell.getData().brandId,
            Id: cell.getData().id,
            // brand_locationId: cell.getData().brand_locationId,
         })
         // console.log('mutation data on available', {
         //    Available: checkedAvailable,
         // })
      }
   }, [checkedAvailable])

   return (
      <Form.Toggle
         name={`Available-${cell.getData().id}`}
         onChange={() => setCheckedAvailable(!checkedAvailable)}
         value={checkedAvailable}
      />
   )
}
function PublishedToggleStatus({ cell, update, check }) {
   const [checkedPublished, setCheckedPublished] = React.useState(
      cell.getData().isPublished
   )
   const toggleStatus = ({ Published, BrandId, Id }) => {
      if (check === 'productOptionId') {
         console.log('product option id', cell.getData())
         update({
            variables: {
               objects: {
                  isPublished: Published,
                  brandId: BrandId,
                  productOptionId: Id,
               },
               constraint:
                  'productPrice_brand_location_productOptionId_brandId_key',
               update_columns: ['isPublished'],
            },
         })
      } else {
         update({
            variables: {
               objects: {
                  isPublished: Published,
                  brandId: BrandId,
                  productId: Id,
               },
               constraint: 'productPrice_brand_location_brandId_productId_key',
               update_columns: ['isPublished'],
            },
         })
      }
   }
   React.useEffect(() => {
      if (checkedPublished !== cell.getData().isPublished) {
         toggleStatus({
            Published: checkedPublished,
            BrandId: cell.getData().brandId,
            Id: cell.getData().id,
         })
         console.log('mutation data on published', cell.getData().id)
      }
   }, [checkedPublished])

   return (
      <Form.Toggle
         name={`Published-${cell.getData().id}`}
         onChange={() => setCheckedPublished(!checkedPublished)}
         value={checkedPublished}
      />
   )
}
function SpecificPrice({ cell, openPopupTunnel, setSelectedRowData, check }) {
   const openTunnelButton = () => {
      const data = { cellData: cell.getData(), specificId: check }
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
               width="100%"
               justifyContent="flex-end"
               alignItems="center"
            >
               <p
                  style={{
                     width: '100%',
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
                  title="Click to modify row data"
               >
                  Customize
               </TextButton>
            </Flex>
         </Flex>
      </>
   )
}
function ResetProduct({ cell, onReset }) {
   const product = cell.getData()
   return (
      <Flex container justifyContent="space-between" alignItems="center">
         <TextButton
            type="ghost"
            onClick={() => onReset(product)}
            style={{ height: '42px' }}
            title="Click to reset row data"
         >
            Reset
         </TextButton>
      </Flex>
   )
}
