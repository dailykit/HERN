import React, { useContext } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { ButtonTile, useTunnel, Text, TextButton, Flex } from '@dailykit/ui'
import { UPDATE_CAMPAIGN } from '../../../../../graphql'
import Conditions from '../../../../../../../shared/components/Conditions'
import { Tooltip } from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { StyledContainer } from './styled'
import CampaignContext from '../../../../../context/Campaign/CampaignForm'
const ConditionComp = () => {
   const context = useContext(CampaignContext)
   const [tunnels, openTunnel, closeTunnel] = useTunnel()

   // Mutation
   const [updateCoupon] = useMutation(UPDATE_CAMPAIGN, {
      onCompleted: () => {
         toast.success('Updated!')
         closeTunnel(1)
      },
      onError: error => {
         toast.error('Something went wrong')
         closeTunnel(1)
         logger(error)
      },
   })

   // Handlers
   const saveInfo = conditionId => {
      updateCoupon({
         variables: {
            id: context.state.id,
            set: {
               conditionId,
            },
         },
      })
   }
   return (
      <>
         <Conditions
            id={context.state.conditionId}
            onSave={id => saveInfo(id)}
            tunnels={tunnels}
            openTunnel={openTunnel}
            closeTunnel={closeTunnel}
         />
         {context.state.conditionId ? (
            <StyledContainer>
               <Flex
                  container
                  justifyContent="space-between"
                  margin="8px 0"
               >
                  <Flex container alignItems="center">
                     <Text as="title">Campaign Condition</Text>
                     <Tooltip identifier="campaign_condition" />
                  </Flex>
                  <TextButton
                     type="outline"
                     size="sm"
                     onClick={() => openTunnel(1)}
                  >
                     View/Edit
                  </TextButton>
               </Flex>
            </StyledContainer>
         ) : (
            <ButtonTile
               type="primary"
               size="sm"
               text="Add Coupon's Condition"
               style={{ margin: '20px 0' }}
               onClick={() => openTunnel(1)}
            />
         )}
      </>
   )
}

export default ConditionComp
