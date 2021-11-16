import React from 'react'
import BulkActions from '../../../../../../../shared/components/BulkAction'

export const DeliveryArea = ({
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
            table="Delivery Area"
            keyName="zipcode"
         />
      </>
   )
}
