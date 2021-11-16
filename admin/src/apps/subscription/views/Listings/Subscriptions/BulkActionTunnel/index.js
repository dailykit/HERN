import React from 'react'
import BulkActions from '../../../../../../shared/components/BulkAction'

export const SubscriptionOccurrenceBulkAction = ({
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
         table="Subscription Occurrence"
         keyName="fulfillmentDate"
      />
   </>
)
