import React, { useState, useContext } from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { Text, TunnelHeader, Tunnel, Tunnels, Flex } from '@dailykit/ui'
import { toast } from 'react-toastify'
import { TunnelBody, SolidTile } from './styled'
import { CREATE_REWARD, CAMPAIGN_DATA } from '../../../../../graphql'
import { logger } from '../../../../../../../shared/utils'
import {
   Tooltip,
   InlineLoader,
   Banner,
} from '../../../../../../../shared/components'
import CampaignContext from '../../../../../context/Campaign/CampaignForm'

export default function RewardTypeTunnel({
   closeTunnel,
   tunnels,
   openRewardTunnel,
   getRewardId,
   getConditionId,
}) {
   const context = useContext(CampaignContext)

   const [types, setTypes] = useState([])
   // Subscription
   const { data: rewardType, loading, error } = useSubscription(CAMPAIGN_DATA, {
      variables: {
         id: context.state.id,
      },
      onSubscriptionData: data => {
         const result = data.subscriptionData.data.campaign.campaignType.rewardTypes.map(
            type => {
               return {
                  id: type.rewardType.id,
                  value: type.rewardType.value,
               }
            }
         )
         setTypes(result)
      },
   })
   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   //Mutation
   const [createReward] = useMutation(CREATE_REWARD, {
      onCompleted: data => {
         openRewardTunnel(1)
         getRewardId(data.insert_crm_reward.returning[0].id)
         getConditionId(data.insert_crm_reward.returning[0].conditionId)
         toast.success('Reward created!')
      },
      onError: error => {
         toast.error('Something went wrong')
         logger(error)
      },
   })

   const createRewardHandler = type => {
      createReward({
         variables: {
            objects: [
               {
                  type,
                  campaignId: context.state?.id,
                  condition: {
                     data: {},
                  },
               },
            ],
         },
      })
   }

   if (loading) return <InlineLoader />
   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <Flex container alignItems="center">
                  <TunnelHeader
                     title="Select Type of Reward"
                     close={() => closeTunnel(1)}
                     tooltip={<Tooltip identifier="campaign_reward_type" />}
                  />
               </Flex>
               <Banner id="crm-app-campaigns-campaign-details-reward-type-tunnel-top" />
               <TunnelBody>
                  {types.map(type => {
                     return (
                        <SolidTile
                           key={type.id}
                           onClick={() => createRewardHandler(type.value)}
                        >
                           <Text as="h1">{type.value}</Text>
                           <Text as="subtitle">
                              Create Reward For {type.value} Type.
                           </Text>
                        </SolidTile>
                     )
                  })}
               </TunnelBody>
               <Banner id="crm-app-campaigns-campaign-details-reward-type-tunnel-bottom" />
            </Tunnel>
         </Tunnels>
      </>
   )
}
