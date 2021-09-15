import React, { useContext } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { ButtonTile, Flex, useTunnel, Text, TextButton } from '@dailykit/ui'
import { UPDATE_COUPON } from '../../../../../graphql'
import Conditions from '../../../../../../../shared/components/Conditions'
import { logger } from '../../../../../../../shared/utils'
import { Tooltip } from '../../../../../../../shared/components'
import { StyledContainer } from './styled'
import CouponContext from '../../../../../context/Coupon/CouponForm'

const ConditionComp = () => {
   const context = useContext(CouponContext)
   const [tunnels, openTunnel, closeTunnel] = useTunnel()

   // Mutation
   const [updateCoupon] = useMutation(UPDATE_COUPON, {
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
               visibleConditionId: conditionId,
            },
         },
      })
   }
   return (
      <>
         <Conditions
            id={context.state.visibleConditionId}
            onSave={id => saveInfo(id)}
            tunnels={tunnels}
            openTunnel={openTunnel}
            closeTunnel={closeTunnel}
         />
         {context.state.visibleConditionId ? (
            <StyledContainer>
               <Flex
                  container
                  justifyContent="space-between"
                  margin="8px 0"
                  alignItems="center"
               >
                  <Flex container alignItems="center">
                     <Text as="title">Coupon Condition</Text>
                     <Tooltip identifier="coupon_condition" />
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
