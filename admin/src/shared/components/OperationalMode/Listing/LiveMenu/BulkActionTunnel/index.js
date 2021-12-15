import React from 'react'
import BulkActions from '../../../../BulkAction'

export const BrandManager = ({
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
         table="Brand Manager"
         keyName="name"
      />
   </>
)
