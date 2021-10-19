import React, {
   forwardRef,
   useEffect,
   useImperativeHandle,
   useState,
} from 'react'
import {
   ComboButton,
   Flex,
   IconButton,
   RadioGroup,
   Spacer,
   Text,
   TextButton,
   Tunnel,
   Tunnels,
   useTunnel,
   ButtonGroup,
   Dropdown,
   Checkbox,
   HorizontalTabs,
   HorizontalTab,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
   DropdownButton,
} from '@dailykit/ui'
// third party imports
import { useTranslation } from 'react-i18next'
// shared dir imports
import {
   InlineLoader,
   Tooltip,
   InsightDashboard,
   Banner,
} from '../../../../../shared/components'
import { useTabs, useTooltip } from '../../../../../shared/providers'
// local imports
import { AddIcon } from '../../../assets/icons'
import { ResponsiveFlex } from '../styled'
import {
   ProductTypeTunnel,
   BulkActionsTunnel,
   ProductOptionsBulkAction,
} from './tunnels'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { PRODUCTS, PRODUCT_OPTION, PRODUCT_OPTIONS } from '../../../graphql'
import { toast } from 'react-toastify'
import { get_env, logger } from '../../../../../shared/utils'
import tableOptions from '../tableOption'
import { DeleteIcon } from '../../../../../shared/assets/icons'
import FilterIcon from '../../../assets/icons/Filter'
import { ModifiersProvider } from './context/modifier'
import { PublishIcon, UnPublishIcon } from '../../../assets/icons'
import CreateProduct from '../../../../../shared/CreateUtils/Product/createProduct'
const address = 'apps.menu.views.listings.productslisting.'

//currencies
const currency = {
   USD: '$',
   INR: '₹',
   EUR: '€',
}

