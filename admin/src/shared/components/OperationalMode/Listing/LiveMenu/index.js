import { useMutation, useSubscription } from '@apollo/react-hooks'
import React, { useRef, useState, useImperativeHandle, useEffect } from 'react'
import { useParams } from 'react-router-dom'
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
import { StyledTitle } from './styled'
import { BrandManager, BrandManagerProductOption } from './BulkActionTunnel'
import { logger } from '../../../../utils'
import { toast } from 'react-toastify'
import SpecificPriceTunnel from './BulkActionTunnel/Tunnel/specificPriceTunnel'
import { useWindowSize } from '../../../../hooks'
import { InlineLoader } from '../../..'
import { CloneBrandLocationOperation } from '../../../DashboardRightPanel/tunnels/cloneBrandLocationOperation'

const LiveMenu = () => {
   const brandDetail = useParams()
   const { width } = useWindowSize()

   console.log('brandDetail:::', brandDetail)
   return (
      <Flex>
         <StyledTitle>
            {width > 768 ? (
               <Text as="h2">
                  We are changing product settings for {brandDetail.brandName}{' '}
                  brand{' '}
               </Text>
            ) : (
               <Text as="h2">{brandDetail.brandName} Brand </Text>
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
                     <LiveMenuProductTable brandDetail={brandDetail} />
                  </HorizontalTabPanel>
                  <HorizontalTabPanel>
                     <LiveMenuProductOptionTable brandDetail={brandDetail} />
                  </HorizontalTabPanel>
               </HorizontalTabPanels>
            </HorizontalTabs>
         </Flex>
      </Flex>
   )
}
const LiveMenuProductTable = ({ brandDetail }) => {
   const [CollectionProducts, setCollectionProducts] = React.useState([])
   const tableRef = useRef()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(3)
   const [checked, setChecked] = useState(false)
   const [selectedRows, setSelectedRows] = React.useState([])
   const [popupTunnels, openPopupTunnel, closePopupTunnel] = useTunnel(1)
   const [selectedRowData, setSelectedRowData] = React.useState(null)
   const { width } = useWindowSize()
   const [isLoading, setIsLoading] = React.useState(true)

   //subscription
   const { loading, error } = useSubscription(COLLECTION_PRODUCTS, {
      variables: {
         brandId: brandDetail.brandId,
         brandId1: brandDetail.brandId,
         brand_locationId: brandDetail.brandLocationId
            ? brandDetail.brandLocationId
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
                 parseFloat(
                    1 +
                       product?.productPrice_brand_locations[0]
                          ?.markupOnStandardPriceInPercentage /
                          100
                 ).toFixed(2)
            // console.log('specialPrice', specialPrice)
            // console.log('whole data', product?.productPrice_brand_locations)
            return {
               id: product.id,
               name: product.name,
               brandId: brandDetail.brandId,
               brand_locationId: brandDetail.brandLocationId
                  ? brandDetail.brandLocationId
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
         setIsLoading(false)
      },
   })
   console.log('products', CollectionProducts)

   //mutation
   const [resetProduct] = useMutation(RESET_BRAND_MANAGER, {
      onCompleted: () => {
         toast.success('Product has Reset!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const [updateBrandProduct] = useMutation(PRODUCT_PRICE_BRAND_LOCATION, {
      onCompleted: () => toast.success('Successfully updated!'),
      onError: error => {
         toast.error('Failed to update, please try again!')
         logger(error)
      },
   })

   //handler
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

   const columns = [
      {
         title: 'Id',
         field: 'id',
         headerFilter: true,
         frozen: true,
         hozAlign: 'center',
         width: 80,
      },

      {
         title: 'Product Name',
         field: 'name',
         width: 350,
         headerFilter: true,
         // hozAlign: 'center',
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
         hozAlign: 'center',
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
         hozAlign: 'center',
         headerFilter: true,
      },
      {
         title: 'Product Category',
         field: 'category',
         headerFilter: true,
         hozAlign: 'center',
         width: 150,
      },
      {
         title: 'Published',
         field: 'isPublished',
         hozAlign: 'center',
         formatter: reactFormatter(
            <PublishedToggleStatus update={updateBrandProduct} />
         ),
      },
      {
         title: 'Availability',
         field: 'isAvailable',
         hozAlign: 'center',
         formatter: reactFormatter(
            <AvailableToggleStatus update={updateBrandProduct} />
         ),
      },
      {
         title: 'Reset Row',
         hozAlign: 'center',
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
   const clearHeaderFilter = () => {
      tableRef.current.table.clearHeaderFilter()
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

   if (isLoading) return <InlineLoader />
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
            clearHeaderFilter={clearHeaderFilter}
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
            <Tunnel layer={2} size="md">
               <CloneBrandLocationOperation
                  closeTunnel={() => closeTunnel(2)}
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
const LiveMenuProductOptionTable = ({ brandDetail }) => {
   const [CollectionProducts, setCollectionProducts] = React.useState([])
   const tableRef = useRef()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(3)
   const [checked, setChecked] = useState(false) //me
   const [selectedRows, setSelectedRows] = React.useState([])
   const [popupTunnels, openPopupTunnel, closePopupTunnel] = useTunnel(1)
   const [selectedRowData, setSelectedRowData] = React.useState(null)
   const { width } = useWindowSize()
   const [isLoading, setIsLoading] = React.useState(true)

   //subscription
   const { loading, error } = useSubscription(COLLECTION_PRODUCT_OPTIONS, {
      variables: {
         brandId: brandDetail.brandId,
         brandId1: brandDetail.brandId,
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
                    parseFloat(
                       1 +
                          productOptions?.productPrice_brand_locations[0]
                             ?.markupOnStandardPriceInPercentage /
                             100
                    ).toFixed(2)
               // console.log('specialPrice', specialPrice)
               // console.log(
               //    'whole data',
               //    productOptions?.productPrice_brand_locations
               // )
               return {
                  id: productOptions.id,
                  label: productOptions.label,
                  name: productOptions.product.name,
                  brandId: brandDetail.brandId,
                  brand_locationId: brandDetail.brandLocationId
                     ? brandDetail.brandLocationId
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
         setIsLoading(false)
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
         width: 80,
         hozAlign: 'center',
         // cellClick: function (e, cell) {
         //    console.log('cell clicked ', e, cell)
         // },
      },
      {
         title: 'Label',
         field: 'label',
         headerFilter: true,
         frozen: true,
         width: 120,
         hozAlign: 'center',
         // cellClick: function (e, cell) {
         //    console.log('cell clicked ', e, cell)
         // },
      },
      {
         title: 'Product Name',
         field: 'name',
         width: 350,
         // hozAlign: 'center',
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
         hozAlign: 'center',
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
         hozAlign: 'center',
      },
      {
         title: 'Product Category',
         field: 'category',
         headerFilter: true,
         hozAlign: 'center',
         width: 150,
      },
      {
         title: 'Published',
         field: 'isPublished',
         hozAlign: 'center',
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
         hozAlign: 'center',
         formatter: reactFormatter(
            <AvailableToggleStatus
               update={updateBrandProduct}
               check={'productOptionId'}
            />
         ),
      },
      {
         title: 'Reset Row',
         hozAlign: 'center',
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
   const clearHeaderFilter = () => {
      tableRef.current.table.clearHeaderFilter()
   }
   // console.log('table ref', tableRef)

   if (isLoading) return <InlineLoader />
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
            clearHeaderFilter={clearHeaderFilter}
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
   tooltips: true,
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
   clearHeaderFilter,
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
      <div>
         <Flex
            container
            height="80px"
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
            <Flex
               container
               as="header"
               width="45%"
               alignItems="center"
               justifyContent="space-between"
            >
               <Text as="subtitle">
                  {selectedRows.length == 0
                     ? `No ${title}`
                     : selectedRows.length == 1
                     ? `${selectedRows.length} ${title}`
                     : `${selectedRows.length} ${title}s`}{' '}
                  selected
               </Text>
               <ButtonGroup align="left" style={{ alignItems: 'center' }}>
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
                  <TextButton type="outline" onClick={() => openTunnel(2)}>
                     Clone
                  </TextButton>
               </ButtonGroup>
            </Flex>
            <Flex
               container
               as="header"
               width="75%"
               alignItems="center"
               justifyContent="space-around"
            >
               <Flex
                  container
                  as="header"
                  width="80%"
                  alignItems="center"
                  justifyContent="flex-end"
               >
                  <Spacer size="15px" xAxis />
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
               </Flex>
               <Flex
                  container
                  as="header"
                  width="20%"
                  alignItems="center"
                  justifyContent="flex-end"
               >
                  <ButtonGroup align="left">
                     <TextButton
                        type="ghost"
                        size="sm"
                        onClick={() => clearHeaderFilter()}
                     >
                        Clear All Filter
                     </TextButton>
                  </ButtonGroup>
               </Flex>
            </Flex>
         </Flex>
      </div>
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
