import { useSubscription } from '@apollo/react-hooks'
import React, { useState } from 'react'
import moment from 'moment'
import { toast } from 'react-toastify'
import { logger } from '../../../../utils'
import { Tile } from '../../../DashboardTiles'
import { ErrorState } from '../../../ErrorState'
import { InlineLoader } from '../../../InlineLoader'
import { AnalyticsApiArgsContext } from '../../context/apiArgs'
import { GET_REGISTERED_CUSTOMER } from '../../graphQl/subscription'

const RegisteredCustomerAnalytics = () => {
   const { analyticsApiArgState, analyticsApiArgsDispatch } = React.useContext(
      AnalyticsApiArgsContext
   )
   const [registeredCustomerCompare, setRegisteredCustomerCompare] = useState({
      data: undefined,
      compareResult: undefined,
   })
   //handle color and percentage of subCount
   const subCountHandler = keyName => {
      const growth = registeredCustomerCompare.compareResult[keyName]['growth']
      const isGrowth =
         registeredCustomerCompare.compareResult[keyName]['isGrowth']
      const growthInPercentage =
         registeredCustomerCompare.compareResult[keyName]['growthInPercentage']
      const toBeSubCount = growth
         ? isGrowth
            ? isFinite(growthInPercentage)
               ? '+' + growthInPercentage + '%'
               : '+100%'
            : '-' + growthInPercentage + '%'
         : '0.00%'

      const toBeSubCountColor = isGrowth ? '#26A69A' : '#F44336'
      return [toBeSubCount, toBeSubCountColor]
   }

   //subscription for present
   const {
      data: { insights_analytics = [] } = {},
      loading: subsLoading,
      error: subsError,
   } = useSubscription(GET_REGISTERED_CUSTOMER, {
      variables: {
         args: {
            params: {
               where: `${
                  analyticsApiArgState.from !== moment('2017 - 01 - 01') &&
                  `a.created_at >= '${analyticsApiArgState.from}' `
               } ${
                  analyticsApiArgState.from !== moment('2017 - 01 - 01') &&
                  `AND a.created_at < '${moment(analyticsApiArgState.to)
                     .add(1, 'd')
                     .format('YYYY-MM-DD')}' `
               } ${
                  analyticsApiArgState.brandShop.brandId
                     ? `AND a."brandId" = ${analyticsApiArgState.brandShop.brandId}`
                     : ''
               } ${
                  analyticsApiArgState.brandShop.shopTitle
                     ? `AND b.source = \'${analyticsApiArgState.brandShop.shopTitle}\'`
                     : ''
               }`,
               groupingSets: `(${analyticsApiArgState.groupBy.toString()})`,
               columns: analyticsApiArgState.groupBy
                  .map(group => {
                     return `EXTRACT(${group.toUpperCase()} FROM a.created_at) AS \"${group.toLowerCase()}\"`
                  })
                  .join(','),
            },
         },
      },
   })
   //subscription for past
   const { loading: compareLoading } = useSubscription(
      GET_REGISTERED_CUSTOMER,
      {
         variables: {
            args: {
               params: {
                  where: `${
                     analyticsApiArgState.compare.from !==
                        moment('2017 - 01 - 01') &&
                     `a.created_at >= '${analyticsApiArgState.compare.from}' `
                  } ${
                     analyticsApiArgState.compare.from !==
                        moment('2017 - 01 - 01') &&
                     `AND a.created_at < '${moment(
                        analyticsApiArgState.compare.to
                     )
                        .add(1, 'd')
                        .format('YYYY-MM-DD')}' `
                  } ${
                     analyticsApiArgState.brandShop.brandId
                        ? `AND a."brandId" = ${analyticsApiArgState.brandShop.brandId}`
                        : ''
                  } ${
                     analyticsApiArgState.brandShop.shopTitle
                        ? `AND b.source = \'${analyticsApiArgState.brandShop.shopTitle}\'`
                        : ''
                  }`,
                  groupingSets: `(${analyticsApiArgState.groupBy.toString()})`,
                  columns: analyticsApiArgState.groupBy
                     .map(group => {
                        return `EXTRACT(${group.toUpperCase()} FROM a.created_at) AS \"${group.toLowerCase()}\"`
                     })
                     .join(','),
               },
            },
         },
         skip: analyticsApiArgState.compare.isSkip,
         onSubscriptionData: ({ subscriptionData }) => {
            setRegisteredCustomerCompare(prevState => ({
               ...prevState,
               data: subscriptionData.data.insights_analytics[0],
            }))
            dataCompareMachine(subscriptionData.data.insights_analytics[0])
         },
      }
   )
   const dataCompareMachine = data => {
      const result = {}
      const present = insights_analytics[0]
      const past = data
      //getRegisteredCustomers--onDemand
      const getRegisteredCustomersOnDemandResult = {}
      const presentRegisteredCustomersOnDemand =
         present.getRegisteredCustomers[0].onDemand
      const pastRegisteredCustomersOnDemand =
         past.getRegisteredCustomers[0].onDemand
      const compareRegisteredCustomersOnDemand =
         presentRegisteredCustomersOnDemand - pastRegisteredCustomersOnDemand

      getRegisteredCustomersOnDemandResult.isGrowth =
         compareRegisteredCustomersOnDemand >= 0 ? true : false
      getRegisteredCustomersOnDemandResult.growth =
         compareRegisteredCustomersOnDemand
      getRegisteredCustomersOnDemandResult.growthInPercentage = (
         (Math.abs(compareRegisteredCustomersOnDemand) /
            pastRegisteredCustomersOnDemand) *
         100
      ).toFixed(2)
      result.getRegisteredCustomersOnDemand =
         getRegisteredCustomersOnDemandResult

      //getRegisteredCustomers--subscription
      const getRegisteredCustomersSubscriptionResult = {}
      const presentRegisteredCustomersSubscription =
         present.getRegisteredCustomers[0].subscription
      const pastRegisteredCustomersSubscription =
         past.getRegisteredCustomers[0].subscription
      const compareRegisteredCustomersSubscription =
         presentRegisteredCustomersSubscription -
         pastRegisteredCustomersSubscription

      getRegisteredCustomersSubscriptionResult.isGrowth =
         compareRegisteredCustomersSubscription >= 0 ? true : false
      getRegisteredCustomersSubscriptionResult.growth =
         compareRegisteredCustomersSubscription
      getRegisteredCustomersSubscriptionResult.growthInPercentage = (
         (Math.abs(compareRegisteredCustomersSubscription) /
            pastRegisteredCustomersSubscription) *
         100
      ).toFixed(2)
      result.getRegisteredCustomersSubscription =
         getRegisteredCustomersSubscriptionResult

      //get registered customer
      const getRegisteredCustomersResult = {}
      const presentRegisteredCustomers =
         presentRegisteredCustomersOnDemand +
         presentRegisteredCustomersSubscription
      const pastRegisteredCustomers =
         pastRegisteredCustomersOnDemand + pastRegisteredCustomersSubscription
      const compareRegisteredCustomer =
         presentRegisteredCustomers - pastRegisteredCustomers

      getRegisteredCustomersResult.isGrowth =
         compareRegisteredCustomer >= 0 ? true : false
      getRegisteredCustomersResult.growth = compareRegisteredCustomer
      getRegisteredCustomersResult.growthInPercentage = (
         (Math.abs(compareRegisteredCustomer) / pastRegisteredCustomers) *
         100
      ).toFixed(2)
      result.getRegisteredCustomers = getRegisteredCustomersResult

      setRegisteredCustomerCompare(prevState => ({
         ...prevState,
         compareResult: result,
      }))
   }
   if (subsLoading || compareLoading) {
      return <InlineLoader />
   }
   if (subsError) {
      logger(subsError)
      console.log(subsError)
      toast.error('Could not get the Insight data')
      return (
         <ErrorState height="320px" message="Could not get the Insight data" />
      )
   }
   return (
      <>
         <Tile>
            <Tile.Head title="Registered Customers"></Tile.Head>
            <Tile.Body>
               <Tile.Counts>
                  <Tile.Count
                     subCount={
                        !analyticsApiArgState.compare.isSkip &&
                        registeredCustomerCompare.compareResult &&
                        subCountHandler('getRegisteredCustomers')[0]
                     }
                     subCountColor={
                        !analyticsApiArgState.compare.isSkip &&
                        registeredCustomerCompare.compareResult &&
                        subCountHandler('getRegisteredCustomers')[1]
                     }
                  >
                     {insights_analytics[0].getRegisteredCustomers[0][
                        'onDemand'
                     ] +
                        insights_analytics[0].getRegisteredCustomers[0][
                           'subscription'
                        ]}
                  </Tile.Count>
               </Tile.Counts>
            </Tile.Body>
         </Tile>
      </>
   )
}
export default RegisteredCustomerAnalytics
