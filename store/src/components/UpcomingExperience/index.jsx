import React, { useState } from "react";
import { Flex } from "@dailykit/ui";
import { useRouter } from "next/router";
import { Wrapper } from "./styles";
import { Card } from "../Card";
import {
  AcceptCicleIcon,
  AddCircleIcon,
  GiftIcon,
  RejectCircleIcon,
  PlaneIcon,
} from "../Icons";
import { theme } from "../../theme";
import { dataArray } from "../../fakeData";
import { useWindowDimensions } from "../../utils";
import Modal from "../Modal";
import useModal from "../useModal";
import InviteThrough from "../InviteThrough";

export default function UpcomingExperience({ booking }) {
  const router = useRouter();
  const { ModalContainer, isShow, show, hide } = useModal();
  const { width } = useWindowDimensions();
  const [drawer, setDrawer] = useState(false);
  const cartDetials = {
    experience: {
      ...booking?.experienceInfo?.experience,
      experienceClasses: [booking?.experienceInfo],
    },
  };
  return (
    <Wrapper>
      <Flex container alignItems="flex-start" justifyContent="space-between">
        <h3 className="response-head">
          {booking?.totalRsvpCount}/{booking?.totalParticipants} people
          requested to book
        </h3>
        <span onClick={show} className="icon-span">
          <AddCircleIcon size={theme.sizes.h2} color={theme.colors.textColor} />
        </span>
      </Flex>
      <div className="flex-container">
        <div className="card-wrap">
          <Card
            // customHeight={width > 769 ? "331px" : "251px"}
            customWidth={width > 769 ? "371px" : "auto"}
            type="upcomingExperience"
            data={cartDetials}
            onCardClick={() => router.push(`/myBookings/${booking?.id}`)}
          />
        </div>
        <div style={{ width: "100%" }}>
          {booking?.participants.map((participant, index) => (
            <div className="invite-response-div" key={participant?.id}>
              <div className="response-row-div">
                <div className="response-inside-wrap">
                  <div className="row-content-mv-wrap">
                    <span className="serial-no">{index + 1}</span>
                    <p className="respondee respondee-name">
                      {participant?.email || "Unassigned user"}
                      {/* <span className="admin-tag">Admin</span> */}
                    </p>
                  </div>
                  <div className="row-content-mv-wrap">
                    <p className="respondee">{participant?.email || "N/A"}</p>
                  </div>
                  <div className="row-content-mv-wrap">
                    <p className="respondee respondee-response">
                      {participant?.rsvp ? "BOOKED" : "Not Responded"}
                    </p>
                    <p className="respondee kit-info">
                      <span className="kit-icon">
                        <GiftIcon
                          size={theme.sizes.h8}
                          color={theme.colors.textColor}
                        />
                      </span>
                      Kit added
                    </p>
                  </div>
                </div>
                {participant?.rsvp ? (
                  <div
                    className="row-content-mv-wrap"
                    style={{ marginLeft: "12px", flex: "0" }}
                  >
                    <span className="icon-span">
                      <AcceptCicleIcon
                        size={theme.sizes.h2}
                        color={theme.colors.textColor6}
                      />
                    </span>

                    {/* <span className="icon-span">
                        <RejectCircleIcon
                          size={theme.sizes.h2}
                          color={theme.colors.tertiaryColor}
                        />
                      </span> */}
                  </div>
                ) : (
                  <div
                    className="row-content-mv-wrap"
                    style={{ marginLeft: "12px", flex: "0" }}
                  >
                    <p className="respondee kit-info">
                      <span className="kit-icon">
                        <PlaneIcon
                          size={theme.sizes.h8}
                          color={theme.colors.textColor}
                        />
                      </span>
                      Resend Invite
                    </p>
                  </div>
                )}
              </div>

              {/* empty row for adding new one */}
              {/* <div className="response-row-div">
            <div className="response-inside-wrap">
              <div className="row-content-mv-wrap">
                <span className="serial-no">2.</span>
                <p className="respondee respondee-name empty"></p>
              </div>
              <div className="row-content-mv-wrap">
                <p className="respondee empty"></p>
              </div>
              <div className="row-content-mv-wrap">
                <p className="respondee respondee-response empty"></p>
                <p className="respondee kit-info empty"></p>
              </div>
            </div>
            <div className="row-content-mv-wrap" style={{ flex: "0" }}>
              <span className="icon-span ">
                <AddCircleIcon
                  size={theme.sizes.h2}
                  color={theme.colors.textColor}
                />
              </span>
            </div>
          </div> */}
            </div>
          ))}
        </div>
      </div>
      <ModalContainer isShow={isShow}>
        <Modal
          type={width > 769 ? "sideDrawer" : "bottomDrawer"}
          isOpen={isShow}
          close={hide}
        >
          <InviteThrough onChange={(data) => console.log} />
        </Modal>
      </ModalContainer>
    </Wrapper>
  );
}
