import { useSubscription } from '@apollo/react-hooks'
import { Filler, Flex, Spacer, Text } from '@dailykit/ui'
import React from 'react'
import {
   Bar,
   BarChart,
   CartesianGrid,
   Legend,
   ResponsiveContainer,
   Tooltip,
   XAxis,
   YAxis,
} from 'recharts'
import { currencyFmt, logger } from '../../../../../utils'
import { BrandShopDateContext } from '../../../../BrandShopDateProvider/context'
import { InlineLoader } from '../../../../InlineLoader'
import { CAMPAIGN_INSIGHTS } from '../graphql/subscription'
import { toast } from 'react-toastify'
import { ErrorState } from '../../../../ErrorState'
import CampaignList from './Listing/campaignList'

const CampaignInsights = () => {
   const { brandShopDateState } = React.useContext(BrandShopDateContext)
   const { from, to, brandShop } = brandShopDateState

   const [campaigns, setCampaigns] = React.useState([])
   const [status, setStatus] = React.useState('loading')
   const [compareCampaigns, setCompareCampaigns] = React.useState([])
   const [sortedCampaigns, setSortedCampaigns] = React.useState([])

   const { loading, campaignError } = useSubscription(CAMPAIGN_INSIGHTS, {
      variables: {
         where: {},
         rewardWhere: {
            brandId: {
               ...(brandShop.brandId
                  ? { _eq: brandShop.brandId }
                  : { _is_null: false }),
            },
            created_at: {
               _gte: from,
               _lte: to,
            },
         },
      },
      onSubscriptionData: ({ subscriptionData }) => {
         console.log('subscriptionData', subscriptionData)
         if (subscriptionData.data.campaigns.length > 0) {
            const flatData = subscriptionData.data.campaigns.map(
               eachCampaign => {
                  return {
                     ...eachCampaign,
                     campaign_title: eachCampaign.metaDetails.title,
                     campaign_description: eachCampaign.metaDetails.description,
                     campaign_count:
                        eachCampaign.rewardHistories_aggregate.aggregate
                           .count || 0,
                     campaign_wallet:
                        eachCampaign.rewardHistories_aggregate.aggregate.sum
                           .walletAmount || 0,
                     campaign_loyalty:
                        eachCampaign.rewardHistories_aggregate.aggregate.sum
                           .loyaltyPoints || 0,
                  }
               }
            )
            setCampaigns(flatData)
            setSortedCampaigns(flatData)
            setStatus('success')
         } else {
            setStatus('success')
         }
      },
   })
   const { compareLoading, campaignCompareError } = useSubscription(
      CAMPAIGN_INSIGHTS,
      {
         skip: brandShopDateState.compare.isSkip,
         variables: {
            where: {
               id: {
                  _in: sortedCampaigns.map(campaign => campaign.id),
               },
            },
            rewardWhere: {
               brandId: {
                  ...(brandShop.brandId
                     ? { _eq: brandShop.brandId }
                     : { _is_null: false }),
               },
               created_at: {
                  _gte: brandShopDateState.compare.from,
                  _lte: brandShopDateState.compare.to,
               },
            },
         },
         onSubscriptionData: ({ subscriptionData }) => {
            console.log('subscriptionData', subscriptionData)
            if (subscriptionData.data.campaigns.length > 0) {
               const flatData = subscriptionData.data.campaigns.map(
                  eachCampaign => {
                     return {
                        ...eachCampaign,
                        campaign_title: eachCampaign.metaDetails.title,
                        campaign_description:
                           eachCampaign.metaDetails.description,
                        campaign_count:
                           eachCampaign.rewardHistories_aggregate.aggregate
                              .count || 0,
                        campaign_wallet:
                           eachCampaign.rewardHistories_aggregate.aggregate.sum
                              .walletAmount || 0,
                        campaign_loyalty:
                           eachCampaign.rewardHistories_aggregate.aggregate.sum
                              .loyaltyPoints || 0,
                     }
                  }
               )
               setCompareCampaigns(flatData)
            }
         },
      }
   )

   if (status == 'loading') return <InlineLoader />

   if (campaignError) {
      logger(campaignError)
      toast.error('Could not get the Insight data')
      return (
         <ErrorState
            height="320px"
            message="Could not get Earning by product data"
         />
      )
   }

   if (campaigns.length == 0) {
      return <Filler message="No campaign available" />
   }

   return (
      <Flex>
         <Spacer size="20px" />
         <Flex>
            <div
               style={{
                  background: '#FFFFFF',
                  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
                  borderRadius: '10px',
                  padding: '40px 40px 10px 0px',
               }}
            >
               <CampaignGraph
                  campaigns={sortedCampaigns.slice(0, 10)}
                  compareCampaigns={compareCampaigns}
               />
            </div>
         </Flex>
         <Spacer size="20px" />

         <Flex>
            <div
               style={{
                  background: '#FFFFFF',
                  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
                  borderRadius: '10px',
                  padding: '10px 0px',
               }}
            >
               <CampaignList
                  campaigns={campaigns}
                  setSortedCampaigns={setSortedCampaigns}
               />
            </div>
         </Flex>
      </Flex>
   )
}

