import React, { useEffect, useState } from "react";
import { OptionDiv, VotersDiv } from "./styles";
import Modal from "../../../Modal";
import useModal from "../../../useModal";
import Filler from "../../../Filler";
import {
  isExpired,
  getDate,
  getTime,
  useWindowDimensions,
} from "../../../../utils";
import Booking from "../../../Booking";
import { useExperienceInfo } from "../../../../Providers";

export default function BookingOption({
  experienceBooking,
  option,
  pollCutOffTime,
}) {
  const {
    ModalContainer: ParticipantModalContainer,
    isShow: isParticipantsModalShow,
    show: showParticipantsModal,
    hide: hideParticipantsModal,
  } = useModal();
  const {
    ModalContainer: BookingModalContainer,
    isShow: isBookingModalShow,
    show: showBookingModal,
    hide: hideBookingModal,
  } = useModal();
  const { width } = useWindowDimensions();
  const { updateExperienceInfo } = useExperienceInfo();
  const [isClassExpired, setIsClassExpired] = useState(false);

  const bookSlotHandler = async (experienceClass, voters = []) => {
    await updateExperienceInfo({
      participants: voters.length,
      bookingStepsIndex: 1,
      experienceBookingDetails: {
        id: experienceBooking.id,
        experienceClassId: experienceClass?.id,
        experienceClassTypeId: experienceClass?.privateExperienceClassTypeId,
        cartId: experienceBooking?.cartId,
        voters,
      },
    });
    showBookingModal();
  };

  useEffect(() => {
    if (pollCutOffTime) {
      setIsClassExpired(
        isExpired(option?.experienceClass?.startTimeStamp, pollCutOffTime)
      );
    }
  }, [pollCutOffTime, option]);
  return (
    <OptionDiv>
      <div className="slot-div">
        <div className="slots-wrapper">
          <p className="slot-info-time">
            {getDate(option?.experienceClass?.startTimeStamp)},{" "}
            {getTime(option?.experienceClass?.startTimeStamp)}
          </p>
          <button onClick={showParticipantsModal} className="vote-head">
            {option?.voting?.aggregate?.count} votes
          </button>
        </div>
        <div className="booking-div">
          <button
            disabled={isClassExpired}
            title={isClassExpired && "This class has expired"}
            className="book-slot"
            onClick={() =>
              bookSlotHandler(option?.experienceClass, option?.voters)
            }
          >
            Book Slot
          </button>
        </div>
      </div>
      <ParticipantModalContainer isShow={isParticipantsModalShow}>
        <Modal
          isOpen={isParticipantsModalShow}
          type={width > 769 ? "sideDrawer" : "bottomDrawer"}
          close={hideParticipantsModal}
        >
          <VotersDiv>
            <h1 className="heading-h1">Participants Voted for this Option</h1>
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
                );
              })
            ) : (
              <Filler
                message="No one has voted for this option yet!"
                messageSize="18px"
              />
            )}
          </VotersDiv>
        </Modal>
      </ParticipantModalContainer>

      <BookingModalContainer isShow={isBookingModalShow}>
        <Modal
          isOpen={isBookingModalShow}
          type={width > 769 ? "sideDrawer" : "bottomDrawer"}
          close={hideBookingModal}
        >
          <div style={{ padding: "1rem" }}>
            <Booking experienceId={option?.experienceClass?.experienceId} />
          </div>
        </Modal>
      </BookingModalContainer>
    </OptionDiv>
  );
}
