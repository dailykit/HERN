import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Spacer,
   TextButton,
   Text,
   Flex,
   Dropdown,
   ButtonGroup,
   RadioGroup,
   Form,
} from '@dailykit/ui'
import { Trans, useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useTabs } from '../../../../../../../shared/providers'
import { INGREDIENT_CATEGORY_CREATE } from '../../../../../graphql/mutations'
import { INGREDIENT_CATEGORIES_INGREDIENTS_AGGREGATE } from '../../../../../graphql/subscriptions'
import BulkActions from '../../../../../../../shared/components/BulkAction'
import { Tooltip } from '../../../../../../../shared/components'
const address = 'apps.menu.views.listings.productslisting.'

export default function BulkActionsTunnel({
   close,
   selectedRows,
   setSelectedRows,
   removeSelectedRow,
}) {
   return (
      <>
         <BulkActions
            table="Ingredient"
            selectedRows={selectedRows}
            // removeSelectedRow={removeRecipe}
            setSelectedRows={setSelectedRows}
            removeSelectedRow={removeSelectedRow}
            close={close}
         />
      </>
   )
}
