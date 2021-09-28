import React from "react";
import parse from "html-react-parser";
import { Wrapper } from "./styles";
import ReadMoreDiv from "../ReadMoreDiv";

export default function AboutExpert({ expert, expertCategory }) {
  console.log("Expert", expert);
  return (
    <Wrapper>
      <img
        className="expertImg"
        src={
          expert?.assets?.images[0] ||
          `https://ui-avatars.com/api/?name=${expert?.firstName}+${expert?.lastName}&background=fff&color=15171F&size=500&rounded=true`
        }
        alt={`${expert?.firstName} ${expert?.lastName}-img`}
      />
      <h1 className="expertName">{`${expert?.firstName} ${expert?.lastName}`}</h1>
      <p className="expertCategory">{expertCategory || "N/A"}</p>
      <p className="expertExp">
        {expert?.experience_experts_aggregate?.aggregate?.count || 0}{" "}
        Experiences
      </p>
      <ReadMoreDiv>
        <p className="expertDesc">{parse(expert?.description || "")}</p>
      </ReadMoreDiv>
    </Wrapper>
  );
}
