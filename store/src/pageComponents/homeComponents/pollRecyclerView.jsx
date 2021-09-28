import React, { useState, useEffect } from "react";
import { useSubscription } from "@apollo/client";
import Link from "next/link";
import { useToasts } from "react-toast-notifications";
import { Wrapper } from "./styles";
import { InvitePollFeed } from "../../components";
import { useExperienceInfo } from "../../Providers";
import { YOUR_BOOKINGS } from "../../graphql";
export default function PollRecyclerView({ keycloakId }) {
  const { isLoading, setExperienceId } = useExperienceInfo();
  const { addToast } = useToasts();
  const [polls, setPolls] = useState([]);
  const [isPollsLoading, setIsPollsLoading] = useState(true);
  const { error: hasPollsError } = useSubscription(YOUR_BOOKINGS, {
    variables: {
      where: {
        hostKeycloakId: {
          _eq: keycloakId,
        },
        experienceClassId: {
          _is_null: true,
        },
      },
    },
    onSubscriptionData: ({
      subscriptionData: { data: { experienceBookings = [] } = {} } = {},
    } = {}) => {
      if (experienceBookings.length) {
        const updatedPolls = experienceBookings.map((booking) => {
          return {
            id: booking?.id,
            cutoffTime: booking?.cutoffTime,
            created_at: booking?.created_at,
            bookingOptionsCount: booking?.experienceBookingOptions.length,
            experienceBookingOptions: booking?.experienceBookingOptions,
            experienceInfo:
              booking?.experienceBookingOptions[0]?.experienceClass,
            mostVotedOption: booking.experienceBookingOptions.reduce(
              (prev, current) => {
                return prev?.voting?.aggregate?.count >
                  current?.voting?.aggregate?.count
                  ? prev
                  : current;
              }
            ),
          };
        });
        setPolls(updatedPolls.slice(0, 2));
      }
      setIsPollsLoading(false);
    },
  });

  useEffect(() => {
    if (polls.length) {
      setExperienceId(polls[0]?.experienceInfo?.experience?.id);
    }
  }, [polls]);

  if (hasPollsError) {
    setIsPollsLoading(false);
    console.log(hasPollsError);
    addToast("Something went wrong!", { appearance: "error" });
  }
  return (
    <Wrapper shouldVisible={Boolean(polls.length)}>
      <h3 className="experienceHeading">Available Polls!</h3>
      <div className="wrapper-div">
        {polls.map((poll) => (
          <InvitePollFeed key={poll?.id} poll={poll} />
        ))}
      </div>
      <Link href="/myPolls">
        <a className="redirectClass">
          <span className="special-underline">View more polls</span>
        </a>
      </Link>
    </Wrapper>
  );
}
