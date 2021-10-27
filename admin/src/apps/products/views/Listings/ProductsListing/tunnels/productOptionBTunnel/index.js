import React from 'react'
import BulkActions from '../../../../../../../shared/components/BulkAction'

const ProductOptionsBulkAction = ({
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
         table="Product Options"
      />
   </>
)

export default ProductOptionsBulkAction
