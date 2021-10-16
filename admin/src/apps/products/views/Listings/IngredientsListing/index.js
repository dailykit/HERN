import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import {
   ComboButton,
   Flex,
   IconButton,
   Spacer,
   Text,
   TextButton,
   ButtonGroup,
   Dropdown,
   Tunnel,
   Tunnels,
   useTunnel,
   Checkbox,
   DropdownButton,
   Filler,
} from '@dailykit/ui'
import * as moment from 'moment'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
   Banner,
   ErrorState,
   InlineLoader,
   Tooltip,
   InsightDashboard,
} from '../../../../../shared/components'
import FilterIcon from '../../../assets/icons/Filter'

import { useTooltip, useTabs } from '../../../../../shared/providers'
import { logger, randomSuffix } from '../../../../../shared/utils'
import {
   AddIcon,
   DeleteIcon,
   PublishIcon,
   UnPublishIcon,
} from '../../../assets/icons'
import { DELETE_INGREDIENTS, S_INGREDIENTS } from '../../../graphql'
import Count from '../../../utils/countFormatter'
import tableOptions from '../tableOption'
import { ResponsiveFlex } from '../styled'
import { BulkActionsTunnel, ApplyFilterTunnel } from './tunnels'
import CreateIngredient from '../../../../../shared/CreateUtils/Ingredient/CreateIngredient'
const address = 'apps.products.views.listings.ingredientslisting.'

