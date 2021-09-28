import React, { useState } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { theme } from "../../theme";
import { Booking, BackDrop, Layout, SEO } from "../../components";
import { useWindowDimensions } from "../../utils";
import { getNavigationMenuItems } from "../../lib";

export default function BookingPage({
  experienceId,
  navigationMenuItems = [],
}) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [isCelebrating, setIsCelebrating] = useState(false);
  const stopCelebration = () => {
    setTimeout(setIsCelebrating(false), 12000);
    router.push("/myBookings");
  };
  const startCelebration = () => {
    setIsCelebrating(true);
    setTimeout(stopCelebration, 5000);
  };
  return (
    <Layout navigationMenuItems={navigationMenuItems}>
      {width < 769 && <SEO title="Booking" />}
      <Wrap>
        <BackDrop show={isCelebrating}>
          <div className="booking-done">
            <img src="/assets/images/celebration.png" alt="celebration-emoji" />
            <p>Your're BOOKED!</p>
          </div>
        </BackDrop>
        <Booking
          isCelebrating={isCelebrating}
          onBooking={startCelebration}
          experienceId={experienceId}
        />
      </Wrap>
    </Layout>
  );
}

export const getStaticProps = async () => {
  const domain = "primanti.dailykit.org";
  const navigationMenuItems = await getNavigationMenuItems(domain);
  return {
    props: {
      navigationMenuItems,
    },
  };
};

const Wrap = styled.div`
  .booking-done {
    margin-top: 4rem;
    padding: 1rem;
    img {
      width: 94px;
      height: 94px;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
    p {
      font-size: ${theme.sizes.h3};
      font-weight: 700;
      color: ${theme.colors.textColor4};
      text-align: center;
    }
  }
`;
