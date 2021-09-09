import { useSubscription } from '@apollo/react-hooks'
import React from 'react'
import moment from 'moment'
import { BrandShopDateContext } from '../../../../BrandShopDateProvider/context'
import { CUSTOMERS_DATA_OVERTIME } from '../graphql/subscription'
import CustomerOverTimeTable from './Listing/customerOverTime'
import { InlineLoader } from '../../../../InlineLoader'
import { ErrorState } from '../../../../ErrorState'
import { logger } from '../../../../../utils'
import { toast } from 'react-toastify'
import { Filler } from '@dailykit/ui'
const CustomerOverTime = () => {
   const { brandShopDateState } = React.useContext(BrandShopDateContext)
   const { from, to, brandShop, groupBy } = brandShopDateState
   const {
      loading: subsLoading,
      error: subsError,
      data: { insights_analytics = [] } = {},
   } = useSubscription(CUSTOMERS_DATA_OVERTIME, {
      variables: {
         args: {
            params: {
               where: `${
                  from !== moment('2017 - 01 - 01') &&
                  `cc.created_at >= '${from}'`
               } ${
                  from !== moment('2017 - 01 - 01') &&
                  `AND cc.created_at < '${to}'`
               } ${
                  brandShop.brandId
                     ? `AND bc."brandId" = ${brandShop.brandId}`
                     : ''
               } ${
                  brandShop.shopTitle
                     ? `AND cc.source = \'${brandShop.shopTitle}\'`
                     : ''
               }`,
               groupingSets: `(${groupBy.toString()})`,
               columns: groupBy
                  .map(group => {
                     return `EXTRACT(${group.toUpperCase()} FROM cc.created_at) AS \"${group.toLowerCase()}\"`
                  })
                  .join(','),
            },
         },
      },
   })
   if (!subsError && subsLoading) {
      return <InlineLoader />
   }
   if (subsError) {
      logger(subsError)
      toast.error('Could not get the Customer Data')
      return (
         <ErrorState height="320px" message="Could not get the Customer Data" />
      )
   }
   if (insights_analytics[0].getCustomersByGroupBy.length == 1) {
      return <Filler message="No customer in these conditions" />
   }
   return (
      <>
         <div
            style={{
               background: '#FFFFFF',
               boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
               borderRadius: '10px',
               padding: '10px 0px',
            }}
         >
            <CustomerOverTimeTable
               tableData={insights_analytics[0].getCustomersByGroupBy[0]}
            />
         </div>
      </>
   )
}
export default CustomerOverTime
