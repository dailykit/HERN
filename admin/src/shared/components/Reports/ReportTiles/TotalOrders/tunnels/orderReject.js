import { Flex, Spacer } from '@dailykit/ui'
import React from 'react'
import OrderRejectTable from './listing/orderReject'

const OrderRejectReport = () => {
   return (
      <>
         <Flex>
            <Spacer size="20px" />
            <OrderRejectTable />
         </Flex>
      </>
   )
}
export default OrderRejectReport
