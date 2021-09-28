import React from "react";
import { Flex } from "@dailykit/ui";
import { Wrapper } from "./styles";
import { Button, AvailableDate, CalendarIcon } from "../../../components";
import { theme } from "../../../theme";
import { isEmpty } from "../../../utils";
import { usePoll } from "../../../Providers";

export default function SelectClass() {
  const {
    state: pollState,
    updatePollInfo,
    addToPollOptions,
    removeFromPollOptions,
  } = usePoll();
  const { pollType, classDates, selectedPollSlot, pollOptions } = pollState;

  const typeHandler = async (type) => {
    updatePollInfo({
      pollType: type,
    });
  };

  const btnSelectionHandler = async (info) => {
    const pollOptionIndex = pollOptions.findIndex(
      (option) =>
        option.selectedExperienceClassId === info.selectedExperienceClassId
    );
    if (pollOptionIndex !== -1) {
      removeFromPollOptions(pollOptionIndex);
    } else {
      addToPollOptions(info);
    }
  };
  return (
    <Wrapper>
      <h2 className="top-heading">Poll Experience</h2>
      <h2 className="heading">Select Poll Type</h2>
      <Flex container alignItems="center" margin="0 0 2rem 0 ">
        {pollType === "private" ? (
          <Button
            backgroundColor={
              pollType === "private"
                ? theme.colors.secondaryColor
                : theme.colors.mainBackground
            }
            isMainShadow
            className="customBtn"
            onClick={() => typeHandler("private")}
          >
            Private
          </Button>
        ) : (
          <Button
            backgroundColor={
              pollType === "public"
                ? theme.colors.secondaryColor
                : theme.colors.mainBackground
            }
            isMainShadow
            className="customBtn"
            onClick={() => typeHandler("public")}
          >
            Public
          </Button>
        )}
      </Flex>
      <Flex
        container
        alignItems="center"
        justifyContent="space-between"
        margin="0 0 12px 0 "
      >
        <span className="showAll">Showing all</span>
        <span className="calendarSpan">
          <CalendarIcon size={theme.sizes.h8} color={theme.colors.textColor} />
        </span>
      </Flex>
      <div className="availableDate">
        {classDates.map((classDate) => {
          return (
            <AvailableDate
              key={`${classDate?.date}-${classDate?.id}`}
              data={classDate}
              isMulti={true}
              multiOptions={pollOptions}
              onClick={(selectedBtnInfo) =>
                btnSelectionHandler(selectedBtnInfo)
              }
            />
          );
        })}
      </div>
    </Wrapper>
  );
}
