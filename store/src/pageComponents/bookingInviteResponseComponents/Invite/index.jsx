import React, { useState } from "react";
import { Flex } from "@dailykit/ui";
import { Wrapper } from "./styles";
import { Card } from "../../../components";

export default function Invite({ invitedBy, cardData }) {
  console.log("Card", cardData);
  return (
    <Wrapper>
      <h2 className="invitation-head">You're invited!</h2>
      <h2 className="normal-heading">by</h2>
      <img
        className="host-img"
        src="/assets/images/placeholderImage.png"
        alt="host-img"
      />
      <h2 className="host-name-head">{invitedBy?.name || invitedBy?.email}</h2>
      <p className="below-para">wants you to know your availability! </p>
      <Card type="normalExperience" data={cardData} />
    </Wrapper>
  );
}
