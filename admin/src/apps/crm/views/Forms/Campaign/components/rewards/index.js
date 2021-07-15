import React, { useState, useContext } from 'react'
import { useSubscription, useMutation, useLazyQuery } from '@apollo/react-hooks'
import {
   ButtonTile,
   useTunnel,
   Form,
   Text,
   IconButton,
   ComboButton,
   PlusIcon,
   Flex,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import { EditIcon, DeleteIcon } from '../../../../../../../shared/assets/icons'
import { RewardsTunnel, RewardDetailsTunnel } from '../../tunnels'
import {
   REWARD_DATA_BY_CAMPAIGN_ID,
   DELETE_REWARD,
   REWARD_DATA,
} from '../../../../../graphql'
import Conditions from '../../../../../../../shared/components/Conditions'
import { logger } from '../../../../../../../shared/utils'
import {
   Tooltip,
   InlineLoader,
   DragNDrop,
} from '../../../../../../../shared/components'
import { StyledContainer, StyledRow, RewardDiv, StyledDiv } from './styled'
import CampaginContext from '../../../../../context/Campaign/CampaignForm'
import { useDnd } from '../../../../../../../shared/components/DragNDrop/useDnd'

const Rewards = () => {
   const { initiatePriority } = useDnd()
   const context = useContext(CampaginContext)
   const [typeTunnels, openTypeTunnel, closeTypeTunnel] = useTunnel(1)
   const [rewardTunnels, openRewardTunnel, closeRewardTunnel] = useTunnel(1)
   const [
      conditionTunnels,
      openConditionTunnel,
      closeConditionTunnel,
   ] = useTunnel(2)
   const [conditionId, setConditionId] = useState(null)
   const [rewardId, setRewardId] = useState(null)
   const [rewardInfoArray, setRewardInfoArray] = useState([])
   const [rewardTunnelInfo, setRewardTunnelInfo] = useState({})

   // Subscription
   const { data: rewardData, loading, error } = useSubscription(
      REWARD_DATA_BY_CAMPAIGN_ID,
      {
         variables: {
            campaignId: context.state.id,
         },
         onSubscriptionData: data => {
            if (data.subscriptionData.data?.crm_reward?.length) {
               initiatePriority({
                  tablename: 'reward',
                  schemaname: 'crm',
                  data: data.subscriptionData.data.crm_reward,
               })
            }
            setRewardInfoArray(data.subscriptionData.data.crm_reward)
         },
      }
   )
   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   const [fetchReward, { loading: listLoading, data }] = useLazyQuery(
      REWARD_DATA,
      {
         onCompleted: data => {
            console.log(data.crm_reward_by_pk)
            setRewardTunnelInfo(data.crm_reward_by_pk)
            setConditionId(data.crm_reward_by_pk.conditionId)
            setRewardId(data.crm_reward_by_pk.id)
            openRewardTunnel(1)
         },
         onError: error => {
            toast.error('Something went wrong')
            logger(error)
         },
         fetchPolicy: 'cache-and-network',
      }
   )

   const [deleteReward] = useMutation(DELETE_REWARD, {
      onCompleted: () => {
         toast.success('Reward deleted!')
      },
      onError: error => {
         toast.error('Something went wrong')
         console.log(error)
         logger(error)
      },
   })

   const addCondition = id => {
      setConditionId(id)
   }

   const EditRewardDetails = id => {
      fetchReward({
         variables: {
            id,
         },
      })
   }

   // Handler
   const deleteHandler = rewardInfo => {
      console.log(rewardInfo)
      if (
         window.confirm(
            `Are you sure you want to delete reward - ${rewardInfo.type} ?`
         )
      ) {
         deleteReward({
            variables: {
               id: rewardInfo.id,
            },
         })
      }
   }

   if (loading || listLoading) return <InlineLoader />

   return (
      <>
         <RewardsTunnel
            closeTunnel={closeTypeTunnel}
            openTunnel={openTypeTunnel}
            tunnels={typeTunnels}
            openRewardTunnel={openRewardTunnel}
            getRewardId={id => setRewardId(id)}
            getConditionId={id => setConditionId(id)}
         />
         <RewardDetailsTunnel
            closeTunnel={closeRewardTunnel}
            openTunnel={openRewardTunnel}
            tunnels={rewardTunnels}
            openConditionTunnel={openConditionTunnel}
            updateConditionId={val => setConditionId(val)}
            conditionId={conditionId}
            rewardId={rewardId}
            rewardInfo={rewardTunnelInfo}
            closeRewardTypeTunnel={layer => closeTypeTunnel(layer)}
         />
         <Conditions
            id={conditionId}
            onSave={id => addCondition(id)}
            tunnels={conditionTunnels}
            openTunnel={openConditionTunnel}
            closeTunnel={closeConditionTunnel}
         />
         {rewardInfoArray.length > 0 ? (
            <StyledContainer>
               <StyledRow>
                  <Flex container alignItems="center">
                     <Text as="title">Reward Information</Text>
                     <Tooltip identifier="campaign_reward_info" />
                  </Flex>
                  {rewardInfoArray.length > 1 && (
                     <Form.Checkbox
                        name="t&c"
                        value={context.checkbox}
                        onChange={context.updateCheckbox}
                     >
                        Allow multiple rewards
                     </Form.Checkbox>
                  )}
               </StyledRow>

               <DragNDrop
                  list={rewardInfoArray}
                  droppableId="campaignRewardsId"
                  tablename="reward"
                  schemaname="crm"
               >
                  {rewardInfoArray.map(rewardInfo => {
                     return (
                        <RewardDiv key={rewardInfo.id}>
                           <Text as="subtitle">{rewardInfo.type} </Text>
                           <StyledRow>
                              <IconButton
                                 type="ghost"
                                 onClick={() =>
                                    EditRewardDetails(rewardInfo.id)
                                 }
                              >
                                 <EditIcon color="#555B6E" />
                              </IconButton>
                              <IconButton
                                 type="ghost"
                                 onClick={() => deleteHandler(rewardInfo)}
                              >
                                 <DeleteIcon color="#555B6E" />
                              </IconButton>
                           </StyledRow>
                        </RewardDiv>
                     )
                  })}
               </DragNDrop>

               <StyledRow>
                  <ComboButton type="ghost" onClick={() => openTypeTunnel(1)}>
                     Add More Reward
                     <PlusIcon color="#00a7e1" />
                  </ComboButton>
               </StyledRow>
            </StyledContainer>
         ) : (
            <ButtonTile
               type="primary"
               size="sm"
               text="Add Rewards"
               onClick={() => openTypeTunnel(1)}
               style={{ margin: '20px 0' }}
            />
         )}
      </>
   )
}

export default Rewards
