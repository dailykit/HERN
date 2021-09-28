import React from "react";
import { Flex } from "@dailykit/ui";
import { Card, CardImage, CardBody } from "./styles.js";
import { Clock } from "../../Icons";
import { theme } from "../../../theme.js";

export default function EmptyCard({ cardDetails }) {
  return (
    <Card>
      <CardImage></CardImage>
      <CardBody>
        <h2 className="exp-name">{cardDetails?.name}</h2>
        <Flex
          container
          alignItems="center"
          justifyContent="space-between"
          margin="0 0 4px 0"
        >
          <div className="expertImgDiv"></div>
          <span className="duration">
            <Clock size={theme.sizes.h6} color={theme.colors.textColor7} />
            <span></span>
          </span>
        </Flex>
        <p className="book-exp">Notify Me</p>
      </CardBody>
    </Card>
  );
}
