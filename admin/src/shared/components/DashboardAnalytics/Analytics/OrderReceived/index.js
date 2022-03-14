import { useSubscription } from '@apollo/react-hooks'
import { Tunnel, TunnelHeader, Tunnels, useTunnel } from '@dailykit/ui'
import moment from 'moment'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { SparkChart } from '../..'
import { Expand, OrderIcon } from '../../../../assets/icons'
import { logger } from '../../../../utils'
import { Tile } from '../../../DashboardTiles'
import { ErrorState } from '../../../ErrorState'
import { InlineLoader } from '../../../InlineLoader'
import { AnalyticsApiArgsContext } from '../../context/apiArgs'
import { TOTAL_ORDER_RECEIVED } from '../../graphQl/subscription'
import { TotalOrderRecTunnel } from '../../Tunnels/DrillDownTunnel'
import OrderRefTable from '../../Tunnels/OrderRefTunnel/orderRefTunnel'

const OrderReceivedAnalytics = () => {
   const { analyticsApiArgState, analyticsApiArgsDispatch } = React.useContext(
      AnalyticsApiArgsContext
   )
   const [tunnels, openTunnel, closeTunnel] = useTunnel(2)
   const [orderRefTunnelData, setOrderRefTunnelData] = useState({
      title: undefined,
      orderRefData: undefined,
      presentTime: undefined,
      pastTime: undefined,
   })
   const [orderCompare, setOrderCompare] = useState({
      data: undefined,
      compareResult: undefined,
   })
   //subscription for present data
   const {
      data: { insights_analytics = [] } = {},
      loading: subsLoading,
      error: subsError,
   } = useSubscription(TOTAL_ORDER_RECEIVED, {
      variables: {
         //totalOrderReceived
         args: {
            params: {
               where: `"isAccepted" = true AND COALESCE("isRejected", false) = false AND "paymentStatus" = \'SUCCEEDED\' ${
                  analyticsApiArgState.from !== moment('2017 - 01 - 01') &&
                  `AND a.created_at >= '${analyticsApiArgState.from}'`
               } ${
                  analyticsApiArgState.from !== moment('2017 - 01 - 01') &&
                  `AND a.created_at < '${analyticsApiArgState.to}'`
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

   //subscription for compare data
   const { loading: compareLoading } = useSubscription(TOTAL_ORDER_RECEIVED, {
      variables: {
         //totalOrderReceived
         args: {
            params: {
               where: `"isAccepted" = true AND COALESCE("isRejected", false) = false AND "paymentStatus" = \'SUCCEEDED\' ${
                  analyticsApiArgState.compare.from !==
                     moment('2017 - 01 - 01') &&
                  `AND a.created_at >= '${analyticsApiArgState.compare.from}'`
               } ${
                  analyticsApiArgState.compare.from !==
                     moment('2017 - 01 - 01') &&
                  `AND a.created_at < '${analyticsApiArgState.compare.to}'`
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
         console.log(" I'm in subscription order compare yo")
         //  analyticsApiArgsDispatch({
         //     type: 'COMPARE',
         //     payload: {
         //        data: {
         //           ...analyticsApiArgState.compare.data,
         //           ...subscriptionData.data.insights_analytics[0],
         //        },
         //     },
         //  })
         //  console.log('new data', analyticsApiArgState.compare)
         setOrderCompare(prevState => ({
            ...prevState,
            data: subscriptionData.data.insights_analytics[0],
         }))
         // console.log(
         //    'order compare data',
         //    subscriptionData.data.insights_analytics[0]
         // )
         dataCompareMachine(subscriptionData.data.insights_analytics[0])
      },
   })
   // console.log(
   //    'insight data order',
   //    insights_analytics,
   //    subsLoading,
   //    compareLoading
   // )
   // console.log('global order compare', analyticsApiArgState.compare)
   const dataCompareMachine = data => {
      const result = {}
      const present = insights_analytics[0]
      const past = data

      const getOrdersRecievedResult = {}
      const presentOrderRecieved = present.getOrdersRecieved.find(
         x => x.year == null
      ).count
      const pastOrderRecieved = past.getOrdersRecieved.find(
         x => x.year == null
      ).count
      const compareOrderRecieved = presentOrderRecieved - pastOrderRecieved

      getOrdersRecievedResult.isGrowth =
         compareOrderRecieved >= 0 ? true : false
      getOrdersRecievedResult.growth = compareOrderRecieved
      getOrdersRecievedResult.growthInPercentage = (
         (Math.abs(compareOrderRecieved) / pastOrderRecieved) *
         100
      ).toFixed(2)
      result.getOrdersRecieved = getOrdersRecievedResult

      setOrderCompare(prevState => ({ ...prevState, compareResult: result }))
   }
   const subCountHandler = keyName => {
      const growth = orderCompare.compareResult[keyName]['growth']
      const isGrowth = orderCompare.compareResult[keyName]['isGrowth']
      const growthInPercentage =
         orderCompare.compareResult[keyName]['growthInPercentage']
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
   if (subsLoading || compareLoading) {
      return <InlineLoader />
   }
   if (subsError) {
      logger(subsError)
      toast.error('Could not get the Insight data')
      return (
         <ErrorState height="320px" message="Could not get the Insight data" />
      )
   }
   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel size="full" layer={1}>
               <TunnelHeader
                  title={orderRefTunnelData.title}
                  close={() => {
                     setOrderRefTunnelData({
                        title: undefined,
                        orderRefData: undefined,
                     })
                     closeTunnel(1)
                  }}
                  description="This is a graph Tunnel"
               />
               <OrderRefTable
                  graphTunnelData={orderRefTunnelData}
                  groupBy={analyticsApiArgState.groupBy}
               />
            </Tunnel>
            <Tunnel size="full" layer={2}>
               <TunnelHeader
                  title="Order Received"
                  close={() => {
                     closeTunnel(2)
                  }}
                  description="This is a Tunnel"
               />
               <TotalOrderRecTunnel currency={analyticsApiArgState.currency} />
            </Tunnel>
         </Tunnels>
         <Tile hasChart>
            <Tile.Head title="Order Received" svg={OrderIcon}>
               <Tile.Head.Actions>
                  <Tile.Head.Action
                     title="Expand"
                     onClick={() => {
                        openTunnel(2)
                     }}
                  >
                     <Expand />
                  </Tile.Head.Action>
               </Tile.Head.Actions>
            </Tile.Head>
            <Tile.Body>
               <Tile.Counts>
                  <Tile.Count
                     subCount={
                        !analyticsApiArgState.compare.isSkip &&
                        orderCompare.compareResult &&
                        subCountHandler('getOrdersRecieved')[0]
                     }
                     subCountColor={
                        !analyticsApiArgState.compare.isSkip &&
                        orderCompare.compareResult &&
                        subCountHandler('getOrdersRecieved')[1]
                     }
                  >
                     {insights_analytics[0].getOrdersRecieved?.find(
                        x => x.year === null
                     )['count'] || 0}
                  </Tile.Count>
               </Tile.Counts>
               {insights_analytics[0].getOrdersRecieved.length > 1 && (
                  <Tile.Chart>
                     <SparkChart
                        from={analyticsApiArgState.from}
                        to={analyticsApiArgState.to}
                        groupBy={analyticsApiArgState.groupBy}
                        dataOf="count"
                        insightAnalyticsData={insights_analytics[0].getOrdersRecieved.filter(
                           x => x.year !== null
                        )}
                        compare={analyticsApiArgState.compare}
                        compareInsightAnalyticsData={
                           !analyticsApiArgState.compare.isSkip &&
                           orderCompare.data &&
                           orderCompare.data.getOrdersRecieved &&
                           orderCompare.data.getOrdersRecieved.filter(
                              x => x.year !== null
                           )
                        }
                        setGraphTunnelData={setOrderRefTunnelData}
                        openGraphTunnel={openTunnel}
                        graphTunnelTitle="Order Received"
                     />
                  </Tile.Chart>
               )}
            </Tile.Body>
         </Tile>
      </>
   )
}
export default OrderReceivedAnalytics
