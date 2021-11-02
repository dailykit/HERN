import React from 'react'
import BulkActions from '../../../../shared/components/BulkAction'

export const AddToSubscription = ({
   close,
   selectedRows,
   removeSelectedRow,
   setSelectedRows,
}) => {
   return (
      <>
         <BulkActions
            close={close}
            removeSelectedRow={removeSelectedRow}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            table="Add To Subscription"
            keyName="productName"
         />
      </>
   )
}
export const AddToOccurrence = ({
   close,
   selectedRows,
   removeSelectedRow,
   setSelectedRows,
}) => {
   return (
      <>
         <BulkActions
            close={close}
            removeSelectedRow={removeSelectedRow}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            table="Add To Occurrence"
            keyName="productName"
         />
      </>
   )
}
