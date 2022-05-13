import { useSubscription } from '@apollo/react-hooks'
import React, { useState } from 'react'
import moment from 'moment'
import { AnalyticsApiArgsContext } from '../../context/apiArgs'
import { SUBSCRIBED_CUSTOMER } from '../../graphQl/subscription'
import { InlineLoader } from '../../../InlineLoader'
import { logger } from '../../../../utils'
import { toast } from 'react-toastify'
import { ErrorState } from '../../../ErrorState'
import { Tile } from '../../../DashboardTiles'
import { SparkChart } from '../..'
import { Tunnel, TunnelHeader, Tunnels, useTunnel } from '@dailykit/ui'
import OrderRefTable from '../../Tunnels/OrderRefTunnel/orderRefTunnel'

const SubscribedCustomerAnalytics = () => {
   const { analyticsApiArgState, analyticsApiArgsDispatch } = React.useContext(
      AnalyticsApiArgsContext
   )
   const [subsCustomerCompare, setSubsCustomerCompare] = useState({
      data: undefined,
      compareResult: undefined,
   })
   const [tunnels, openTunnel, closeTunnel] = useTunnel(2)
   const [orderRefTunnelData, setOrderRefTunnelData] = useState({
      title: undefined,
      orderRefData: undefined,
      presentTime: undefined,
      pastTime: undefined,
   })

   const subCountHandler = keyName => {
      const growth = subsCustomerCompare.compareResult[keyName]['growth']
      const isGrowth = subsCustomerCompare.compareResult[keyName]['isGrowth']
      const growthInPercentage =
         subsCustomerCompare.compareResult[keyName]['growthInPercentage']
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
   const {
      data: { insights_analytics = [] } = {},
      loading: subsLoading,
      error: subsError,
   } = useSubscription(SUBSCRIBED_CUSTOMER, {
      variables: {
         args: {
            params: {
               where: `a.\"isSubscriber\" = true AND  a.\"isSubscriberTimeStamp\" IS NOT NULL ${
                  analyticsApiArgState.from !== moment('2017 - 01 - 01') &&
                  `AND a.created_at >= '${analyticsApiArgState.from}'`
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

   const { loading: compareLoading } = useSubscription(SUBSCRIBED_CUSTOMER, {
      variables: {
         args: {
            params: {
               where: `a.\"isSubscriber\" = true AND  a.\"isSubscriberTimeStamp\" IS NOT NULL ${
                  analyticsApiArgState.compare.from !==
                     moment('2017 - 01 - 01') &&
                  `AND a.created_at >= '${analyticsApiArgState.compare.from}'`
               } ${
                  analyticsApiArgState.compare.from !==
                     moment('2017 - 01 - 01') &&
                  `AND a.created_at < '${moment(analyticsApiArgState.compare.to)
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
         setSubsCustomerCompare(prevState => ({
            ...prevState,
            data: subscriptionData.data.insights_analytics[0],
         }))
         dataCompareMachine(subscriptionData.data.insights_analytics[0])
      },
   })
   console.log('subsError', subsError)
   const dataCompareMachine = data => {
      const result = {}
      const present = insights_analytics[0]
      const past = data
      //getSubscribedCustomer
      const getSubscribedCustomersResult = {}
      const presentSubscribedCustomers = present.getSubscribedCustomers[0].count
      const pastSubscribedCustomers = past.getSubscribedCustomers[0].count
      const compareSubscribedCustomers =
         presentSubscribedCustomers - pastSubscribedCustomers

      getSubscribedCustomersResult.isGrowth =
         compareSubscribedCustomers >= 0 ? true : false
      getSubscribedCustomersResult.growth = compareSubscribedCustomers
      getSubscribedCustomersResult.growthInPercentage = (
         (Math.abs(compareSubscribedCustomers) / pastSubscribedCustomers) *
         100
      ).toFixed(2)
      result.getSubscribedCustomers = getSubscribedCustomersResult

      setSubsCustomerCompare(prevState => ({
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
         </Tunnels>
         <Tile>
            <Tile.Head title="Subscribed Customer">
               {/* <Tile.Head.Actions>
                     <Tile.Head.Action
                        title="Expand"
                        onClick={() => {
                           // setTunnelTitle('Subscribed Customer')
                           // openTunnel(1)
                           console.log('Tunnel')
                        }}
                     >
                        <Expand />
                     </Tile.Head.Action>
                  </Tile.Head.Actions> */}
            </Tile.Head>
            <Tile.Body>
               <Tile.Counts>
                  <Tile.Count
                     subCount={
                        !analyticsApiArgState.compare.isSkip &&
                        subsCustomerCompare.compareResult &&
                        subCountHandler('getSubscribedCustomers')[0]
                     }
                     subCountColor={
                        !analyticsApiArgState.compare.isSkip &&
                        subsCustomerCompare.compareResult &&
                        subCountHandler('getSubscribedCustomers')[1]
                     }
                  >
                     {insights_analytics[0].getSubscribedCustomers[0]['count']}
                  </Tile.Count>
               </Tile.Counts>
               {insights_analytics[0].getSubscribedCustomers.length > 1 && (
                  <Tile.Chart>
                     <SparkChart
                        from={analyticsApiArgState.from}
                        to={analyticsApiArgState.to}
                        groupBy={analyticsApiArgState.groupBy}
                        idName="subscribed_customers"
                        dataOf="count"
                        insightAnalyticsData={insights_analytics[0].getSubscribedCustomers.slice(
                           1
                        )}
                        compare={analyticsApiArgState.compare}
                        compareInsightAnalyticsData={
                           !analyticsApiArgState.compare.isSkip &&
                           subsCustomerCompare.data &&
                           subsCustomerCompare.data.getSubscribedCustomers.slice(
                              1
                           )
                        }
                        graphTunnelTitle="Subscribed Customer"
                     />
                  </Tile.Chart>
               )}
            </Tile.Body>
         </Tile>
      </>
   )
}
export default SubscribedCustomerAnalytics
