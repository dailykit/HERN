import React from 'react'
import BulkActions from '../../../../../../../shared/components/BulkAction'

const OccurrenceBulkAction = ({
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
         table="Menu Product Occurrence"
         keyName="productName"
      />
   </>
)

export default OccurrenceBulkAction
