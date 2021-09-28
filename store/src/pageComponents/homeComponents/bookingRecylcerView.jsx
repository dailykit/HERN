import React, { useState, useEffect } from "react";
import { useSubscription } from "@apollo/client";
import { useToasts } from "react-toast-notifications";
import Link from "next/link";
import { Wrapper } from "./styles";
import { YOUR_BOOKINGS } from "../../graphql";
import { UpcomingExperience, InlineLoader } from "../../components";
import { useExperienceInfo } from "../../Providers";
export default function BookingRecyclerView({ keycloakId }) {
  const { addToast } = useToasts();
  const [bookings, setBookings] = useState([]);
  const [isBookingLoading, setIsBookingLoading] = useState(true);
  const { isLoading, setExperienceId } = useExperienceInfo();
  const { error: hasBookingsError } = useSubscription(YOUR_BOOKINGS, {
    variables: {
      where: {
        hostKeycloakId: {
          _eq: keycloakId,
        },
        experienceClassId: {
          _is_null: false,
        },
        _or: [
          {
            parentCart: {
              cartPayments: {
                paymentStatus: {
                  _eq: "SUCCEEDED",
                },
              },
            },
          },
          {
            experienceClass: {
              experienceBookingId: {
                _is_null: false,
              },
            },
          },
        ],
      },
    },
    onSubscriptionData: ({
      subscriptionData: { data: { experienceBookings = [] } = {} } = {},
    } = {}) => {
      if (experienceBookings.length) {
        const updatedBookings = experienceBookings.map((booking) => {
          return {
            id: booking?.id,
            cutoffTime: booking?.cutoffTime,
            created_at: booking?.created_at,
            experienceClassId: booking?.experienceClassId,
            experienceInfo: booking?.experienceClass,
            cartInfo: booking?.parentCart,
            participants: booking?.participants,
            totalRsvpCount: booking?.participants.filter((participant) =>
              Boolean(participant.rsvp)
            ).length,
            totalParticipants: booking?.participants?.length,
          };
        });
        setBookings(updatedBookings.slice(0, 2)); // set top 2 bookings, to avoid too many in home page
      }
      setIsBookingLoading(false);
    },
  });

  useEffect(() => {
    console.log("Booking Length", bookings);
    if (bookings.length) {
      setExperienceId(bookings[0]?.experienceInfo?.experience?.id);
    }
  }, [bookings]);

  if (hasBookingsError) {
    console.error(hasBookingsError);
    setIsBookingLoading(false);
    addToast("Somthing went wrong!", { appearance: "error" });
  }

  if ((bookings.length > 0 && isLoading) || isBookingLoading)
    return <InlineLoader />;

  return (
    <Wrapper shouldVisible={Boolean(bookings.length)}>
      <h3 className="experienceHeading"> Upcoming Experience!</h3>
      <div className="wrapper-div">
        {bookings.map((booking) => (
          <UpcomingExperience key={booking?.id} booking={booking} />
        ))}
      </div>
      <Link href="/myBookings">
        <a className="redirectClass">
          <span className="special-underline">View more bookings</span>
        </a>
      </Link>
    </Wrapper>
  );
}
