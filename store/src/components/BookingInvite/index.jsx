import React, { useEffect, useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import { useSubscription } from '@apollo/client'
import { Tabs } from 'antd'
import { Wrapper, GridView } from './styles'
import { Invite, ManageParticipant } from './components'
// import {
//    HorizontalTabs,
//    HorizontalTab,
//    HorizontalTabList,
//    HorizontalTabPanels,
//    HorizontalTabPanel
// } from '../Tab'
// import { Card } from '../Card'
import InlineLoader from '../InlineLoader'
import { isExpired } from '../../utils'
import { EXPERIENCE_BOOKING } from '../../graphql'

export default function BookingInvite({ experienceBookingId }) {
   const { addToast } = useToasts()
   const [experienceBooking, setExperienceBooking] = useState({})
   const [isPollClosed, setIsPollClosed] = useState(null)
   const [isExperienceBookingLoading, setIsExperienceBookingLoading] =
      useState(true)
   const { error: hasExperienceBookingError } = useSubscription(
      EXPERIENCE_BOOKING,
      {
         skip: !experienceBookingId,
         variables: {
            id: experienceBookingId
         },
         onSubscriptionData: ({
            subscriptionData: {
               data: { experienceBooking: bookingData = {} } = {}
            } = {}
         } = {}) => {
            if (bookingData && Object.keys(bookingData).length) {
               setExperienceBooking(bookingData)
            }
            setIsExperienceBookingLoading(false)
         }
      }
   )

   useEffect(() => {
      if (experienceBooking?.cutoffTime) {
         setIsPollClosed(isExpired(experienceBooking?.cutoffTime, new Date()))
      }
   }, [experienceBooking])

   if (hasExperienceBookingError) {
      console.log(hasExperienceBookingError)
      setIsExperienceBookingLoading(false)
      addToast('Something went wrong!', { appearance: 'error' })
   }
   if (isExperienceBookingLoading) {
      return <InlineLoader />
   }

   return (
      <Wrapper>
         <div className="card-container">
            <Tabs type="card">
               <Tabs.TabPane tab="Invite Participants" key="1">
                  <Invite
                     experienceBooking={experienceBooking}
                     isPollClosed={isPollClosed}
                  />
               </Tabs.TabPane>
               <Tabs.TabPane tab="Manage Participants" key="2">
                  <ManageParticipant
                     experienceBookingId={experienceBooking?.id}
                  />
               </Tabs.TabPane>
            </Tabs>
         </div>
         {/* <HorizontalTabs>
            <HorizontalTabList>
               <HorizontalTab>Invite Participants</HorizontalTab>
               <HorizontalTab>Manage Participants</HorizontalTab>
            </HorizontalTabList>
            <HorizontalTabPanels>
               <HorizontalTabPanel>
                  <Invite
                     experienceBooking={experienceBooking}
                     isPollClosed={isPollClosed}
                  />
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <ManageParticipant
                     experienceBookingId={experienceBooking?.id}
                  />
               </HorizontalTabPanel>
            </HorizontalTabPanels>
         </HorizontalTabs> */}
      </Wrapper>
   )
}
