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
import { AddIcon, DeleteIcon } from '../../../assets/icons'
import {
   CREATE_INGREDIENT,
   DELETE_INGREDIENTS,
   S_INGREDIENTS,
} from '../../../graphql'
import Count from '../../../utils/countFormatter'
import tableOptions from '../tableOption'
import { ResponsiveFlex } from '../styled'
import { BulkActionsTunnel, ApplyFilterTunnel } from './tunnels'
const address = 'apps.products.views.listings.ingredientslisting.'

const IngredientsListing = () => {
   const { t } = useTranslation()
   const { addTab, tab } = useTabs()
   const [selectedRows, setSelectedRows] = React.useState([])
   const [tunnels, openTunnel, closeTunnel, visible] = useTunnel(2)
   const dataTableRef = React.useRef()

   const { loading, data: { ingredients = [] } = {}, error } = useSubscription(
      S_INGREDIENTS
   )

   // Mutations
   const [createIngredient] = useMutation(CREATE_INGREDIENT, {
      onCompleted: data => {
         toast.success('Ingredient created!')
         addTab(
            data.createIngredient.returning[0].name,
            `/products/ingredients/${data.createIngredient.returning[0].id}`
         )
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
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

   const createIngredientHandler = async () => {
      const name = `ingredient-${randomSuffix()}`
      createIngredient({ variables: { name } })
   }

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
   if (!loading && error) {
      toast.error('Failed to fetch Ingredients!')
      logger(error)
      return <ErrorState />
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
         <Flex
            container
            alignItems="center"
            justifyContent="space-between"
            height="72px"
         >
            <Flex container>
               <Text as="h2">Ingredients({ingredients.length}) </Text>
               <Tooltip identifier="ingredients_list_heading" />
            </Flex>
            <ComboButton type="solid" onClick={createIngredientHandler}>
               <AddIcon color="#fff" size={24} /> Add Ingredient
            </ComboButton>
         </Flex>
         {loading ? (
            <InlineLoader />
         ) : (
            <DataTable
               ref={dataTableRef}
               data={ingredients}
               addTab={addTab}
               openTunnel={openTunnel}
               deleteIngredientHandler={deleteIngredientHandler}
               createIngredientHandler={createIngredientHandler}
               selectedRows={selectedRows}
               setSelectedRows={setSelectedRows}
            />
         )}
         <Banner id="products-app-ingredients-listing-bottom" />
      </ResponsiveFlex>
   )
}
class DataTable extends React.Component {
   constructor(props) {
      super(props)
      this.state = {
         groups: [],
      }
      this.tableRef = React.createRef()
      this.handleRowSelection = this.handleRowSelection.bind(this)
   }
   columns = [
      {
         formatter: 'rowSelection',
         titleFormatter: 'rowSelection',
         hozAlign: 'center',
         headerSort: false,
         width: 15,
      },
      {
         title: 'Name',
         field: 'name',
         headerFilter: true,
         cellClick: (e, cell) => {
            const { name, id } = cell._cell.row.data
            this.props.addTab(name, `/products/ingredients/${id}`)
         },
         cssClass: 'colHover',
      },
      { title: 'Category', field: 'category', headerFilter: true },
      {
         title: 'Processings',
         field: 'ingredientProcessings',
         headerFilter: false,
         hozAlign: 'right',
         formatter: reactFormatter(<Count />),
         width: 150,
      },
      {
         title: 'Sachets',
         field: 'ingredientSachets',
         headerFilter: false,
         hozAlign: 'right',
         formatter: reactFormatter(<Count />),
         width: 150,
      },
      {
         title: 'Published',
         field: 'isPublished',
         formatter: 'tickCross',
         hozAlign: 'center',
         headerHozAlign: 'center',
         width: 150,
      },
      {
         title: 'Actions',
         headerFilter: false,
         headerSort: false,
         hozAlign: 'center',
         formatter: reactFormatter(
            <DeleteIngredient onDelete={this.props.deleteIngredientHandler} />
         ),
         width: 150,
      },
   ]
   groupByOptions = [
      { id: 1, title: 'isPublished' },
      { id: 2, title: 'category' },
   ]
   handleRowSelection = rows => {
      this.props.setSelectedRows(rows)
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
   render() {
      return (
         <>
            <Spacer size="5px" />
            <ActionBar
               title="ingredient"
               groupByOptions={this.groupByOptions}
               selectedRows={this.props.selectedRows}
               openTunnel={this.props.openTunnel}
               handleGroupBy={this.handleGroupBy}
               clearHeaderFilter={this.clearHeaderFilter}
            />
            <Spacer size="30px" />
            <ReactTabulator
               ref={this.tableRef}
               columns={this.columns}
               data={this.props.data}
               options={tableOptions}
               selectableCheck={() => true}
               rowSelectionChanged={(data, components) => {
                  this.handleRowSelection(data)
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

function FormatDate({
   cell: {
      _cell: { value },
   },
}) {
   return <>{value ? moment(value).format('LLL') : 'NA'}</>
}

const ActionBar = ({
   title,
   groupByOptions,
   selectedRows,
   openTunnel,
   handleGroupBy,
   clearHeaderFilter,
}) => {
   const selectedOption = option => {
      const newOptions = option.map(x => x.title)
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
               width="30%"
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
               width="70%"
               alignItems="center"
               justifyContent="space-around"
            >
               <Flex
                  container
                  as="header"
                  width="70%"
                  alignItems="center"
                  justifyContent="flex-end"
               >
                  <Text as="text1">Group By:</Text>
                  <Spacer size="5px" xAxis />
                  <Dropdown
                     type="multi"
                     variant="revamp"
                     disabled={true}
                     options={groupByOptions}
                     searchedOption={searchedOption}
                     selectedOption={selectedOption}
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
