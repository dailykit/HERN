import { useSubscription } from '@apollo/react-hooks'
import { useTunnel, Tunnels, Tunnel, TunnelHeader } from '@dailykit/ui'
import React, { useState } from 'react'
import { SparkChart } from '../..'
import moment from 'moment'
import { Tile } from '../../../DashboardTiles'
import { AnalyticsApiArgsContext } from '../../context/apiArgs'
import { GET_TOTAL_EARNING } from '../../graphQl/subscription'
import { TotalEarningTunnel } from '../../Tunnels/DrillDownTunnel'
import { logger } from '../../../../utils'
import { toast } from 'react-toastify'
import { ErrorState } from '../../../ErrorState'
import OrderRefTable from '../../Tunnels/OrderRefTunnel/orderRefTunnel'
import { EarningIcon, Expand } from '../../../../assets/icons'
import { InlineLoader } from '../../../InlineLoader'

const TotalEarningAnalytics = () => {
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
   const [earningCompare, setEarningCompare] = useState({
      data: undefined,
      compareResult: undefined,
   })

   //subscription for shop type and brand
   const subCountHandler = keyName => {
      const growth = earningCompare.compareResult[keyName]['growth']
      const isGrowth = earningCompare.compareResult[keyName]['isGrowth']
      const growthInPercentage =
         earningCompare.compareResult[keyName]['growthInPercentage']
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
   } = useSubscription(GET_TOTAL_EARNING, {
      variables: {
         //totalEarning
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
   const { loading: compareLoading } = useSubscription(GET_TOTAL_EARNING, {
      variables: {
         //totalEarning
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
         setEarningCompare(prevState => ({
            ...prevState,
            data: subscriptionData.data.insights_analytics[0],
         }))
         dataCompareMachine(subscriptionData.data.insights_analytics[0])
      },
   })
   const dataCompareMachine = data => {
      const result = {}
      const present = insights_analytics[0]
      const past = data
      //getTotalEarning
      const getTotalEarningsResult = {}
      const presentTotalEarnings = present.getTotalEarnings[0].total
      const pastTotalEarnings = past.getTotalEarnings[0].total
      const compareTotalEarnings = presentTotalEarnings - pastTotalEarnings

      getTotalEarningsResult.isGrowth = compareTotalEarnings >= 0 ? true : false
      getTotalEarningsResult.growth = compareTotalEarnings
      getTotalEarningsResult.growthInPercentage = (
         (Math.abs(compareTotalEarnings) / pastTotalEarnings) *
         100
      ).toFixed(2)
      result.getTotalEarnings = getTotalEarningsResult

      setEarningCompare(prevState => ({ ...prevState, compareResult: result }))
   }
   // console.log('Loading', subsLoading, insights_analytics)
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
                  title="Total Earning"
                  close={() => {
                     closeTunnel(2)
                  }}
                  description="This is a Tunnel"
               />
               <TotalEarningTunnel currency={analyticsApiArgState.currency} />
            </Tunnel>
         </Tunnels>
         <Tile hasChart>
            <Tile.Head title="Total Earning" svg={EarningIcon}>
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
                     currency={analyticsApiArgState.currency}
                     subCount={
                        !analyticsApiArgState.compare.isSkip &&
                        earningCompare.compareResult &&
                        subCountHandler('getTotalEarnings')[0]
                     }
                     subCountColor={
                        !analyticsApiArgState.compare.isSkip &&
                        earningCompare.compareResult &&
                        subCountHandler('getTotalEarnings')[1]
                     }
                  >
                     {insights_analytics[0].getTotalEarnings[0]['total'] || 0}
                  </Tile.Count>
               </Tile.Counts>
               {insights_analytics[0].getTotalEarnings.length > 1 && (
                  <Tile.Chart>
                     <SparkChart
                        from={analyticsApiArgState.from}
                        to={analyticsApiArgState.to}
                        groupBy={analyticsApiArgState.groupBy}
                        dataOf="total"
                        insightAnalyticsData={insights_analytics[0].getTotalEarnings.slice(
                           1
                        )}
                        idName={['total_earning']}
                        compare={analyticsApiArgState.compare}
                        compareInsightAnalyticsData={
                           !analyticsApiArgState.compare.isSkip &&
                           earningCompare.data &&
                           earningCompare.data.getTotalEarnings.slice(1)
                        }
                        setGraphTunnelData={setOrderRefTunnelData}
                        openGraphTunnel={openTunnel}
                        graphTunnelTitle="Total Earning"
                     />
                  </Tile.Chart>
               )}
            </Tile.Body>
         </Tile>
      </>
   )
}

export default TotalEarningAnalytics
