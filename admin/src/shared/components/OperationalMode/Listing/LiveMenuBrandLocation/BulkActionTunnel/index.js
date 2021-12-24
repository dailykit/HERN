import React from 'react'
import BulkActions from '../../../../BulkAction'

export const BrandLocationManager = ({
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
         table="Brand Location Product"
         keyName="name"
      />
   </>
)
export const BrandLocationManagerProductOption = ({
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
         table="Brand Location Product Option"
         keyName="name"
      />
   </>
)
