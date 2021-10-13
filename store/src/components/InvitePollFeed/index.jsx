import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Wrapper } from './styles'
import { Card } from '../Card'
import Booking from '../Booking'
import Modal from '../Modal'
import { useWindowDimensions } from '../../utils'
export default function InvitePollFeed({ poll }) {
   const router = useRouter()
   const [isModalVisible, setIsModalVisible] = useState(false)
   const [selectedOption, setSelectedOption] = useState(null)
   const cartDetails = {
      ...poll,
      experience: {
         ...poll?.experienceInfo?.experience,
         experienceClasses: [poll?.experienceInfo]
      }
   }
   const { width } = useWindowDimensions()

   const onClickHandler = ({ option }) => {
      setSelectedOption(option)
      openModal()
   }

   const openModal = () => {
      setIsModalVisible(true)
   }

   const closeModal = () => {
      setIsModalVisible(false)
   }

   return (
      <Wrapper>
         <Card
            customHeight={width > 769 ? '280px' : '204px'}
            customWidth={width > 769 ? '380px' : '100%'}
            type="poll"
            data={cartDetails}
            onCardClick={() => router.push(`/dashboard/myPolls/${poll?.id}`)}
            bookingHandler={onClickHandler}
         />

         <Modal isOpen={isModalVisible} type="popup" close={closeModal}>
            <div style={{ padding: '1rem' }}>
               <Booking
                  experienceBookingId={poll?.id}
                  experienceId={selectedOption?.experienceClass?.id}
               />
            </div>
         </Modal>
      </Wrapper>
   )
}