const IngredientsListing = () => {
   const { t } = useTranslation()
   const { addTab, tab } = useTabs()
   const [selectedRows, setSelectedRows] = React.useState([])
   const [tunnels, openTunnel, closeTunnel, visible] = useTunnel(2)
   const [ingredientTunnels, openIngredientTunnel, closeIngredientTunnel] =
      useTunnel(1)

   const dataTableRef = React.useRef()
   const [ingredientNew, setIngredientsNew] = React.useState([])

   const { loading, error } = useSubscription(S_INGREDIENTS, {
      onSubscriptionData: ({ subscriptionData }) => {
         const newOption = subscriptionData.data.ingredients.map(x => {
            const count1 = x.ingredientProcessings_aggregate.aggregate.count
            x.ingredientProcessings_count = count1
            const count2 = x.ingredientSachetViews_aggregate.aggregate.count
            x.ingredientSachetViews_count = count2
            return x
         })
         setIngredientsNew(newOption)
      },
   })
   // Mutations

   const [deleteIngredients] = useMutation(DELETE_INGREDIENTS, {
      onCompleted: () => {
         toast.success('Ingredient deleted!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   React.useEffect(() => {
      if (!tab) {
         addTab('Ingredients', '/products/ingredients')
      }
   }, [tab, addTab])

   const deleteIngredientHandler = ingredient => {
      if (
         window.confirm(
            `Are you sure you want to delete ingredient - ${ingredient.name}?`
         )
      ) {
         deleteIngredients({
            variables: {
               ids: [ingredient.id],
            },
         })
      }
   }
   const removeSelectedRow = id => {
      dataTableRef.current.removeSelectedRow(id)
   }
   if (loading) {
      return <InlineLoader />
   }
   if (!loading && error) {
      toast.error('Failed to fetch Ingredients!')
      logger(error)
      return <ErrorState />
   }
   if (ingredientNew.length == 0) {
      return <Filler message="ingredient not available" />
   }
   return (
      <ResponsiveFlex maxWidth="1280px" margin="0 auto">
         <Banner id="products-app-ingredients-listing-top" />
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="full">
               <BulkActionsTunnel
                  removeSelectedRow={removeSelectedRow}
                  close={closeTunnel}
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
               />
            </Tunnel>
            <Tunnel layer={2} size="lg" visible={visible}>
               <ApplyFilterTunnel close={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={ingredientTunnels}>
            <Tunnel layer={1} size="md">
               <CreateIngredient closeTunnel={closeIngredientTunnel} />
            </Tunnel>
         </Tunnels>
         <Flex
            container
            alignItems="center"
            justifyContent="space-between"
            height="72px"
         >
            <Flex container>
               <Text as="h2">Ingredients({ingredientNew.length}) </Text>
               <Tooltip identifier="ingredients_list_heading" />
            </Flex>
            <ComboButton type="solid" onClick={() => openIngredientTunnel(1)}>
               <AddIcon color="#fff" size={24} /> Add Ingredient
            </ComboButton>
         </Flex>
         {loading ? (
            <InlineLoader />
         ) : (
            <DataTable
               ref={dataTableRef}
               data={ingredientNew}
               addTab={addTab}
               openTunnel={openTunnel}
               deleteIngredientHandler={deleteIngredientHandler}
               selectedRows={selectedRows}
               setSelectedRows={setSelectedRows}
            />
         )}
         <Banner id="products-app-ingredients-listing-bottom" />
      </ResponsiveFlex>
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
const CrossBox = ({ removeSelectedIngredients }) => {
   return (
      <Checkbox
         id="label"
         checked={false}
         onChange={removeSelectedIngredients}
         isAllSelected={false}
      />
   )
}
class DataTable extends React.Component {
   constructor(props) {
      super(props)
      this.state = {
         checked: false,
         groups: [localStorage.getItem('tabulator-ingredients_table-group')],
      }
      this.handleMultipleRowSelection =
         this.handleMultipleRowSelection.bind(this)
      this.tableRef = React.createRef()
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
                  'selected-rows-id_ingredients_table',
                  JSON.stringify(multipleRowData.map(row => row.id))
               )
            } else {
               this.tableRef.current.table.deselectRow()
               this.props.setSelectedRows([])

               localStorage.setItem(
                  'selected-rows-id_ingredients_table',
                  JSON.stringify([])
               )
            }
         }
      )
   }
   columns = [
      {
         title: 'Name',
         field: 'name',
         width: 400,
         frozen: true,
         headerFilter: true,
         formatter: reactFormatter(<IngredientName />),
         cellClick: (e, cell) => {
            const { name, id } = cell._cell.row.data
            this.props.addTab(name, `/products/ingredients/${id}`)
         },
         cssClass: 'colHover',
         resizable: 'true',
         minWidth: 100,
         maxWidth: 500,
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
            <DeleteIngredient onDelete={this.props.deleteIngredientHandler} />
         ),
         width: 80,
      },
      {
         title: 'Category',
         field: 'category',
         headerFilter: true,
         hozAlign: 'left',
         headerHozAlign: 'right',
         minWidth: 100,
         width: 200,
      },
      {
         title: 'Processings',
         field: 'ingredientProcessings_count',
         headerFilter: false,
         hozAlign: 'right',
         width: 150,
      },
      {
         title: 'Sachets',
         field: 'ingredientSachetViews_count',
         headerFilter: false,
         hozAlign: 'right',
         width: 150,
      },
   ]

   groupByOptions = [
      { id: 1, title: 'Published', payload: 'isPublished' },
      { id: 2, title: 'Category', payload: 'category' },
   ]
   handleRowSelection = ({ _row }) => {
      this.props.setSelectedRows(prevState => [...prevState, _row.getData()])

      let newData = [...this.props.selectedRows.map(row => row.id)]
      localStorage.setItem(
         'selected-rows-id_ingredients_table',
         JSON.stringify(newData)
      )
   }
   handleDeSelection = ({ _row }) => {
      const data = _row.getData()
      this.props.setSelectedRows(prevState =>
         prevState.filter(row => row.id != data.id)
      )
      localStorage.setItem(
         'selected-rows-id_recipe_table',
         JSON.stringify(this.props.selectedRows.map(row => row.id))
      )
   }
   removeSelectedRow = id => {
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
   downloadCsvData = () => {
      this.tableRef.current.table.download('csv', 'ingredient_table.csv')
   }

   downloadPdfData = () => {
      this.tableRef.current.table.downloadToTab('pdf', 'ingredient_table.pdf')
   }

   downloadXlsxData = () => {
      this.tableRef.current.table.download('xlsx', 'ingredient_table.xlsx')
   }

   selectRows = () => {
      const ingredientsGroup = localStorage.getItem(
         'tabulator-ingredients_table-group'
      )
      const ingredientsGroupParse =
         ingredientsGroup !== undefined &&
         ingredientsGroup !== null &&
         ingredientsGroup.length !== 0
            ? JSON.parse(ingredientsGroup)
            : null
      this.tableRef.current.table.setGroupBy(
         ingredientsGroupParse !== null && ingredientsGroupParse.length > 0
            ? ingredientsGroupParse
            : []
      )

      this.tableRef.current.table.setGroupHeader(function (
         value,
         count,
         data1,
         group
      ) {
         let newHeader
         console.log('group header', group._group.field)
         switch (group._group.field) {
            case 'isPublished':
               newHeader = 'Publish'
               break
            case 'category':
               newHeader = 'Category'
               break
            default:
               break
         }
         return `${newHeader} - ${value} || ${count} Ingredients`
      })

      const selectedRowsId =
         localStorage.getItem('selected-rows-id_ingredients_table') || '[]'
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
   removeSelectedIngredients = () => {
      this.setState({ checked: false })
      this.props.setSelectedRows([])
      this.tableRef.current.table.deselectRow()
      localStorage.setItem(
         'selected-rows-id_ingredients_table',
         JSON.stringify([])
      )
   }

   clearIngredientPersistance = () => {
      localStorage.removeItem('tabulator-ingredient_table-columns')
      localStorage.removeItem('tabulator-ingredient_table-sort')
      localStorage.removeItem('tabulator-ingredient_table-filter')
      localStorage.removeItem('tabulator-ingredients_table-group')
   }

   render() {
      const selectionColumn =
         this.props.selectedRows.length > 0 &&
         this.props.selectedRows.length < this.props.data.length
            ? {
                 formatter: 'rowSelection',
                 titleFormatter: reactFormatter(
                    <CrossBox
                       removeSelectedIngredients={
                          this.removeSelectedIngredients
                       }
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
            <Spacer size="5px" />
            <ActionBar
               title="ingredient"
               downloadPdfData={this.downloadPdfData}
               downloadCsvData={this.downloadCsvData}
               downloadXlsxData={this.downloadXlsxData}
               groupByOptions={this.groupByOptions}
               selectedRows={this.props.selectedRows}
               openTunnel={this.props.openTunnel}
               handleGroupBy={this.handleGroupBy}
               clearHeaderFilter={this.clearHeaderFilter}
               clearPersistance={this.clearIngredientPersistance}
            />
            <Spacer size="30px" />
            <ReactTabulator
               ref={this.tableRef}
               dataLoaded={this.selectRows}
               columns={[selectionColumn, ...this.columns]}
               data={this.props.data}
               selectableCheck={() => true}
               rowSelected={this.handleRowSelection}
               rowDeselected={this.handleDeSelection}
               options={{
                  ...tableOptions,
                  persistenceID: 'ingredient_table',
                  reactiveData: true,
               }}
               data-custom-attr="test-custom-attribute"
               className="custom-css-class"
            />
            <InsightDashboard
               appTitle="Products App"
               moduleTitle="Ingredient Listing"
               showInTunnel={false}
            />
         </>
      )
   }
}

function DeleteIngredient({ cell, onDelete }) {
   const ingredient = cell.getData()

   return (
      <IconButton type="ghost" onClick={() => onDelete(ingredient)}>
         <DeleteIcon color="#FF5A52" />
      </IconButton>
   )
}
function IngredientName({ cell, addTab }) {
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
               <IconButton type="ghost">
                  {data.isPublished ? <PublishIcon /> : <UnPublishIcon />}
               </IconButton>
            </Flex>
         </Flex>
      </>
   )
}
function FormatDate({
   cell: {
      _cell: { value },
   },
}) {
   return <>{value ? moment(value).format('LLL') : 'NA'}</>
}

const ActionBar = ({
   title,
   downloadPdfData,
   downloadCsvData,
   downloadXlsxData,
   groupByOptions,
   selectedRows,
   openTunnel,
   handleGroupBy,
   clearHeaderFilter,
   clearPersistance,
}) => {
   const defaultIDs = () => {
      let arr = []
      const ingredientGroup = localStorage.getItem(
         'tabulator-ingredients_table-group'
      )
      const ingredientGroupParse =
         ingredientGroup !== undefined &&
         ingredientGroup !== null &&
         ingredientGroup.length !== 0
            ? JSON.parse(ingredientGroup)
            : null
      if (ingredientGroupParse !== null) {
         ingredientGroupParse.forEach(x => {
            const foundGroup = groupByOptions.find(y => y.payload == x)
            arr.push(foundGroup.id)
         })
      }
      return arr.length == 0 ? [] : arr
   }

   const selectedOption = option => {
      localStorage.setItem(
         'tabulator-ingredients_table-group',
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
               width="32%"
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
                  width="98%"
                  alignItems="center"
                  justifyContent="flex-end"
               >
                  <TextButton
                     onClick={() => {
                        clearPersistance()
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
                  <Text as="text1">Group By:</Text>
                  <Spacer size="30px" xAxis />
                  <Dropdown
                     type="multi"
                     variant="revamp"
                     disabled={true}
                     options={groupByOptions}
                     searchedOption={searchedOption}
                     selectedOption={selectedOption}
                     defaultIds={defaultIDs()}
                     typeName="cuisine"
                  />
               </Flex>
               <Flex
                  container
                  as="header"
                  width="30%"
                  alignItems="center"
                  justifyContent="flex-end"
               >
                  <Text as="text1">Apply Filter:</Text>
                  <Spacer size="5px" xAxis />
                  <IconButton
                     type="ghost"
                     size="sm"
                     onClick={() => openTunnel(2)}
                  >
                     <FilterIcon />
                  </IconButton>
                  <ButtonGroup align="left">
                     <TextButton
                        type="ghost"
                        size="sm"
                        onClick={() => clearHeaderFilter()}
                     >
                        Clear
                     </TextButton>
                  </ButtonGroup>
               </Flex>
            </Flex>
         </Flex>
      </>
   )
}

export default IngredientsListing
