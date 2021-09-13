import { Flex, Spacer, Text } from '@dailykit/ui'
import React from 'react'
import { Tile } from '../../../DashboardTiles'
import { useSubscription } from '@apollo/react-hooks'
import moment from 'moment'
import { MARKETING_EARNING } from './graphql/subscription'
import { get_env } from '../../../../utils'
//currencies
const currency = {
   USD: '$',
   INR: '₹',
   EUR: '€',
}
const MarketingReport = () => {
   const {
      loading: subsLoading,
      error: subsError,
      data: { ordersAggregate = {} } = {},
   } = useSubscription(MARKETING_EARNING, {
      variables: {
         where: {
            _and: [
               {
                  created_at: {
                     _gte: moment().subtract(30, 'days').format('YYYY MM DD'),
                  },
               },
               { created_at: { _lte: moment().format('YYYY MM DD') } },
            ],
            rewardHistories: { id: { _is_null: false } },
         },
      },
   })

   return (
      <>
         <Tile>
            <Tile.Head title="Marketing"></Tile.Head>
            <Tile.Body>
               <Flex width="100%">
                  <Flex
                     container
                     flexDirection="column"
                     alignItems="flex-start"
                     padding="0px 8px"
                  >
                     <Text as="subtitle">
                        EARNING ATTRIBUTED TO MARKETING LAST 30 DAYS
                     </Text>
                     <Spacer size="7px" />
                     <Text as="h3">
                        {currency[get_env('REACT_APP_CURRENCY')]}
                        {subsLoading
                           ? '...'
                           : subsError
                           ? 'Could not get Earning'
                           : ordersAggregate.aggregate.sum.amountPaid || 0}
                     </Text>
                  </Flex>
               </Flex>
            </Tile.Body>
         </Tile>
      </>
   )
}
export default MarketingReport
