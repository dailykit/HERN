import React from 'react'
import BulkActions from '../../../../../../../shared/components/BulkAction'

export default function BulkActionsTunnel({
   close,
   selectedRows,
   removeSelectedRow,
   setSelectedRows,
}) {
   return (
      <>
         <BulkActions
            table="Product"
            selectedRows={selectedRows}
            removeSelectedRow={removeSelectedRow}
            setSelectedRows={setSelectedRows}
            close={close}
         />
      </>
   )
}
