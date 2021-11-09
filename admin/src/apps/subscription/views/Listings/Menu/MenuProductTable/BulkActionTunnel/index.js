import React from 'react'
import BulkActions from '../../../../../../../shared/components/BulkAction'

export const MenuProduct = ({
   close,
   selectedRows,
   removeSelectedRow,
   setSelectedRows,
}) => (
   <>
      <BulkActions
         close={close}
         removeSelectedRow={removeSelectedRow}
         selectedRows={selectedRows}
         setSelectedRows={setSelectedRows}
         table="Menu Product"
         keyName="productName"
      />
   </>
)
