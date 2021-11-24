import React from 'react'
import styled from 'styled-components'
import FooterButton from './FooterButton'
import PollDeadline from './PollDeadline'
import { ChevronLeft, SEO } from '../../components'
import { SelectClass } from '../../components/Booking/components'
import { theme } from '../../theme'
import { useWindowDimensions } from '../../utils'

import { usePoll } from '../../Providers'

export default function SendPollComp({ experienceId, closeSendPollModal }) {
   console.log('SendPollComp', experienceId)
   const { width } = useWindowDimensions()
   const { state: pollState, previousPollingSteps } = usePoll()
   const { pollingStepsIndex } = pollState

   return (
      <Wrapper>
         {/* <h1 className="heading text2">Send Poll</h1> */}
         {pollingStepsIndex === 1 && (
            <span
               className="previousBtn"
               onClick={() => previousPollingSteps(pollingStepsIndex)}
            >
               <ChevronLeft
                  size={theme.sizes.h4}
                  color={theme.colors.textColor7}
               />
            </span>
         )}
         {/* booking type form */}
         {pollingStepsIndex === 0 && (
            <SelectClass
               experienceBookingId={null}
               experienceId={experienceId}
               isMulti={true}
            />
         )}
         {/* add participants form  */}
         {pollingStepsIndex === 1 && <PollDeadline />}

         {/* footer  */}
         <FooterButton closeSendPollModal={closeSendPollModal} />
      </Wrapper>
   )
}

const Wrapper = styled.div`
   width: 100%;
   height: 100%;
   .previousBtn {
      margin: 0;
      position: -webkit-sticky;
      position: sticky;
      top: 8px;
      cursor: pointer;
      :hover {
         svg {
            stroke: ${theme.colors.lightGreyText};
         }
      }
   }
`
