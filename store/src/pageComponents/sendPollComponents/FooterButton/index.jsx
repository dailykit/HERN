import React, { useEffect, useState } from "react";
import { Flex } from "@dailykit/ui";
import { FooterBtnWrap } from "./styles";
import { useCustomMutation } from "../../../customMutations/useCustomMutation";
import { Button } from "../../../components";
import { usePoll, useAuth } from "../../../Providers";
import { getTimeStamp } from "../../../utils";

export default function FooterButton({ confirmNPayHandler }) {
  const { EXPERIENCE_BOOKING } = useCustomMutation();
  const { state: pollState, nextPollingSteps } = usePoll();
  const [isDisabled, setIsDisabled] = useState(true);
  const { pollingStepsIndex, cutoffDate, pollOptions } = pollState;
  const { state: userState } = useAuth();
  const { user = {} } = userState;

  const handleNextButtonClick = async () => {
    if (pollingStepsIndex === 1) {
      if (pollOptions.length) {
        const bookingOptions = pollOptions.map((opt) => {
          return {
            experienceClassId: opt?.selectedExperienceClassId,
          };
        });
        EXPERIENCE_BOOKING.create.mutation({
          variables: {
            object: {
              hostKeycloakId: user?.keycloakId,
              cutoffTime: getTimeStamp(cutoffDate),
              experienceBookingOptions: {
                data: bookingOptions,
              },
              parentCart: {
                data: {
                  customerKeycloakId: user?.keycloakId,
                },
              },
            },
          },
        });
      }
    } else {
      nextPollingSteps(pollingStepsIndex);
    }
  };

  useEffect(() => {
    if (
      !cutoffDate ||
      pollOptions.length === 0 ||
      EXPERIENCE_BOOKING.create.loading
    ) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [pollOptions, EXPERIENCE_BOOKING.create.loading, cutoffDate]);

  return (
    <FooterBtnWrap>
      <Button
        disabled={
          pollingStepsIndex === 1 ? isDisabled : pollOptions.length === 0
        }
        className="nextBtn"
        onClick={handleNextButtonClick}
      >
        <Flex container alignItems="center" justifyContent="center">
          <div>
            {pollingStepsIndex === 1 ? "SEND AVAILABILITY POLL" : "Next"}
          </div>
        </Flex>
      </Button>
    </FooterBtnWrap>
  );
}
