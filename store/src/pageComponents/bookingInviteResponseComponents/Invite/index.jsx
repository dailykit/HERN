import React from 'react'
import { Wrapper } from './styles'
import BookingCard from '../../../pageComponents/BookingCard'

export default function Invite({ invitedBy, cardData }) {
   console.log('CardData', cardData)
   return (
      <Wrapper>
         <BookingCard experienceInfo={cardData} showPaymentDetails={false} />
      </Wrapper>
   )
}
