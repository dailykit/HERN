import React, { useEffect, useState } from 'react'
import { Wrapper } from './styles'
import { Invite, BookingOption } from './components'
import { getDate, isExpired } from '../../utils'

export default function InvitePoll({ experienceBooking }) {
   const [isPollClosed, setIsPollClosed] = useState(null)

   useEffect(() => {
      if (experienceBooking?.cutoffTime) {
         setIsPollClosed(isExpired(experienceBooking?.cutoffTime, new Date()))
      }
   }, [experienceBooking])

   return (
      <Wrapper>
         <p className="invite-heading-h1 text4">Share poll</p>
         <Invite
            experienceBooking={experienceBooking}
            isPollClosed={isPollClosed}
         />

         <div className="slots-wrapper-1">
            <p className="proxinova_text slot-count text6">
               {experienceBooking?.experienceBookingOptions.length} Slots
            </p>
            <p className="proxinova_text text8 expiry-head">
               poll expires on{' '}
               {experienceBooking?.cutoffTime &&
                  getDate(experienceBooking?.cutoffTime)}
            </p>
         </div>
         {experienceBooking?.experienceBookingOptions.map(option => {
            return (
               <BookingOption
                  key={option?.id}
                  experienceBooking={experienceBooking}
                  option={option}
                  pollCutOffTime={experienceBooking?.cutoffTime}
               />
            )
         })}
      </Wrapper>
   )
}
