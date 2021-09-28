import React, { useState } from "react";
import { Flex } from "@dailykit/ui";
import { OptionDiv } from "./styles";
import { Input } from "../../../components";
import { getDate, getTime } from "../../../utils";
export default function BookingOption({
  option,
  selectedOptions = [],
  onOptionClick,
}) {
  return (
    <OptionDiv>
      <div className="slot-div">
        <Flex container alignItems="center">
          <label>
            <Input
              className="checkbox-inp"
              type="checkbox"
              customWidth="24px"
              customHeight="24px"
              checked={selectedOptions.some(
                (opt) => opt?.experienceBookingOptionId === option?.id
              )}
              onChange={(e) => onOptionClick(e)}
            />
          </label>
          <p className="slot-info-time">
            {getDate(option?.experienceClass?.startTimeStamp)},{" "}
            {getTime(option?.experienceClass?.startTimeStamp)}
          </p>
        </Flex>
        <p className="vote-head">{option?.voting?.aggregate?.count} votes</p>
      </div>
    </OptionDiv>
  );
}
