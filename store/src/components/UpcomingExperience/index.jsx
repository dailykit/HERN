import React, { useState } from 'react'
import { Flex } from '@dailykit/ui'
import { useRouter } from 'next/router'
import { Wrapper } from './styles'
import { Card } from '../Card'
import { theme } from '../../theme'
import { useWindowDimensions } from '../../utils'

export default function UpcomingExperience({ booking }) {
   const router = useRouter()
   const { width } = useWindowDimensions()
   const cartDetails = {
      ...booking,
      experience: {
         ...booking?.experienceInfo?.experience,
         experienceClasses: [booking?.experienceInfo]
      }
   }
   return (
      <Wrapper>
         <div className="flex-container">
            <div className="card-wrap">
               <Card
                  // customHeight={width > 769 ? "331px" : "251px"}
                  customWidth={width > 769 ? '371px' : 'auto'}
                  type="upcomingExperience"
                  data={cartDetails}
                  onCardClick={() => router.push(`/myBookings/${booking?.id}`)}
               />
            </div>
         </div>
      </Wrapper>
   )
}
