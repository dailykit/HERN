import React, { useEffect, useState } from "react";
import { Wrapper } from "./styles";
import { Invite, BookingOption } from "./components";
import { getDate, isExpired } from "../../utils";

export default function InvitePoll({ experienceBooking }) {
  const [isPollClosed, setIsPollClosed] = useState(null);

  useEffect(() => {
    if (experienceBooking?.cutoffTime) {
      setIsPollClosed(isExpired(experienceBooking?.cutoffTime, new Date()));
    }
  }, [experienceBooking]);

  return (
    <Wrapper>
      <p className="invite-h1-head">Share the poll</p>

      <Invite
        experienceBooking={experienceBooking}
        isPollClosed={isPollClosed}
      />

      <div className="slots-wrapper-1">
        <p className="slot-info-head">
          {experienceBooking?.experienceBookingOptions.length} Slots
        </p>
        <p className="expiry-head">
          poll expires on{" "}
          {experienceBooking?.cutoffTime &&
            getDate(experienceBooking?.cutoffTime)}
        </p>
      </div>
      {experienceBooking?.experienceBookingOptions.map((option) => {
        return (
          <BookingOption
            key={option?.id}
            experienceBooking={experienceBooking}
            option={option}
            pollCutOffTime={experienceBooking?.cutoffTime}
          />
        );
      })}
    </Wrapper>
  );
}