const ProductsListing = () => {
   const { t } = useTranslation()
   const { tab, addTab } = useTabs()
   const { tooltip } = useTooltip()

   const tableRef = React.useRef()
   const tableRefPO = React.useRef()
   const [view, setView] = React.useState('simple')
   const [tunnels, openTunnel, closeTunnel] = useTunnel(3)

   const [selectedRows, setSelectedRows] = React.useState([])
   const [isProductOptionTableVisible, setIsProductOptionTableVisible] =
      React.useState(false)
   const options = [
      { id: 'simple', title: 'Simple' },
      { id: 'customizable', title: t(address.concat('customizable')) },
      { id: 'combo', title: t(address.concat('combo')) },
   ]

   React.useEffect(() => {
      if (!tab) {
         addTab('Products', `/products/products`)
      }
   }, [tab, addTab])

   const { data: { products = [] } = {}, loading } = useSubscription(
      PRODUCTS.LIST,
      {
         variables: {
            where: {
               type: { _eq: view },
               isArchived: { _eq: false },
            },
         },
      }
   )

   const [deleteProduct] = useMutation(PRODUCTS.DELETE, {
      onCompleted: () => {
         toast.success('Product deleted!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   // Handler
   const deleteProductHandler = product => {
      if (
         window.confirm(
            `Are you sure you want to delete product - ${product.name}?`
         )
      ) {
         deleteProduct({
            variables: {
               id: product.id,
            },
         })
      }
   }

   const removeSelectedRow = id => {
      tableRef.current.removeSelectedRow(id)
   }

   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="full">
               {isProductOptionTableVisible ? (
                  <ModifiersProvider>
                     <ProductOptionsBulkAction
                        close={closeTunnel}
                        selectedRows={selectedRows}
                        removeSelectedRow={removeSelectedRow}
                        setSelectedRows={setSelectedRows}
                     />
                  </ModifiersProvider>
               ) : (
                  <BulkActionsTunnel
                     close={closeTunnel}
                     selectedRows={selectedRows}
                     removeSelectedRow={removeSelectedRow}
                     setSelectedRows={setSelectedRows}
                  />
               )}
            </Tunnel>
            <Tunnel layer={2}></Tunnel>
            <Tunnel layer={3}>
               <CreateProduct close={closeTunnel} />
            </Tunnel>
         </Tunnels>

         <ResponsiveFlex maxWidth="1280px" margin="0 auto">
            <Flex
               container
               alignItems="center"
               justifyContent="space-between"
               height="72px"
               padding="7px"
            >
               <Banner id="products-app-products-listing-top" />
               <Flex container alignItems="center">
                  <Text as="h2" style={{ marginBottom: 0 }}>
                     {t(address.concat('products'))}
                  </Text>
                  <Tooltip identifier="products_list_heading" />
               </Flex>
               <ComboButton type="solid" onClick={() => openTunnel(3)}>
                  <AddIcon color="#fff" size={24} /> Add Product
               </ComboButton>
            </Flex>

            <Flex style={{ marginLeft: 8 }}>
               <RadioGroup
                  options={options}
                  active={view}
                  onChange={option => {
                     setView(option.id)
                     setIsProductOptionTableVisible(false)
                  }}
               />
            </Flex>
            <Spacer size="16px" />
            {loading ? (
               <InlineLoader />
            ) : (
               <DataTable
                  ref={tableRef}
                  data={products}
                  addTab={addTab}
                  openTunnel={openTunnel}
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                  deleteProductHandler={deleteProductHandler}
                  t={t}
                  view={view}
                  setIsProductOptionTableVisible={
                     setIsProductOptionTableVisible
                  }
                  isProductOptionTableVisible={isProductOptionTableVisible}
               />
            )}
            <Banner id="products-app-products-listing-bottom" />
         </ResponsiveFlex>
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

class DataTable extends React.Component {
   constructor(props) {
      super(props)
      this.state = {
         checked: false,
         groups: [
            localStorage.getItem(
               `tabulator-${this.props.view}_product_table-group`
            ),
         ],
      }
      this.handleMultipleRowSelection =
         this.handleMultipleRowSelection.bind(this)
      this.tableRef = React.createRef()
      this.optionTableRef = React.createRef()
      this.handleRowSelection = this.handleRowSelection.bind(this)
   }

   handleMultipleRowSelection = () => {
      this.setState(
         {
            checked: !this.state.checked,
         },
         () => {
            if (this.state.checked) {
               this.tableRef.current.table.selectRow('active')
               let multipleRowData =
                  this.tableRef.current.table.getSelectedData()
               this.props.setSelectedRows(multipleRowData)
               localStorage.setItem(
                  'selected-rows-id_product_table',
                  JSON.stringify(multipleRowData.map(row => row.id))
               )
            } else {
               this.tableRef.current.table.deselectRow()
               this.props.setSelectedRows([])

               localStorage.setItem(
                  'selected-rows-id_product_table',
                  JSON.stringify([])
               )
            }
         }
      )
   }

   newColumns = [
      {
         title: 'Product ID',
         field: 'id',
         headerFilter: true,
         frozen: true,
         hozAlign: 'center',
      },
      {
         title: this.props.t(address.concat('product name')),
         field: 'name',
         width: 400,
         frozen: true,
         headerFilter: true,
         formatter: reactFormatter(<ProductName />),
         cellClick: (e, cell) => {
            const { name, id } = cell._cell.row.data
            this.props.addTab(name, `/products/products/${id}`)
         },
         cssClass: 'colHover',
         resizable: 'true',
         minWidth: 100,
         maxWidth: 500,
      },
      {
         title: `Price (${
            currency[get_env('REACT_APP_CURRENCY')] ||
            get_env('REACT_APP_CURRENCY')
         })`,
         field: 'price',
         hozAlign: 'right',
      },
      {
         title: 'Actions',
         headerFilter: false,
         headerSort: false,
         hozAlign: 'center',
         download: false,
         frozen: true,
         headerHozAlign: 'center',
         formatter: reactFormatter(
            <DeleteProduct onDelete={this.props.deleteProductHandler} />
         ),

         width: 80,
      },
   ]
   groupByOptions = [{ id: 1, title: 'Published', payload: 'isPublished' }]

   handleRowSelection = ({ _row }) => {
      this.props.setSelectedRows(prevState => [...prevState, _row.getData()])

      let newData = [...this.props.selectedRows.map(row => row.id)]
      localStorage.setItem(
         'selected-rows-id_product_table',
         JSON.stringify(newData)
      )
   }

   handleDeSelection = ({ _row }) => {
      const data = _row.getData()
      this.props.setSelectedRows(prevState =>
         prevState.filter(row => row.id != data.id)
      )
      localStorage.setItem(
         'selected-rows-id_product_table',
         JSON.stringify(this.props.selectedRows.map(row => row.id))
      )
   }

   removeSelectedRow = id => {
      if (this.props.isProductOptionTableVisible) {
         this.optionTableRef.current.removeSelectedRow(id)
         return
      }
      this.tableRef.current.table.deselectRow(id)
   }

   handleGroupBy = value => {
      this.setState(
         {
            groups: value,
         },
         () => {
            this.tableRef.current.table.setGroupBy(this.state.groups)
         }
      )
   }

   clearHeaderFilter = () => {
      this.tableRef.current.table.clearHeaderFilter()
   }

   selectRows = () => {
      const productGroup = localStorage.getItem(
         `tabulator-${this.props.view}_product_table-group`
      )
      const productGroupParse =
         productGroup !== undefined &&
         productGroup !== null &&
         productGroup.length !== 0
            ? JSON.parse(productGroup)
            : null
      this.tableRef.current.table.setGroupBy(
         productGroupParse !== null && productGroupParse.length > 0
            ? productGroupParse
            : []
      )

      this.tableRef.current.table.setGroupHeader(function (
         value,
         count,
         data1,
         group
      ) {
         let newHeader
         switch (group._group.field) {
            case 'isPublished':
               newHeader = 'Publish'
               break
            default:
               break
         }
         return `${newHeader} - ${value} || ${count} Product`
      })

      const selectedRowsId =
         localStorage.getItem('selected-rows-id_product_table') || '[]'
      this.tableRef.current.table.selectRow(JSON.parse(selectedRowsId))
      if (JSON.parse(selectedRowsId).length > 0) {
         let newArr = []
         JSON.parse(selectedRowsId).forEach(x => {
            const newFind = this.props.data.find(y => y.id == x)
            newArr = [...newArr, newFind]
         })
         this.props.setSelectedRows(newArr)
      }
   }

   removeSelectedProducts = () => {
      this.setState({ checked: false })
      this.props.setSelectedRows([])
      this.tableRef.current.table.deselectRow()
      localStorage.setItem('selected-rows-id_product_table', JSON.stringify([]))
   }

   downloadCsvData = () => {
      this.tableRef.current.table.download(
         'csv',
         `${this.props.view}_product_table.csv`
      )
   }

   downloadPdfData = () => {
      this.tableRef.current.table.downloadToTab(
         'pdf',
         `${this.props.view}_product_table.pdf`
      )
   }

   downloadXlsxData = () => {
      this.tableRef.current.table.download(
         'xlsx',
         `${this.props.view}_product_table.xlsx`
      )
   }

   clearProductPersistence = () => {
      localStorage.removeItem('tabulator-simple_product_table-columns')
      localStorage.removeItem('tabulator-simple_product_table-sort')
      localStorage.removeItem('tabulator-simple_product_table-filter')
      localStorage.removeItem('tabulator-simple_product_table-group')
      this.removeSelectedProducts()
   }

   productType = `${this.props.view} product`

   clearCustomizeProductPersistence = () => {
      if (this.productType === 'customizable product') {
         localStorage.removeItem('tabulator-customizable_product_table-columns')
         localStorage.removeItem('tabulator-customizable_product_table-sort')
         localStorage.removeItem('tabulator-customizable_product_table-filter')
         localStorage.removeItem('tabulator-customizable_product_table-group')
      } else {
         localStorage.removeItem('tabulator-combo_product_table-columns')
         localStorage.removeItem('tabulator-combo_product_table-sort')
         localStorage.removeItem('tabulator-combo_product_table-filter')
         localStorage.removeItem('tabulator-combo_product_table-group')
      }
      this.removeSelectedProducts()
   }

   render() {
      const selectionColumn =
         this.props.selectedRows.length > 0 &&
         this.props.selectedRows.length < this.props.data.length
            ? {
                 formatter: 'rowSelection',
                 titleFormatter: reactFormatter(
                    <CrossBox
                       removeSelectedProducts={this.removeSelectedProducts}
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
                       checked={this.state.checked}
                       handleMultipleRowSelection={
                          this.handleMultipleRowSelection
                       }
                    />
                 ),
                 align: 'center',
                 hozAlign: 'center',
                 width: 20,
                 headerSort: false,
                 frozen: true,
              }
      return (
         <>
            {this.props.view == 'simple' && (
               <HorizontalTabs
                  onChange={index =>
                     index
                        ? this.props.setIsProductOptionTableVisible(true)
                        : this.props.setIsProductOptionTableVisible(false)
                  }
               >
                  <HorizontalTabList>
                     <HorizontalTab>Simple</HorizontalTab>
                     <HorizontalTab>By Product Options</HorizontalTab>
                  </HorizontalTabList>
                  <HorizontalTabPanels>
                     <HorizontalTabPanel>
                        {!this.props.isProductOptionTableVisible && (
                           <>
                              <ActionBar
                                 title={`${this.props.view} product`}
                                 downloadPdfData={this.downloadPdfData}
                                 downloadCsvData={this.downloadCsvData}
                                 downloadXlsxData={this.downloadXlsxData}
                                 clearPersistence={this.clearProductPersistence}
                                 groupByOptions={this.groupByOptions}
                                 selectedRows={this.props.selectedRows}
                                 openTunnel={this.props.openTunnel}
                                 handleGroupBy={this.handleGroupBy}
                                 clearHeaderFilter={this.clearHeaderFilter}
                              />
                              <Spacer size="30px" />

                              <ReactTabulator
                                 ref={this.tableRef}
                                 dataLoaded={this.selectRows}
                                 columns={[selectionColumn, ...this.newColumns]}
                                 data={this.props.data}
                                 selectableCheck={() => true}
                                 rowSelected={this.handleRowSelection}
                                 rowDeselected={this.handleDeSelection}
                                 options={{
                                    ...tableOptions,
                                    persistenceID: `${this.props.view}_product_table`,
                                    reactiveData: true,
                                 }}
                                 data-custom-attr="test-custom-attribute"
                                 className="custom-css-class"
                              />
                           </>
                        )}
                     </HorizontalTabPanel>
                     <HorizontalTabPanel>
                        {this.props.isProductOptionTableVisible && (
                           <ProductOptions
                              ref={this.optionTableRef}
                              deleteProductHandler={
                                 this.props.deleteProductHandler
                              }
                              openTunnel={this.props.openTunnel}
                              selectedRows={this.props.selectedRows}
                              setSelectedRows={this.props.setSelectedRows}
                           />
                        )}
                     </HorizontalTabPanel>
                  </HorizontalTabPanels>
               </HorizontalTabs>
            )}
            {this.props.view !== 'simple' && (
               <>
                  <Flex style={{ margin: '0px 7px' }}>
                     <ActionBar
                        title={`${this.props.view} product`}
                        downloadPdfData={this.downloadPdfData}
                        downloadCsvData={this.downloadCsvData}
                        downloadXlsxData={this.downloadXlsxData}
                        clearPersistence={this.clearCustomizeProductPersistence}
                        groupByOptions={this.groupByOptions}
                        selectedRows={this.props.selectedRows}
                        openTunnel={this.props.openTunnel}
                        handleGroupBy={this.handleGroupBy}
                        clearHeaderFilter={this.clearHeaderFilter}
                     />
                     <Spacer size="30px" />

                     <ReactTabulator
                        ref={this.tableRef}
                        dataLoaded={this.selectRows}
                        columns={[selectionColumn, ...this.newColumns]}
                        data={this.props.data}
                        selectableCheck={() => true}
                        rowSelected={this.handleRowSelection}
                        rowDeselected={this.handleDeSelection}
                        options={{
                           ...tableOptions,
                           persistenceID: `${this.props.view}_product_table`,
                           reactiveData: true,
                        }}
                        data-custom-attr="test-custom-attribute"
                        className="custom-css-class"
                     />
                  </Flex>
               </>
            )}
         </>
      )
   }
}

function DeleteProduct({ cell, onDelete }) {
   const product = cell.getData()

   return (
      <IconButton type="ghost" onClick={() => onDelete(product)}>
         <DeleteIcon color="#FF5A52" />
      </IconButton>
   )
}

function ProductName({ cell, addTab }) {
   const data = cell.getData()
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
                     width: '230px',
                     whiteSpace: 'nowrap',
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                  }}
               >
                  {cell._cell.value}
               </p>
            </Flex>

            <Flex
               container
               width="100%"
               justifyContent="flex-end"
               alignItems="center"
            >
               <IconButton
                  type="ghost"
                  title={data.isPublished ? 'Published' : 'Unpublished'}
               >
                  {data.isPublished ? <PublishIcon /> : <UnPublishIcon />}
               </IconButton>
            </Flex>
         </Flex>
      </>
   )
}
const ActionBar = ({
   downloadPdfData,
   downloadCsvData,
   downloadXlsxData,
   title,
   groupByOptions,
   selectedRows,
   openTunnel,
   handleGroupBy,
   clearHeaderFilter,
   clearPersistence,
}) => {
   const defaultIDs = () => {
      let arr = []
      const productGroup = localStorage.getItem(
         `tabulator-${title}_table-group`
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
         `tabulator-${title}_table-group`,
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
            justifyContent="space-between"
         >
            <Flex
               container
               as="header"
               width="35%"
               style={{ marginLeft: 0 }}
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
            <Flex
               container
               as="header"
               width="71%"
               alignItems="center"
               justifyContent="space-around"
            >
               <Flex
                  container
                  as="header"
                  width="87%"
                  alignItems="center"
                  justifyContent="flex-end"
               >
                  <TextButton
                     onClick={() => {
                        clearPersistence()
                     }}
                     type="ghost"
                     size="sm"
                  >
                     Clear Persistence
                  </TextButton>
                  <Spacer size="15px" xAxis />
                  <DropdownButton title="Download" width="150px">
                     <DropdownButton.Options>
                        <DropdownButton.Option
                           onClick={() => downloadCsvData()}
                        >
                           CSV
                        </DropdownButton.Option>
                        <DropdownButton.Option
                           onClick={() => downloadPdfData()}
                        >
                           PDF
                        </DropdownButton.Option>
                        <DropdownButton.Option
                           onClick={() => downloadXlsxData()}
                        >
                           XLSX
                        </DropdownButton.Option>
                     </DropdownButton.Options>
                  </DropdownButton>
                  <Spacer size="15px" xAxis />
                  <Text as="text1" style={{ fontSize: 14 }}>
                     Group By:
                  </Text>
                  <Spacer size="5px" xAxis />
                  <Dropdown
                     type="multi"
                     variant="revamp"
                     disabled={true}
                     defaultIds={defaultIDs()}
                     options={groupByOptions}
                     searchedOption={searchedOption}
                     selectedOption={selectedOption}
                     typeName="cuisine"
                  />
               </Flex>
               <Flex
                  container
                  as="header"
                  // width="30%"
                  alignItems="center"
                  justifyContent="flex-end"
               >
                  {/* <Text as="text1">Apply Filter:</Text>
                  <Spacer size="5px" xAxis />
                  <IconButton
                     type="ghost"
                     size="sm"
                     onClick={() => openTunnel(2)}
                  >
                     <FilterIcon />
                  </IconButton> */}
                  <ButtonGroup align="left">
                     <TextButton
                        style={{ padding: 7 }}
                        type="ghost"
                        size="sm"
                        onClick={() => clearHeaderFilter()}
                     >
                        Clear Filters
                     </TextButton>
                  </ButtonGroup>
               </Flex>
            </Flex>
         </Flex>
      </>
   )
}
export default ProductsListing

const ProductOptions = forwardRef(
   ({ openTunnel, setSelectedRows, selectedRows }, ref) => {
      const tableRef = React.useRef()
      const [productOptionsList, setProductOptionsList] = useState([])
      const [checked, setChecked] = useState(false) //me
      const { addTab, tab } = useTabs() //me

      const [deleteProductOption] = useMutation(PRODUCT_OPTION.DELETE, {
         onCompleted: () => {
            toast.success('Product deleted!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      })

      // Handler
      const deleteProductOptionHandler = product => {
         if (
            window.confirm(
               `Are you sure you want to delete product - ${product.name}?`
            )
         ) {
            deleteProductOption({
               variables: {
                  id: product.id,
               },
            })
         }
         console.log(product.id)
      }

      const groupByOptions = [
         {
            id: 1,
            title: 'Product Name',
            payload: 'name',
         },
         {
            id: 2,
            title: 'Quantity',
            payload: 'quantity',
         },
      ]
      const { loading } = useSubscription(PRODUCT_OPTIONS, {
         onSubscriptionData: ({ subscriptionData }) => {
            const newOptions = subscriptionData.data.productOptions.map(x => {
               const productName = x.product.name
               x.name = productName
               return x
            })
            setProductOptionsList(newOptions)
         },
      })
      useEffect(() => {}, [])
      const columns = [
         {
            title: 'Label',
            field: 'label',
            visible: true,
            frozen: true,
            headerFilter: 'true',
            headerHozAlign: 'center',
         },
         {
            title: 'Product Name',
            field: 'name',
            width: 350,
            frozen: true,
            headerFilter: true,
            headerHozAlign: 'center',
            formatter: reactFormatter(<ProductName />),
            cellClick: (e, cell) => {
               const { name, id } = cell._cell.row.data
               addTab(name, `/products/products/${id}`)
            },
            cssClass: 'colHover',
            resizable: 'true',
            minWidth: 100,
            maxWidth: 500,
         },
         {
            title: 'Actions',
            headerSort: false,
            headerFilter: false,
            hozAlign: 'center',
            download: false,
            frozen: true,
            headerHozAlign: 'center',
            formatter: reactFormatter(
               <DeleteProduct onDelete={deleteProductOptionHandler} />
            ),
            width: 80,
         },
         {
            title: 'Position',
            field: 'position',
            headerFilter: true,
            hozAlign: 'left',
            headerHozAlign: 'right',
            minWidth: 100,
            width: 200,
         },
         {
            title: 'Price',
            field: 'price',
            headerFilter: true,
            hozAlign: 'right',
            resizable: false,
            headerHozAlign: 'right',
            width: 150,
         },
         {
            title: 'Quantity',
            field: 'quantity',
            headerFilter: true,
            hozAlign: 'right',
            headerHozAlign: 'right',
            width: 200,
         },
         {
            title: 'Type',
            field: 'type',
            headerFilter: true,
            hozAlign: 'left',
            headerHozAlign: 'right',
            width: 80,
         },
      ]
      const clearHeaderFilter = () => {
         tableRef.current.table.clearHeaderFilter()
      }

      const handleGroupBy = option => {
         tableRef.current.table.setGroupBy(['label', ...option])
      }
      const handleRowSelection = ({ _row }) => {
         const rowData = _row.getData()
         const lastPersistence = localStorage.getItem(
            'selected-rows-id_product_option_table'
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
            'selected-rows-id_product_option_table',
            JSON.stringify(newData)
         )
      }
      const handleRowDeselection = ({ _row }) => {
         const data = _row.getData()
         const lastPersistence = localStorage.getItem(
            'selected-rows-id_product_option_table'
         )
         const lastPersistenceParse =
            lastPersistence !== undefined &&
            lastPersistence !== null &&
            lastPersistence.length !== 0
               ? JSON.parse(lastPersistence)
               : []
         setSelectedRows(prevState =>
            prevState.filter(row => row.id !== data.id)
         )
         const newLastPersistenceParse = lastPersistenceParse.filter(
            id => id !== data.id
         )
         localStorage.setItem(
            'selected-rows-id_product_option_table',
            JSON.stringify(newLastPersistenceParse)
         )
      }
      useImperativeHandle(ref, () => ({
         removeSelectedRow(id) {
            tableRef.current.table.deselectRow(id)
         },
      }))

      const tableLoaded = () => {
         const productOptionsGroup = localStorage.getItem(
            'tabulator_product_options_groupBy'
         )
         const productOptionsGroupParse =
            productOptionsGroup !== undefined &&
            productOptionsGroup !== null &&
            productOptionsGroup.length !== 0
               ? JSON.parse(productOptionsGroup)
               : null
         tableRef.current.table.setGroupBy(
            !!productOptionsGroupParse && productOptionsGroupParse.length > 0
               ? ['label', ...productOptionsGroupParse]
               : 'label'
         )
         tableRef.current.table.setGroupHeader(function (
            value,
            count,
            data1,
            group
         ) {
            let newHeader
            switch (group._group.field) {
               case 'name':
                  newHeader = 'Product Name'
                  break
               case 'label':
                  newHeader = 'Label'
                  break
               case 'quantity':
                  newHeader = 'Quantity'
                  break
               default:
                  break
            }
            return `${newHeader} - ${value} || ${count} Product`
         })

         const selectedRowsId =
            localStorage.getItem('selected-rows-id_product_option_table') ||
            '[]'
         if (JSON.parse(selectedRowsId).length > 0) {
            tableRef.current.table.selectRow(JSON.parse(selectedRowsId))
            let newArr = []
            JSON.parse(selectedRowsId).forEach(rowID => {
               const newFind = productOptionsList.find(
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
            'selected-rows-id_product_option_table',
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
               'selected-rows-id_product_option-table',
               JSON.stringify(multipleRowData.map(row => row.id))
            )
         } else {
            tableRef.current.table.deselectRow()
            setSelectedRows([])
            console.log('second', selectedRows)

            localStorage.setItem(
               'selected-rows-id_product_option-table',
               JSON.stringify([])
            )
         }
      }

      const clearProductOptionPersistence = () => {
         localStorage.removeItem('tabulator-product_option_table-columns')
         localStorage.removeItem('tabulator-product_option_table-sort')
         localStorage.removeItem('tabulator-product_option_table-filter')
         localStorage.removeItem('tabulator-Product_Option_table-group')
         removeSelectedProducts()
      }
      const downloadCsvData = () => {
         tableRef.current.table.download('csv', 'product_option_table.csv')
      }

      const downloadPdfData = () => {
         tableRef.current.table.downloadToTab('pdf', 'product_option_table.pdf')
      }

      const downloadXlsxData = () => {
         tableRef.current.table.download('xlsx', 'product_option_table.xlsx')
      }
      const selectionColumn =
         selectedRows.length > 0 &&
         selectedRows.length < productOptionsList.length //
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
      return (
         <>
            <ActionBar
               downloadPdfData={downloadPdfData}
               downloadCsvData={downloadCsvData}
               downloadXlsxData={downloadXlsxData}
               clearPersistence={clearProductOptionPersistence}
               title="product option"
               groupByOptions={groupByOptions}
               selectedRows={selectedRows}
               openTunnel={openTunnel}
               // defaultIDs={defaultIDs()}
               handleGroupBy={handleGroupBy}
               clearHeaderFilter={clearHeaderFilter}
            />
            <Spacer size="30px" />

            <ReactTabulator
               ref={tableRef}
               dataLoaded={tableLoaded}
               columns={[selectionColumn, ...columns]}
               data={productOptionsList}
               selectableCheck={() => true}
               rowSelected={handleRowSelection}
               rowDeselected={handleRowDeselection}
               options={{
                  ...tableOptions,
                  persistenceID: 'product_option_table',
                  reactiveData: true,
               }}
               data-custom-attr="test-custom-attribute"
               className="custom-css-class"
            />
            <InsightDashboard
               appTitle="Products App"
               moduleTitle="Product Listing"
               showInTunnel={false}
            />
         </>
      )
   }
)