const CampaignGraph = ({ campaigns, compareCampaigns }) => {
   const { brandShopDateState } = React.useContext(BrandShopDateContext)

   const [chartData, setChartData] = React.useState([])
   const [isLoading, setIsLoading] = React.useState(true)

   React.useEffect(() => {
      if (compareCampaigns.length > 0) {
         const campaignWithCompareData = campaigns.map(campaign => {
            const compareFoundData = compareCampaigns.find(
               x => x.id == campaign.id
            )
            campaign['compare_campaign_count'] =
               compareFoundData.campaign_count || 0
            campaign['compare_campaign_wallet'] =
               compareFoundData.campaign_wallet || 0
            campaign['compare_campaign_loyalty'] =
               compareFoundData.campaign_loyalty || 0

            return campaign
         })
         setChartData(campaignWithCompareData)
         setIsLoading(false)
      } else {
         setChartData(campaigns)
         setIsLoading(false)
      }
   }, [campaigns, compareCampaigns])

   const CustomTooltip = ({ active, payload }) => {
      //   console.log('payload', payload)
      if (active && payload && payload.length) {
         return (
            <div
               style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#f9f9f9',
                  width: 'auto',
                  height: 'auto',
                  margin: '2px 2px',
                  padding: '2px 2px',
                  boxShadow: '5px 5px 10px #888888',
               }}
            >
               <Spacer size="3px" />
               <Text as="text3">
                  Campaign:{' '}
                  <span style={{ fontWeight: '700' }}>
                     {payload[0].payload['campaign_title']}
                  </span>
               </Text>
               <Text as="text3">
                  Campaign Rewards Count:{'  '}
                  <span style={{ color: '#2AC981' }}>
                     {payload[0].payload['campaign_count']}
                  </span>{' '}
                  {!brandShopDateState.compare.isSkip && compareCampaigns && (
                     <span style={{ color: '#8884d8' }}>
                        {payload[0].payload['compare_campaign_count']}
                     </span>
                  )}
               </Text>
               <Text as="text3">
                  Campaign wallet Amount Rewards:{'  '}
                  <span style={{ color: '#2AC981' }}>
                     {currencyFmt(payload[0].payload['campaign_wallet'])}
                  </span>{' '}
                  {!brandShopDateState.compare.isSkip && compareCampaigns && (
                     <span style={{ color: '#8884d8' }}>
                        {currencyFmt(
                           payload[0].payload['compare_campaign_wallet']
                        )}
                     </span>
                  )}
               </Text>
               <Text as="text3">
                  Campaign Loyalty Point Rewards:{'  '}
                  <span style={{ color: '#2AC981' }}>
                     {payload[0].payload['campaign_loyalty']}
                  </span>{' '}
                  {!brandShopDateState.compare.isSkip && compareCampaigns && (
                     <span style={{ color: '#8884d8' }}>
                        {payload[0].payload['compare_campaign_loyalty']}
                     </span>
                  )}
               </Text>
            </div>
         )
      }

      return null
   }

   if (isLoading) {
      return <InlineLoader />
   }

   return (
      <Flex height="22rem">
         <ResponsiveContainer width="100%" height="100%">
            <BarChart
               width={550}
               height={300}
               data={chartData}
               margin={{
                  top: 5,
                  right: 0,
                  left: 0,
                  bottom: 5,
               }}
            >
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis
                  dataKey="campaign_title"
                  tickFormatter={tick => tick.toString().slice(0, 10) + '...'}
                  ticks={chartData.map(x => x.campaign_title)}
                  // tick={<CustomizedAxisTick />}
               />
               <YAxis />
               <Tooltip content={<CustomTooltip />} />
               <Legend />
               <Bar
                  name="Campaign Reward"
                  type="monotone"
                  dataKey="campaign_count"
                  fill="#2AC981"
               />
               {!brandShopDateState.compare.isSkip && compareCampaigns && (
                  <Bar
                     name="Compare Campaign Reward"
                     type="monotone"
                     dataKey="compare_campaign_count"
                     fill="#8884d8"
                  />
               )}
            </BarChart>
         </ResponsiveContainer>
      </Flex>
   )
}
export default CampaignInsights
