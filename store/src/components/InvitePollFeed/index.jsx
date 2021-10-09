import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Flex } from '@dailykit/ui'
import { Wrapper } from './styles'
import { Card } from '../Card'
import Button from '../Button'
import Booking from '../Booking'
import Filler from '../Filler'
import Modal from '../Modal'
import useModal from '../useModal'
import { theme } from '../../theme'
import { dataArray } from '../../fakeData'
import { useWindowDimensions, getDateWithTime } from '../../utils'
export default function InvitePollFeed({ poll }) {
   const router = useRouter()
   const [selectedOption, setSelectedOption] = useState(null)
   const {
      ModalContainer: ParticipantModalContainer,
      isShow: isParticipantsModalShow,
      show: showParticipantsModal,
      hide: hideParticipantsModal
   } = useModal()
   const {
      ModalContainer: BookingModalContainer,
      isShow: isBookingModalShow,
      show: showBookingModal,
      hide: hideBookingModal
   } = useModal()
   const cartDetails = {
      ...poll,
      experience: {
         ...poll?.experienceInfo?.experience,
         experienceClasses: [poll?.experienceInfo]
      }
   }
   const { width } = useWindowDimensions()

   const onClickHandler = ({ option }) => {
      e.preventD
      setSelectedOption(option)
      showBookingModal()
   }

   return (
      <Wrapper>
         {/* <Flex flexDirection="column" container justifyContent="center"> */}
         <Card
            customHeight={width > 769 ? '280px' : '204px'}
            customWidth={width > 769 ? '380px' : '100%'}
            type="poll"
            data={cartDetails}
            onCardClick={() => router.push(`/myPolls/${poll?.id}`)}
            bookingHandler={onClickHandler}
         />
         {/* </Flex> */}

         <BookingModalContainer isShow={isBookingModalShow}>
            <Modal
               isOpen={isBookingModalShow}
               type="popup"
               close={hideBookingModal}
            >
               <div style={{ padding: '1rem' }}>
                  <Booking
                     experienceBookingId={poll?.id}
                     experienceId={selectedOption?.experienceClass?.id}
                  />
               </div>
            </Modal>
         </BookingModalContainer>
      </Wrapper>
   )
}
