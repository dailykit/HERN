import React from 'react'
import { Text, Flex } from '@dailykit/ui'
import { StyleContainer, StyledDiv, StyledHeading, Label } from './styled'
import { UserIcon, CalendarIcon } from '../../../../shared/assets/icons'
import { rruleToText } from '../../Utils'
import { Tooltip } from '../../../../shared/components'

const SubscriptionCard = ({ planData }) => (
   <StyleContainer>
      <StyledHeading>
         <Flex container alignItems="center">
            <Text as="p">Subscriber</Text>
            <Tooltip identifier="subscriber_info" />
         </Flex>
      </StyledHeading>
      {planData.isSubscriber ? (
         <>
            <StyledDiv>
               <Text as="p">
                  {planData?.subscription?.subscriptionItemCount?.plan
                     ?.subscriptionTitle?.title || 'N/A'}{' '}
                  <UserIcon size="16" />{' '}
                  {planData?.subscription?.subscriptionItemCount?.plan
                     ?.servingSize || '-'}
               </Text>
            </StyledDiv>
            <StyledDiv>
               <Text as="p">
                  Item count:{' '}
                  {planData?.subscription?.subscriptionItemCount?.count}
               </Text>
            </StyledDiv>
            <StyledDiv>
               <Text as="p">
                  <CalendarIcon size="14" />{' '}
                  {rruleToText(planData?.subscription?.rrule)}
               </Text>
            </StyledDiv>
            {!!Object.keys(planData.pausePeriod).length && (
               <StyledDiv col>
                  <Text as="subtitle">Pause Period</Text>
                  <Text as="p">
                     {`${planData.pausePeriod.startDate} - ${planData.pausePeriod.endDate}`}
                  </Text>
               </StyledDiv>
            )}
            {planData.isSubscriptionCancelled && (
               <StyledDiv col>
                  <Label>Subscription Cancelled</Label>
                  <Text as="subtitle">Reason</Text>
                  <Text as="p">
                     {planData.subscriptionCancellationReason || '-'}
                  </Text>
               </StyledDiv>
            )}
         </>
      ) : (
         <Text as="p">
            <em style={{ color: '#C4C4C4' }}>Not a subscriber yet!</em>
         </Text>
      )}
   </StyleContainer>
)
export default SubscriptionCard
