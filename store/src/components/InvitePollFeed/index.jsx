import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Flex } from "@dailykit/ui";
import { Wrapper } from "./styles";
import { Card } from "../Card";
import Button from "../Button";
import Booking from "../Booking";
import Filler from "../Filler";
import Modal from "../Modal";
import useModal from "../useModal";
import { theme } from "../../theme";
import { dataArray } from "../../fakeData";
import { useWindowDimensions, getDateWithTime } from "../../utils";
export default function InvitePollFeed({ poll }) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState(null);
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
  const cartDetials = {
    experience: {
      ...poll?.experienceInfo?.experience,
      experienceClasses: [poll?.experienceInfo],
    },
  };
  const { width } = useWindowDimensions();

  const onClickHandler = ({ option, type }) => {
    setSelectedOption(option);
    if (type === "book") {
      showBookingModal();
    } else {
      showParticipantsModal();
    }
  };

  return (
    <Wrapper>
      <div className="flex-container">
        <Flex
          flexDirection="column"
          container
          justifyContent="center"
          width="380px"
        >
          <Card
            customHeight={width > 769 ? "280px" : "204px"}
            customWidth="100%"
            type="normalExperience"
            data={cartDetials}
            onCardClick={() => router.push(`/myPolls/${poll?.id}`)}
          />
          <div className="share-btn-div">
            <Link href="/pollInvite" style={{ width: "100%" }}>
              <Button className="custom-share-btn">
                SHARE AVAILABILITY POLL
              </Button>
            </Link>
          </div>
        </Flex>
        <div className="slots-div">
          <Flex container justifyContent="space-between" margin="0 0 20px 0">
            <p>Slots ({poll?.bookingOptionsCount})</p>
            <p>poll expires on {getDateWithTime(poll?.cutoffTime)}</p>
          </Flex>
          <div className="slot-div-wrap">
            {poll?.experienceBookingOptions.map((option) => {
              return (
                <div key={option?.id} className="slot-div">
                  <Flex
                    container
                    alignItems="center"
                    justifyContent="space-between"
                    margin="0 0 12px 0"
                  >
                    <p className="slot-info-time">
                      {getDateWithTime(option?.experienceClass?.startTimeStamp)}
                    </p>
                    <p
                      className="vote-head"
                      onClick={() => onClickHandler({ option, type: "vote" })}
                    >
                      {option?.voting?.aggregate?.count} votes
                    </p>
                  </Flex>
                  <p
                    className="book-slot"
                    onClick={() => onClickHandler({ option, type: "book" })}
                  >
                    Book Slot
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <ParticipantModalContainer isShow={isParticipantsModalShow}>
        <Modal
          isOpen={isParticipantsModalShow}
          type={width > 769 ? "sideDrawer" : "bottomDrawer"}
          close={hideParticipantsModal}
        >
          <div className="voters-div">
            <h1 className="heading-h1">Participants Voted for this Option</h1>
            {selectedOption?.voters.length > 0 ? (
              selectedOption?.voters.map((voter, index) => {
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
          </div>
        </Modal>
      </ParticipantModalContainer>
      <BookingModalContainer isShow={isBookingModalShow}>
        <Modal
          isOpen={isBookingModalShow}
          type={width > 769 ? "sideDrawer" : "bottomDrawer"}
          close={hideBookingModal}
        >
          <div style={{ padding: "1rem" }}>
            <Booking
              experienceBookingId={poll?.id}
              experienceId={selectedOption?.experienceClass?.id}
            />
          </div>
        </Modal>
      </BookingModalContainer>
    </Wrapper>
  );
}
