import React from "react";
import { Flex } from "@dailykit/ui";
import { Card, CardImage, CardBody } from "./styles.js";
import { Clock } from "../../Icons";
import { theme } from "../../../theme.js";
import { getMinute } from "../../../utils/useUtils.js";

export default function NormalExperienceCard({ cardDetails, ...props }) {
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
          margin="0 0 4px 0"
        >
          <div className="expert-info-wrapper">
            <div className="expertImgDiv">
              <img
                className="expert-img"
                src={
                  experience?.experienceClasses[0]?.experienceClassExpert
                    ?.assets?.images[0]
                }
                alt="expert-img"
              />
            </div>
            <p className="expert-name">
              {
                experience?.experienceClasses[0]?.experienceClassExpert
                  ?.firstName
              }{" "}
              {
                experience?.experienceClasses[0]?.experienceClassExpert
                  ?.lastName
              }
            </p>
          </div>
          <span className="duration">
            <Clock size={theme.sizes.h6} color={theme.colors.textColor4} />
            <span>
              {getMinute(experience?.experienceClasses[0]?.duration)}
              min
            </span>
          </span>
        </Flex>
      </CardBody>
    </Card>
  );
}
