import React from 'react'
import BulkActions from '../../../../../../../shared/components/BulkAction'

export default function BulkActionsTunnel({
   close,
   selectedRows,
   setSelectedRows,
   removeSelectedRow,
}) {
   return (
      <>
         <BulkActions
            table="Recipe"
            schemaName="simpleRecipe"
            tableName="simpleRecipe"
            selectedRows={selectedRows}
            // removeSelectedRow={removeRecipe}
            setSelectedRows={setSelectedRows}
            removeSelectedRow={removeSelectedRow}
            close={close}
         />
      </>
   )
}
