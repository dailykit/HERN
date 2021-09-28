import React from "react";
import { Flex } from "@dailykit/ui";
import { Card, CardImage, CardBody } from "./styles.js";
import { Clock, ChevronRight } from "../../Icons";
import { theme } from "../../../theme";
import { getDateWithTime, getMinute } from "../../../utils";

export default function UpcomingExperienceCard({ cardDetails, ...props }) {
  const { experience } = cardDetails;
  return (
    <Card {...props} onClick={props?.onCardClick}>
      <CardImage>
        <img src={experience?.assets?.images[0]} alt="card-img" />
      </CardImage>
      <CardBody>
        <h2 className="exp-name">{experience?.title}</h2>
        <Flex
          container
          alignItems="center"
          justifyContent="space-between"
          margin="0 0 8px 0"
        >
          <p className="expert-name">
            {experience?.experienceClasses[0]?.experienceClassExpert?.firstName}{" "}
            {experience?.experienceClasses[0]?.experienceClassExpert?.lastName}
          </p>
          <span className="duration">
            <Clock size={theme.sizes.h6} color={theme.colors.textColor4} />
            <span>
              {getMinute(experience?.experienceClasses[0]?.duration)}
              min
            </span>
          </span>
        </Flex>
        <Flex
          container
          alignItems="center"
          justifyContent="space-between"
          margin="0 0 8px 0"
        >
          <p>Booked at</p>
          <p>
            {getDateWithTime(experience?.experienceClasses[0]?.startTimeStamp)}
          </p>
        </Flex>
      </CardBody>
    </Card>
  );
}
