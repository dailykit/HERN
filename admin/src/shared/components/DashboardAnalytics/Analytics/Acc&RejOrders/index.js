import React, { useState } from 'react'
import moment from 'moment'
import { useSubscription } from '@apollo/react-hooks'
import { AnalyticsApiArgsContext } from '../../context/apiArgs'
import { ACCEPTED_AND_REJECTED_ORDERS } from '../../graphQl/subscription'
import { InlineLoader } from '../../../InlineLoader'

import { toast } from 'react-toastify'
import { ErrorState } from '../../../ErrorState'
import { Tile } from '../../../DashboardTiles'
import { logger } from '../../../../utils'

const AcceptedAndRejectedAnalytics = () => {
   const { analyticsApiArgState, analyticsApiArgsDispatch } = React.useContext(
      AnalyticsApiArgsContext
   )
   const [acceptAndRejectCompare, setAcceptAndRejectCompare] = useState({
      data: undefined,
      compareResult: undefined,
   })
   //subscription for shop type and brand
   const subCountHandler = keyName => {
      const growth = acceptAndRejectCompare.compareResult[keyName]['growth']
      const isGrowth = acceptAndRejectCompare.compareResult[keyName]['isGrowth']
      const growthInPercentage =
         acceptAndRejectCompare.compareResult[keyName]['growthInPercentage']
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
   //subscription for present data
   const {
      data: { insights_analytics = [] } = {},
      loading: subsLoading,
      error: subsError,
   } = useSubscription(ACCEPTED_AND_REJECTED_ORDERS, {
      variables: {
         args: {
            params: {
               where: `${
                  analyticsApiArgState.from !== moment('2017 - 01 - 01') &&
                  `a.created_at >= '${analyticsApiArgState.from}'`
               } ${
                  analyticsApiArgState.from !== moment('2017 - 01 - 01') &&
                  `AND a.created_at < '${moment(analyticsApiArgState.to)
                     .add(1, 'd')
                     .format('YYYY-MM-DD')}'`
               } ${
                  analyticsApiArgState.brandShop.brandId
                     ? `AND a."brandId" = ${analyticsApiArgState.brandShop.brandId}`
                     : ''
               } ${
                  analyticsApiArgState.brandShop.shopTitle
                     ? `AND b.source = \'${analyticsApiArgState.brandShop.shopTitle}\'`
                     : ''
               } ${
                  analyticsApiArgState.brandShop.locationId
                     ? `AND b."locationId" = ${analyticsApiArgState.brandShop.locationId}`
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

   //subscription for compare data
   const { loading: compareLoading } = useSubscription(
      ACCEPTED_AND_REJECTED_ORDERS,
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
                        .format('YYYY-MM-DD')}'`
                  } ${
                     analyticsApiArgState.brandShop.brandId
                        ? `AND a."brandId" = ${analyticsApiArgState.brandShop.brandId}`
                        : ''
                  } ${
                     analyticsApiArgState.brandShop.shopTitle
                        ? `AND b.source = \'${analyticsApiArgState.brandShop.shopTitle}\'`
                        : ''
                  } ${
                     analyticsApiArgState.brandShop.locationId
                        ? `AND b."locationId" = ${analyticsApiArgState.brandShop.locationId}`
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
            setAcceptAndRejectCompare(prevState => ({
               ...prevState,
               data: subscriptionData.data.insights_analytics[0],
            }))
            dataCompareMachine(subscriptionData.data.insights_analytics[0])
         },
      }
   )
   // console.log('compare query', {
   //    where: `${
   //       analyticsApiArgState.compare.from !== moment('2017 - 01 - 01') &&
   //       `a.created_at >= '${analyticsApiArgState.compare.from}' `
   //    } ${
   //       analyticsApiArgState.compare.from !== moment('2017 - 01 - 01') &&
   //       `AND a.created_at < '${analyticsApiArgState.compare.to}' `
   //    } ${
   //       analyticsApiArgState.brandShop.brandId
   //          ? `AND a."brandId" = ${analyticsApiArgState.brandShop.brandId}`
   //          : ''
   //    } ${
   //       analyticsApiArgState.brandShop.shopTitle
   //          ? `AND b.source = \'${analyticsApiArgState.brandShop.shopTitle}\'`
   //          : ''
   //    }`,
   //    groupingSets: `(${analyticsApiArgState.groupBy.toString()})`,
   //    columns: analyticsApiArgState.groupBy
   //       .map(group => {
   //          return `EXTRACT(${group.toUpperCase()} FROM a.created_at) AS \"${group.toLowerCase()}\"`
   //       })
   //       .join(','),
   // })
   const dataCompareMachine = data => {
      const result = {}
      const present = insights_analytics[0]
      const past = data
      //getAcceptedVsRejectedOrders-->accepted
      const getAcceptedOrdersResult = {}
      const presentAccepted = present.getAcceptedVsRejectedOrders.acceptedCount
      const pastAccepted = past.getAcceptedVsRejectedOrders.acceptedCount
      const compareAccepted = presentAccepted - pastAccepted

      getAcceptedOrdersResult.isGrowth = compareAccepted >= 0 ? true : false
      getAcceptedOrdersResult.growth = compareAccepted
      getAcceptedOrdersResult.growthInPercentage = (
         (Math.abs(compareAccepted) / pastAccepted) *
         100
      ).toFixed(2)
      result.getAcceptedOrders = getAcceptedOrdersResult

      //getAcceptedVsRejectedOrders-->Rejected
      const getRejectedOrdersResult = {}
      const presentRejected = present.getAcceptedVsRejectedOrders.rejectedCount
      const pastRejected = past.getAcceptedVsRejectedOrders.rejectedCount
      const compareRejected = presentRejected - pastRejected

      getRejectedOrdersResult.isGrowth = compareRejected >= 0 ? true : false
      getRejectedOrdersResult.growth = compareRejected
      getRejectedOrdersResult.growthInPercentage = (
         (Math.abs(compareRejected) / pastRejected) *
         100
      ).toFixed(2)
      result.getRejectedOrders = getRejectedOrdersResult

      setAcceptAndRejectCompare(prevState => ({
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
            <Tile.Head title="Total Accepted vs Rejected Orders"></Tile.Head>
            <Tile.Body>
               <Tile.Counts>
                  <Tile.Count
                     subCount={
                        !analyticsApiArgState.compare.isSkip &&
                        acceptAndRejectCompare.compareResult &&
                        subCountHandler('getAcceptedOrders')[0]
                     }
                     subCountColor={
                        !analyticsApiArgState.compare.isSkip &&
                        acceptAndRejectCompare.compareResult &&
                        subCountHandler('getAcceptedOrders')[1]
                     }
                  >
                     {
                        insights_analytics[0].getAcceptedVsRejectedOrders
                           .acceptedCount
                     }
                  </Tile.Count>
                  <Tile.Count
                     subCount={
                        !analyticsApiArgState.compare.isSkip &&
                        acceptAndRejectCompare.compareResult &&
                        subCountHandler('getRejectedOrders')[0]
                     }
                     subCountColor={
                        !analyticsApiArgState.compare.isSkip &&
                        acceptAndRejectCompare.compareResult &&
                        subCountHandler('getRejectedOrders')[1]
                     }
                  >
                     {
                        insights_analytics[0].getAcceptedVsRejectedOrders
                           .rejectedCount
                     }
                  </Tile.Count>
               </Tile.Counts>
            </Tile.Body>
         </Tile>
      </>
   )
}

export default AcceptedAndRejectedAnalytics
