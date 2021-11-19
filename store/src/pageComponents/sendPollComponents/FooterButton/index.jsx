import React, { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'
import { FooterBtnWrap } from './styles'
import { Button } from '../../../components'
import { usePoll, useUser, useExperienceInfo } from '../../../Providers'
import { getTimeStamp } from '../../../utils'
import { CREATE_EXPERIENCE_BOOKING } from '../../../graphql'

export default function FooterButton({ confirmNPayHandler }) {
   const { state: pollState, nextPollingSteps } = usePoll()
   const { state: experienceState } = useExperienceInfo()
   const { experience } = experienceState
   const [isDisabled, setIsDisabled] = useState(true)
   const { pollingStepsIndex, cutoffDate, pollOptions } = pollState
   const { state: userState } = useUser()
   const { user = {} } = userState
   const { addToast } = useToasts()
   const router = useRouter()
   const [createExperienceBooking, { loading: isExperienceBookingCreating }] =
      useMutation(CREATE_EXPERIENCE_BOOKING, {
         refetchQueries: ['CART_INFO'],
         onCompleted: ({ createExperienceBooking }) => {
            addToast('Poll is created successfully', {
               appearance: 'success'
            })
            router.push(`/dashboard/myPolls/${createExperienceBooking?.id}`)
         },
         onError: error => {
            addToast('Opps! Something went wrong!', { appearance: 'error' })
            console.log(error)
         }
      })

   const handleNextButtonClick = async () => {
      if (pollingStepsIndex === 1) {
         if (pollOptions.length) {
            const bookingOptions = pollOptions.map(opt => {
               return {
                  experienceClassId: opt?.selectedExperienceClassId
               }
            })
            createExperienceBooking({
               variables: {
                  object: {
                     hostKeycloakId: user?.keycloakId,
                     cutoffTime: getTimeStamp(cutoffDate),
                     experienceId: experience?.id,
                     experienceBookingOptions: {
                        data: bookingOptions
                     },
                     parentCart: {
                        data: {
                           customerKeycloakId: user?.keycloakId
                        }
                     }
                  }
               }
            })
         }
      } else {
         nextPollingSteps(pollingStepsIndex)
      }
   }

   useEffect(() => {
      if (
         !cutoffDate ||
         pollOptions.length === 0 ||
         isExperienceBookingCreating
      ) {
         setIsDisabled(true)
      } else {
         setIsDisabled(false)
      }
   }, [pollOptions, isExperienceBookingCreating, cutoffDate])

   return (
      <FooterBtnWrap>
         <Button
            disabled={
               pollingStepsIndex === 1 ? isDisabled : pollOptions.length === 0
            }
            className="nextBtn text3"
            onClick={handleNextButtonClick}
         >
            {pollingStepsIndex === 1 ? 'SEND AVAILABILITY POLL' : 'Next'}
         </Button>
      </FooterBtnWrap>
   )
}
