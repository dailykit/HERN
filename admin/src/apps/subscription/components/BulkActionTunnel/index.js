import React from 'react'
import BulkActions from '../../../../shared/components/BulkAction'

export const AddOnProducts = ({
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
            table="Manage Add On Products"
            keyName="productName"
         />
      </>
   )
}

export const MenuProducts = ({
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
            table="Manage Menu Products"
            keyName="productName"
         />
      </>
   )
}
