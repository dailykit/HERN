import React, { useEffect, useState } from 'react'
import { OptionDiv, VotersDiv } from './styles'
import Modal from '../../../Modal'
import Filler from '../../../Filler'
import {
   isExpired,
   getDate,
   getTime,
   useWindowDimensions
} from '../../../../utils'
import Booking from '../../../Booking'
import { useExperienceInfo } from '../../../../Providers'

export default function BookingOption({
   experienceBooking,
   option,
   pollCutOffTime
}) {
   const { width } = useWindowDimensions()
   const { updateExperienceInfo } = useExperienceInfo()
   const [isBookingModalVisible, setIsBookingModalVisible] = useState(false)
   const [isParticipantsModalVisible, setIsParticipantsModalVisible] =
      useState(false)
   const [isClassExpired, setIsClassExpired] = useState(false)

   const bookSlotHandler = async (experienceClass, voters = []) => {
      await updateExperienceInfo({
         participants: voters.length,
         bookingStepsIndex: 1,
         experienceBookingDetails: {
            id: experienceBooking.id,
            experienceClassId: experienceClass?.id,
            experienceClassTypeId:
               experienceClass?.privateExperienceClassTypeId,
            cartId: experienceBooking?.cartId,
            voters
         }
      })
      openBookingModal()
   }

   const openBookingModal = () => {
      setIsBookingModalVisible(true)
   }
   const closeBookingModal = () => {
      setIsBookingModalVisible(false)
   }
   const openParticipantsModal = () => {
      setIsParticipantsModalVisible(true)
   }

   const closeParticipantsModal = () => {
      setIsParticipantsModalVisible(false)
   }

   useEffect(() => {
      if (pollCutOffTime) {
         setIsClassExpired(
            isExpired(option?.experienceClass?.startTimeStamp, pollCutOffTime)
         )
      }
   }, [pollCutOffTime, option])
   return (
      <OptionDiv>
         <div className="slot-div">
            <div className="slots-wrapper">
               <p className="slot-info-time">
                  {getDate(option?.experienceClass?.startTimeStamp)},{' '}
                  {getTime(option?.experienceClass?.startTimeStamp)}
               </p>
               <button onClick={openParticipantsModal} className="vote-head">
                  {option?.voting?.aggregate?.count} votes
               </button>
            </div>
            <div className="booking-div">
               <button
                  disabled={isClassExpired}
                  title={isClassExpired && 'This class has expired'}
                  className="book-slot"
                  onClick={() =>
                     bookSlotHandler(option?.experienceClass, option?.voters)
                  }
               >
                  Book Slot
               </button>
            </div>
         </div>
         <Modal
            isOpen={isParticipantsModalVisible}
            type={width > 769 ? 'sideDrawer' : 'bottomDrawer'}
            close={closeParticipantsModal}
         >
            <VotersDiv>
               <h1 className="heading-h1">
                  Participants Voted for this Option
               </h1>
               {option?.voters.length > 0 ? (
                  option?.voters.map((voter, index) => {
                     return (
                        <div key={voter?.id} className="voter-info">
                           <p>
                              <span>{index + 1}.</span>
                              {voter?.participant?.email}
                           </p>
                           <p>{voter?.participant?.phone}</p>
                        </div>
                     )
                  })
               ) : (
                  <Filler
                     message="No one has voted for this option yet!"
                     messageSize="18px"
                  />
               )}
            </VotersDiv>
         </Modal>

         <Modal
            isOpen={isBookingModalVisible}
            type={width > 769 ? 'sideDrawer' : 'bottomDrawer'}
            close={closeBookingModal}
         >
            <div style={{ padding: '1rem' }}>
               <Booking experienceId={option?.experienceClass?.experienceId} />
            </div>
         </Modal>
      </OptionDiv>
   )
}
