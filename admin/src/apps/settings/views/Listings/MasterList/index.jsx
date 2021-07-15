import React from 'react'
import { Text, Flex } from '@dailykit/ui'
import { useTranslation } from 'react-i18next'
import { useSubscription } from '@apollo/react-hooks'
import { ReactTabulator } from '@dailykit/react-tabulator'

import tableOptions from '../tableOption'
import { MASTER } from '../../../graphql'
import { Tooltip, Banner } from '../../../../../shared/components'
import { useTooltip, useTabs } from '../../../../../shared/providers'

const address = 'apps.settings.views.listings.masterlist.'

const MasterList = () => {
   const { t } = useTranslation()
   const tableRef = React.useRef()
   const { tooltip } = useTooltip()
   const { tab, addTab } = useTabs()

   // subscription
   const { data: accompaniments } = useSubscription(MASTER.ACCOMPANIMENTS.LIST)
   const { data: processings } = useSubscription(MASTER.PROCESSINGS.LIST)
   const { data: allergens } = useSubscription(MASTER.ALLERGENS.LIST)
   const { data: cuisines } = useSubscription(MASTER.CUISINES.LIST)
   const { data: units } = useSubscription(MASTER.UNITS.AGGREGATE)
   const { data: productCategories } = useSubscription(
      MASTER.PRODUCT_CATEGORY.AGGREGATE
   )
   const { data: ingredientCategories } = useSubscription(
      MASTER.INGREDIENT_CATEGORY.AGGREGATE
   )

   const rowClick = (e, cell) => {
      const { _click } = cell.getData()
      _click()
   }

   const columns = [
      {
         title: 'Name',
         field: 'listName',
         headerFilter: true,
         cssClass: 'cell',
         cellClick: (e, cell) => rowClick(e, cell),
         headerTooltip: column => {
            const identifier = 'master_listing_column_name'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: t(address.concat('total inputs')),
         field: 'length',
         headerFilter: true,
         hozAlign: 'right',
         headerHozAlign: 'right',
         width: 150,
         headerTooltip: column => {
            const identifier = 'master_listing_column_total_inputs'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
   ]

   const data = [
      {
         listName: t(address.concat('accompaniment types')),
         length: accompaniments?.accompaniments.length || '...',
         _click() {
            addTab(
               'Accompaniment Types',
               '/settings/master-lists/accompaniment-types'
            )
         },
      },
      {
         listName: t(address.concat('allergens')),
         length: allergens?.masterAllergens.length || '...',
         _click() {
            addTab('Allergens', '/settings/master-lists/allergens')
         },
      },
      {
         listName: t(address.concat('cuisines')),
         length: cuisines?.cuisineNames.length || '...',
         _click() {
            addTab('Cuisines', '/settings/master-lists/cuisines')
         },
      },
      {
         listName: t(address.concat('processings')),
         length: processings?.masterProcessings.length || '...',
         _click() {
            addTab('Processings', '/settings/master-lists/processings')
         },
      },
      {
         listName: t(address.concat('units')),
         length: units?.unitsAggregate.aggregate.count || '...',
         _click() {
            addTab('Units', '/settings/master-lists/units')
         },
      },
      {
         listName: 'Product Categories',
         length:
            productCategories?.productCategoriesAggregate.aggregate.count ||
            '...',
         _click() {
            addTab(
               'Product Categories',
               '/settings/master-lists/product-categories'
            )
         },
      },
      {
         listName: 'Ingredient Categories',
         length:
            ingredientCategories?.ingredientCategoriesAggregate?.aggregate
               ?.count || '...',
         _click() {
            addTab(
               'Ingredient Categories',
               '/settings/master-lists/ingredient-categories'
            )
         },
      },
   ]

   React.useEffect(() => {
      if (!tab) {
         addTab('Master Lists', '/settings/master-lists')
      }
   }, [tab, addTab])

   return (
      <Flex margin="0 auto" width="calc(100% - 32px)" maxWidth="1280px">
         <Banner id="settings-app-masters-listing-top" />
         <Flex
            container
            as="header"
            height="72px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex as="section" container alignItems="center">
               <Text as="h2">{t(address.concat('master lists'))}</Text>
               <Tooltip identifier="station_listing_heading" />
            </Flex>
         </Flex>
         <ReactTabulator
            data={data}
            ref={tableRef}
            columns={columns}
            rowClick={rowClick}
            options={tableOptions}
         />
         <Banner id="settings-app-masters-listing-bottom" />
      </Flex>
   )
}

export default MasterList
