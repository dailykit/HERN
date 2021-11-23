import React, { useState, useEffect } from 'react'
import { useSubscription } from '@apollo/client'
import Link from 'next/link'
import { useToasts } from 'react-toast-notifications'
import { Wrapper } from './styles'
import { InvitePollFeed, NoData } from '../../components'
import { useExperienceInfo } from '../../Providers'
import { isEmpty } from '../../utils'
import { YOUR_BOOKINGS } from '../../graphql'

export default function PollRecyclerView({ keycloakId }) {
   const { isLoading, setExperienceId } = useExperienceInfo()
   const { addToast } = useToasts()
   const [polls, setPolls] = useState([])
   const [isPollsLoading, setIsPollsLoading] = useState(true)
   const { error: hasPollsError } = useSubscription(YOUR_BOOKINGS, {
      variables: {
         where: {
            hostKeycloakId: {
               _eq: keycloakId
            },
            experienceClassId: {
               _is_null: true
            }
         },
         pollOptionLimit: 1
      },
      onSubscriptionData: ({
         subscriptionData: { data: { experienceBookings = [] } = {} } = {}
      } = {}) => {
         if (experienceBookings.length) {
            const updatedPolls = experienceBookings.map(booking => {
               return {
                  id: booking?.id,
                  cutoffTime: booking?.cutoffTime,
                  created_at: booking?.created_at,
                  bookingOptionsCount: booking?.experienceBookingOptions.length,
                  experienceBookingOptions: booking?.experienceBookingOptions,
                  experienceInfo:
                     booking?.experienceBookingOptions[0]?.experienceClass
               }
            })
            setPolls(updatedPolls)
         }
         setIsPollsLoading(false)
      }
   })

   useEffect(() => {
      if (polls.length) {
         setExperienceId(polls[0]?.experienceInfo?.experience?.id)
      }
   }, [polls])

   if (hasPollsError) {
      setIsPollsLoading(false)
      console.log(hasPollsError)
      addToast('Something went wrong!', { appearance: 'error' })
   }
   return (
      <Wrapper shouldVisible={Boolean(polls.length)}>
         <div className="wrapper-div">
            <div className="recycler-heading-wrapper">
               <h3 className="recycler-heading text1">MY POLLS</h3>
               <Link href="/dashboard/myPolls">
                  <a className="redirectClass">
                     <span className="special-underline">View All</span>
                  </a>
               </Link>
            </div>
            <div className="card-grid">
               {!isEmpty(polls) ? (
                  polls.map(poll => (
                     <InvitePollFeed key={poll?.id} poll={poll} />
                  ))
               ) : (
                  <NoData message="No Polls" />
               )}
            </div>
         </div>
      </Wrapper>
   )
}
