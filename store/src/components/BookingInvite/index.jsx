import React, { useEffect, useState } from "react";
import { useToasts } from "react-toast-notifications";
import { useSubscription } from "@apollo/client";
import { Wrapper, GridView } from "./styles";
import { Invite, ManageParticipant } from "./components";
import {
  HorizontalTabs,
  HorizontalTab,
  HorizontalTabList,
  HorizontalTabPanels,
  HorizontalTabPanel,
} from "../Tab";
import { Card } from "../Card";
import InlineLoader from "../InlineLoader";
import { isExpired } from "../../utils";
import { EXPERIENCE_BOOKING } from "../../graphql";

export default function BookingInvite({ experienceBookingId }) {
  const { addToast } = useToasts();
  const [experienceBooking, setExperienceBooking] = useState({});
  const [isPollClosed, setIsPollClosed] = useState(null);
  const [isExperienceBookingLoading, setIsExperienceBookingLoading] = useState(
    true
  );
  const { error: hasExperienceBookingError } = useSubscription(
    EXPERIENCE_BOOKING,
    {
      skip: !experienceBookingId,
      variables: {
        id: experienceBookingId,
      },
      onSubscriptionData: ({
        subscriptionData: {
          data: { experienceBooking: bookingData = {} } = {},
        } = {},
      } = {}) => {
        if (bookingData && Object.keys(bookingData).length) {
          setExperienceBooking(bookingData);
        }
        setIsExperienceBookingLoading(false);
      },
    }
  );

  useEffect(() => {
    if (experienceBooking?.cutoffTime) {
      setIsPollClosed(isExpired(experienceBooking?.cutoffTime, new Date()));
    }
  }, [experienceBooking]);

  if (hasExperienceBookingError) {
    console.log(hasExperienceBookingError);
    setIsExperienceBookingLoading(false);
    addToast("Something went wrong!", { appearance: "error" });
  }
  if (isExperienceBookingLoading) {
    return <InlineLoader />;
  }

  return (
    <Wrapper>
      {/* <p className="invite-h1-head">Invite others to this experience booking</p>
      <p className="invite-create_at">
        Booked At : {getDate(experienceBooking?.created_at)},
        {getTime(experienceBooking?.created_at)}
      </p>
      <GridView>
        <Card
          boxShadow="true"
          type="normalExperience"
          data={experienceBooking?.experienceClass}
        />
      </GridView> */}
      <HorizontalTabs>
        <HorizontalTabList>
          <HorizontalTab>Invite Participants</HorizontalTab>
          <HorizontalTab>Manage Participants</HorizontalTab>
        </HorizontalTabList>
        <HorizontalTabPanels>
          <HorizontalTabPanel>
            <Invite
              experienceBooking={experienceBooking}
              isPollClosed={isPollClosed}
            />
          </HorizontalTabPanel>
          <HorizontalTabPanel>
            <ManageParticipant experienceBookingId={experienceBooking?.id} />
          </HorizontalTabPanel>
        </HorizontalTabPanels>
      </HorizontalTabs>
    </Wrapper>
  );
}
