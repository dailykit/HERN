import React from 'react'
import { Wrapper } from './styles'
import PollCard from '../../PollCard'

export default function Invite({ invitedBy, cardData }) {
   return (
      <Wrapper>
         <PollCard experienceInfo={cardData} />
      </Wrapper>
   )
}
